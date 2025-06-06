// Composant planning manager/owner : tableau hebdo global des dispos
"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import type { UserDispos } from "@/types/dispos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsersStore } from "@/store/useUsersStore";
import { Badge } from "@/components/ui/badge";

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

    // Récupère les dispos Firestore pour la semaine
    useEffect(() => {
        async function fetchDispos() {
            setLoading(true);
            setError(null);
            try {
                const semaineUid = semaine.toISOString().slice(0, 10);
                const usersCol = collection(
                    db,
                    `disponibilites/${semaineUid}/users`
                );
                const snap = await getDocs(usersCol);
                const data: Record<
                    string,
                    { userId: string; data: UserDispos }[]
                > = {};
                snap.forEach((doc) => {
                    const userData = doc.data() as UserDispos;
                    Object.entries(userData.disponibilites).forEach(
                        ([dateISO]) => {
                            if (!data[dateISO]) data[dateISO] = [];
                            data[dateISO].push({
                                userId: doc.id,
                                data: userData,
                            });
                        }
                    );
                });
                setDispos(data);
            } catch {
                setError("Erreur lors du chargement des disponibilités");
            } finally {
                setLoading(false);
            }
        }
        fetchDispos();
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
                {/* Navigation semaine */}
                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleChangeSemaine(-1)}
                        aria-label="Semaine précédente"
                    >
                        &lt;
                    </Button>
                    <span className="font-semibold text-sm">
                        {weekDates[0].toLocaleDateString()} au{" "}
                        {weekDates[6].toLocaleDateString()}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleChangeSemaine(1)}
                        aria-label="Semaine suivante"
                    >
                        &gt;
                    </Button>
                </div>
            </div>
            <Card className="max-w-5xl mx-auto mt-6">
                <CardContent className="px-6 py-4">
                    {/* Filtres et actions */}
                    <div className="flex gap-4 mb-2 items-center">
                        <Label>Filtrer par rôle :</Label>
                        {roles.map((r) => (
                            <Button
                                key={r}
                                variant={
                                    filterRole === r ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                    setFilterRole(filterRole === r ? null : r)
                                }
                            >
                                {r}
                            </Button>
                        ))}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm bg-white dark:bg-zinc-900 rounded shadow">
                            <thead>
                                <tr>
                                    <th className="border px-2 py-1 bg-muted/60">
                                        Service
                                    </th>
                                    {jours.map((jour, i) => (
                                        <th
                                            key={jour}
                                            className="border px-2 py-1 text-center bg-muted/60 font-semibold"
                                        >
                                            {jour}
                                            <br />
                                            <span className="text-xs text-muted-foreground">
                                                {weekDates[
                                                    i
                                                ].toLocaleDateString()}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {shifts.map((shift) => (
                                    <tr key={shift}>
                                        <td className="border px-2 py-1 font-semibold text-right bg-muted/40">
                                            {shift === "midi" ? "Midi" : "Soir"}
                                        </td>
                                        {weekDates.map((date) => {
                                            const iso = date
                                                .toISOString()
                                                .slice(0, 10);
                                            const users = filterByRole(
                                                dispos[iso] || []
                                            );
                                            const staffCount = users.filter(
                                                (u) =>
                                                    u.data.disponibilites[
                                                        iso
                                                    ]?.[
                                                        shift as "midi" | "soir"
                                                    ]?.dispo
                                            ).length;
                                            const isAlert =
                                                staffCount < STAFF_MIN;
                                            return (
                                                <td
                                                    key={iso}
                                                    className={`border px-2 py-1 align-top ${
                                                        isAlert
                                                            ? "bg-red-100 dark:bg-red-900"
                                                            : ""
                                                    }`}
                                                >
                                                    {isAlert && (
                                                        <span className="text-red-500 flex items-center gap-1 text-xs mb-1">
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faTriangleExclamation
                                                                }
                                                            />{" "}
                                                            Sous-effectif
                                                        </span>
                                                    )}
                                                    <ul className="space-y-1">
                                                        {users
                                                            .filter(
                                                                (u) =>
                                                                    u.data
                                                                        .disponibilites[
                                                                        iso
                                                                    ]?.[
                                                                        shift as
                                                                            | "midi"
                                                                            | "soir"
                                                                    ]?.dispo
                                                            )
                                                            .sort(
                                                                (a, b) =>
                                                                    (a.data
                                                                        .disponibilites[
                                                                        iso
                                                                    ][
                                                                        shift as
                                                                            | "midi"
                                                                            | "soir"
                                                                    ]
                                                                        .priorite ||
                                                                        3) -
                                                                    (b.data
                                                                        .disponibilites[
                                                                        iso
                                                                    ][
                                                                        shift as
                                                                            | "midi"
                                                                            | "soir"
                                                                    ]
                                                                        .priorite ||
                                                                        3)
                                                            )
                                                            .map((u) => {
                                                                const userMeta =
                                                                    usersStore.users[u.userId];
                                                                const displayName =
                                                                    userMeta?.displayName ||
                                                                    u.userId;
                                                                const avatarUrl =
                                                                    userMeta?.avatarUrl ||
                                                                    undefined;
                                                                const role = u.data.role;
                                                                const priorite =
                                                                    u.data
                                                                        .disponibilites[
                                                                        iso
                                                                    ][
                                                                        shift as
                                                                            | "midi"
                                                                            | "soir"
                                                                    ].priorite;
                                                                return (
                                                                    <li key={u.userId}>
  <Badge className={`inline-flex items-center gap-2 px-2 py-1 border text-xs font-medium min-w-[110px] ${priorite === 1 ? "bg-green-200 text-green-800" : priorite === 2 ? "bg-yellow-200 text-yellow-800" : "bg-gray-200 text-gray-800"}`}>
    <Avatar className="w-5 h-5">
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={displayName} />
      ) : (
        <AvatarFallback className="flex">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      )}
    </Avatar>
    <span className="font-semibold leading-tight">{displayName}</span>
    <Badge variant="secondary" className="ml-1  text-[11px] font-semibold uppercase tracking-wide shadow-sm border-blue-700">
      {role}
    </Badge>
  </Badge>
</li>
                                                                );
                                                            })}
                                                    </ul>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
