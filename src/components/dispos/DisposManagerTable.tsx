// Composant planning manager/owner : tableau hebdo global des dispos
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { UserDispos } from "@/types/dispos";
import { useUsersStore } from "@/store/useUsersStore";
import { DisposCardsPlanning } from "@/components/dispos/DisposCardsPlanning";

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
    const usersStore = useUsersStore();

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
        const usersCol = collection(db, `disponibilites/${semaineUid}/users`);
        const unsubscribe = onSnapshot(
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
        return () => unsubscribe();
    }, [semaine]);

    // Semaine suivante/précédente
    const handleChangeSemaine = (offset: number) => {
        setSemaine((prev) => {
            const d = new Date(prev);
            d.setDate(prev.getDate() + offset * 7);
            return d;
        });
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
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold leading-tight">
                        Planning hebdo global
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Visualisez les disponibilités de l’équipe pour la
                        semaine sélectionnée. Alertes de sous-effectif et
                        filtrage par rôle disponibles.
                    </p>
                </div>
            </div>
            <Card className="max-w-5xl mx-auto mt-6">
                <CardContent className="px-6 flex flex-col justify-center py-4">
                    {/* Navigation semaine */}
                    <div className="flex items-center justify-center w-full gap-4 mb-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleChangeSemaine(-1)}
                            aria-label="Semaine précédente"
                        >
                            &lt;
                        </Button>
                        <span className="font-semibold">
                            {weekDates[0].toLocaleDateString()} au{" "}
                            {weekDates[6].toLocaleDateString()}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleChangeSemaine(1)}
                            aria-label="Semaine suivante"
                        >
                            &gt;
                        </Button>
                    </div>
                    {/* Filtres et actions */}
                    <div className="flex gap-4 mb-4 items-center">
                        <Label>Filtrer par rôle :</Label>
                        {roles.map((r) => (
                            <Button
                                key={r}
                                variant={filterRole === r ? "default" : "outline"}
                                size="sm"
                                onClick={() =>
                                    setFilterRole(filterRole === r ? null : r)
                                }
                            >
                                {r}
                            </Button>
                        ))}
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
