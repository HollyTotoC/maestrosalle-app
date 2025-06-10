import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

/**
 * Planning "cards" par jour, pour une vue compacte et responsive.
 * Props attendues :
 * - weekDates : tableau de dates JS (1 par jour)
 * - shifts : ["midi", "soir"]
 * - jours : ["Lundi", ...]
 * - getShiftUsers(iso, shift) => liste users filtrés/triés
 * - STAFF_MIN : seuil d'alerte
 */
export function DisposCardsPlanning({
    weekDates,
    jours,
    shifts,
    getShiftUsers,
    STAFF_MIN = 2,
}: {
    weekDates: Date[];
    jours: string[];
    shifts: string[];
    getShiftUsers: (
        iso: string,
        shift: string
    ) => Array<{
        userId: string;
        displayName: string;
        avatarUrl?: string;
        role: string;
        priorite?: number;
    }>;
    STAFF_MIN?: number;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
            {weekDates.map((date, i) => {
                const iso = date.toISOString().slice(0, 10);
                return (
                    <Card
                        key={iso}
                        className="w-full flex-1 min-w-0"
                    >
                        <CardContent className="p-3 flex flex-col gap-2">
                            <div className="flex flex-col items-center mb-1">
                                <span className="text-base font-bold leading-tight">
                                    {jours[i]}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {date.toLocaleDateString()}
                                </span>
                            </div>
                            {shifts.map((shift) => {
                                const users = getShiftUsers(iso, shift);
                                const staffCount = users.length;
                                const isAlert = staffCount < STAFF_MIN;
                                return (
                                    <div key={shift} className="mb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-sm capitalize">
                                                {shift}
                                            </span>
                                            {isAlert && (
                                                <span className="text-red-500 flex items-center gap-1 text-xs">
                                                    <FontAwesomeIcon
                                                        icon={faTriangleExclamation}
                                                    />{" "}
                                                    Sous-effectif
                                                </span>
                                            )}
                                        </div>
                                        <ul className="flex flex-col gap-1">
                                            {users.length === 0 ? (
                                                <li>
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Aucun
                                                    </span>
                                                </li>
                                            ) : (
                                                users.map((u) => {
                                                    const {
                                                        displayName,
                                                        avatarUrl,
                                                        role,
                                                        priorite,
                                                    } = u;
                                                    return (
                                                        <li key={u.userId}>
                                                            <Badge
                                                                className={`inline-flex items-center gap-2 px-2 py-1 border text-xs font-medium min-w-[110px] ${
                                                                    priorite ===
                                                                    1
                                                                        ? "bg-green-200 text-green-800"
                                                                        : priorite ===
                                                                          2
                                                                        ? "bg-yellow-200 text-yellow-800"
                                                                        : "bg-gray-200 text-gray-800"
                                                                }`}
                                                            >
                                                                <Avatar className="w-4 h-4">
                                                                    {avatarUrl ? (
                                                                        <AvatarImage
                                                                            src={avatarUrl}
                                                                            alt={displayName}
                                                                        />
                                                                    ) : (
                                                                        <AvatarFallback>
                                                                            {displayName
                                                                                .slice(
                                                                                    0,
                                                                                    2
                                                                                )
                                                                                .toUpperCase()}
                                                                        </AvatarFallback>
                                                                    )}
                                                                </Avatar>
                                                                <span className="font-semibold leading-tight truncate max-w-[70px]">
                                                                    {displayName}
                                                                </span>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="ml-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm border-blue-700"
                                                                >
                                                                    {role}
                                                                </Badge>
                                                            </Badge>
                                                        </li>
                                                    );
                                                })
                                            )}
                                        </ul>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
