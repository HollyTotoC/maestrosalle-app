// Composant planning manager/owner : tableau hebdo global des dispos
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faLock,
    faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { collection, onSnapshot, doc, getDoc, setDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { UserDispos, WeekLock } from "@/types/dispos";
import { useUsersStore } from "@/store/useUsersStore";
import { useUserStore } from "@/store/useUserStore";
import { DisposCardsPlanning } from "@/components/dispos/DisposCardsPlanning";
import { toast } from "sonner";

const jours = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
];
const shifts = ["midi", "soir"];
const roles = ["CDI", "extra"];
const STAFF_MIN = 2; // seuil d'alerte

function getMonday(d: Date) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

export default function DisposManagerTable() {
    const [semaine, setSemaine] = useState(() => getMonday(new Date()));
    const [dispos, setDispos] = useState<
        Record<string, { userId: string; data: UserDispos }[]>
    >({});
    const [filterRole, setFilterRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weekLock, setWeekLock] = useState<WeekLock>({
        isLocked: false,
    });
    const usersStore = useUsersStore();
    const userId = useUserStore((state) => state.userId);
    const isAdmin = useUserStore((state) => state.isAdmin);
    const role = useUserStore((state) => state.role);

    // Peut verrouiller si admin, owner ou manager
    const canLockWeek = isAdmin || role === "admin" || role === "manager";

    // Génère les dates de la semaine sélectionnée
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(semaine);
        d.setDate(semaine.getDate() + i);
        return d;
    });

    // Récupère les dispos Firestore pour la semaine (écoute temps réel)
    useEffect(() => {
        setLoading(true);
        setError(null);
        const semaineUid = semaine.toISOString().slice(0, 10);

        // Charger les dispos
        const usersCol = collection(db, `disponibilites/${semaineUid}/users`);
        const unsubscribeDispos = onSnapshot(
            usersCol,
            (snap) => {
                const data: Record<string, { userId: string; data: UserDispos }[]> = {};
                snap.forEach((doc) => {
                    const userData = doc.data() as UserDispos;
                    Object.entries(userData.disponibilites).forEach(([dateISO]) => {
                        if (!data[dateISO]) data[dateISO] = [];
                        data[dateISO].push({
                            userId: doc.id,
                            data: userData,
                        });
                    });
                });
                setDispos(data);
                setLoading(false);
            },
            () => {
                setError("Erreur lors du chargement des disponibilités");
                setLoading(false);
            }
        );

        // Charger le lock status
        const lockRef = doc(db, `disponibilites/${semaineUid}/metadata`, "lock");
        const unsubscribeLock = onSnapshot(
            lockRef,
            (snap) => {
                if (snap.exists()) {
                    setWeekLock(snap.data() as WeekLock);
                } else {
                    setWeekLock({ isLocked: false });
                }
            }
        );

        return () => {
            unsubscribeDispos();
            unsubscribeLock();
        };
    }, [semaine]);

    // Semaine suivante/précédente
    const handleChangeSemaine = (offset: number) => {
        setSemaine((prev) => {
            const d = new Date(prev);
            d.setDate(prev.getDate() + offset * 7);
            return d;
        });
    };

    // Toggle verrouillage semaine
    const handleToggleLock = async () => {
        if (!canLockWeek || !userId) {
            toast.error("Vous n'avez pas les permissions pour verrouiller cette semaine");
            return;
        }

        const semaineUid = semaine.toISOString().slice(0, 10);
        const lockRef = doc(db, `disponibilites/${semaineUid}/metadata`, "lock");

        // Si on verrouille, on ajoute lockedBy et lockedAt
        // Si on déverrouille, on les supprime avec deleteField()
        const newLockState: Record<string, any> = {
            isLocked: !weekLock.isLocked,
        };

        if (!weekLock.isLocked) {
            // Verrouillage : ajouter les champs
            newLockState.lockedBy = userId;
            newLockState.lockedAt = new Date();
        } else {
            // Déverrouillage : supprimer les champs
            newLockState.lockedBy = deleteField();
            newLockState.lockedAt = deleteField();
        }

        try {
            await setDoc(lockRef, newLockState, { merge: true });
            toast.success(
                !weekLock.isLocked
                    ? "Semaine verrouillée. Les utilisateurs ne peuvent plus modifier leurs disponibilités."
                    : "Semaine déverrouillée. Les utilisateurs peuvent à nouveau modifier leurs disponibilités."
            );
        } catch (error) {
            toast.error("Erreur lors du verrouillage");
            console.error(error);
        }
    };

    // Filtrage par rôle
    const filterByRole = (users: { userId: string; data: UserDispos }[]) => {
        if (!filterRole) return users;
        return users.filter((u) => u.data.role === filterRole);
    };

    // Nouvelle fonction utilitaire pour la vue cards
    function getShiftUsers(iso: string, shift: string) {
        const users = filterByRole(dispos[iso] || []);
        return users
            .filter(
                (u) =>
                    u.data.disponibilites[iso]?.[shift as "midi" | "soir"]?.dispo
            )
            .sort(
                (a, b) =>
                    (a.data.disponibilites[iso][shift as "midi" | "soir"].priorite || 3) -
                    (b.data.disponibilites[iso][shift as "midi" | "soir"].priorite || 3)
            )
            .map((u) => {
                const userMeta = usersStore.users[u.userId];
                return {
                    userId: u.userId,
                    displayName: userMeta?.displayName || u.userId,
                    avatarUrl: userMeta?.avatarUrl || undefined,
                    role: u.data.role,
                    priorite: u.data.disponibilites[iso][shift as "midi" | "soir"].priorite,
                };
            });
    }

    return (
        <>
            {/* Header harmonisé */}
            <div className="mb-6 flex items-center gap-3">
                <span className="text-2xl text-primary">
                    <FontAwesomeIcon icon={faCalendarDays} />
                </span>
                <div>
                    <h2 className="text-xl font-bold leading-tight dark:font-mono">
                        Planning Hebdo Global
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Visualisez les disponibilités de l'équipe et gérez le verrouillage de la semaine
                    </p>
                </div>
            </div>

            <Card className="max-w-5xl mx-auto">
                <CardContent className="px-6 py-4">
                    {/* Navigation semaine */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeSemaine(-1)}
                            className="
                                rounded-lg dark:rounded-sm
                                transition-all duration-200 dark:duration-300
                                dark:font-mono
                            "
                            aria-label="Semaine précédente"
                        >
                            ◄
                        </Button>
                        <span className="text-sm font-semibold dark:font-mono min-w-[200px] text-center">
                            {weekDates[0].toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                            })}{" "}
                            au{" "}
                            {weekDates[6].toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                            })}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangeSemaine(1)}
                            className="
                                rounded-lg dark:rounded-sm
                                transition-all duration-200 dark:duration-300
                                dark:font-mono
                            "
                            aria-label="Semaine suivante"
                        >
                            ►
                        </Button>
                    </div>
                    {/* Filtres et actions */}
                    <div className="flex gap-4 mb-4 items-center justify-between flex-wrap">
                        <div className="flex gap-4 items-center">
                            <Label className="dark:font-mono">Filtrer par rôle :</Label>
                            {roles.map((r) => (
                                <Button
                                    key={r}
                                    variant={filterRole === r ? "default" : "outline"}
                                    size="sm"
                                    onClick={() =>
                                        setFilterRole(filterRole === r ? null : r)
                                    }
                                    className="
                                        rounded-lg dark:rounded-sm
                                        dark:font-mono
                                        transition-all duration-200 dark:duration-300
                                    "
                                >
                                    {r}
                                </Button>
                            ))}
                        </div>
                        {canLockWeek && (
                            <Button
                                type="button"
                                variant={weekLock.isLocked ? "default" : "outline"}
                                size="sm"
                                onClick={handleToggleLock}
                                className="
                                    rounded-lg dark:rounded-sm
                                    dark:font-mono
                                    transition-all duration-200 dark:duration-300
                                "
                                aria-label={
                                    weekLock.isLocked
                                        ? "Déverrouiller la semaine"
                                        : "Verrouiller la semaine"
                                }
                            >
                                <FontAwesomeIcon
                                    icon={weekLock.isLocked ? faLock : faLockOpen}
                                    className="mr-2"
                                />
                                {weekLock.isLocked ? "Semaine verrouillée" : "Verrouiller semaine"}
                            </Button>
                        )}
                    </div>
                    {/* Vue cards planning */}
                    <DisposCardsPlanning
                        weekDates={weekDates}
                        jours={jours}
                        shifts={shifts}
                        getShiftUsers={getShiftUsers}
                        STAFF_MIN={STAFF_MIN}
                    />
                    {loading && (
                        <div className="text-center text-muted-foreground mt-2">
                            Chargement…
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-500 mt-2">
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
