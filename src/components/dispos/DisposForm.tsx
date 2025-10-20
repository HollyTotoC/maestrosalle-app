"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import type { DispoDay, DispoPreference, UserDispos, WeekLock } from "@/types/dispos";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleGroup, faLock } from "@fortawesome/free-solid-svg-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useUserStore } from "@/store/useUserStore";
import DisposDayCard from "./DisposDayCard";
import DisposWeekHeader from "./DisposWeekHeader";
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

const preferenceOptions = [
    { value: "journée", label: "Journée complète" },
    { value: "demi", label: "Demi-journée" },
    { value: "aucune", label: "Sans préférence" },
];

interface DisposFormProps {
    initialData?: UserDispos;
    onSubmit: (data: UserDispos) => void;
}

const DisposForm: React.FC<DisposFormProps> = ({ initialData, onSubmit }) => {
    // Semaine sélectionnée (par défaut semaine courante, toujours lundi)
    const [semaine, setSemaine] = useState(() => {
        const today = new Date();
        const day = today.getDay();
        if (day === 0) {
            today.setDate(today.getDate() + 1);
        } else {
            today.setDate(today.getDate() - (day - 1));
        }
        today.setHours(0, 0, 0, 0);
        return today;
    });

    const [shiftsSouhaites, setShiftsSouhaites] = useState(
        initialData?.shiftsSouhaites || 5
    );

    const [preference, setPreference] = useState<DispoPreference>(
        initialData?.preference || "aucune"
    );

    const [disponibilites, setDisponibilites] = useState<{
        [dateISO: string]: DispoDay;
    }>(() => {
        const base: { [dateISO: string]: DispoDay } = {};
        const monday = new Date(semaine);
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const iso = d.toISOString().slice(0, 10);
            base[iso] = {
                midi: { dispo: false, priorite: 1 },
                soir: { dispo: false, priorite: 1 },
            };
        }
        return initialData?.disponibilites || base;
    });

    const [weekLock, setWeekLock] = useState<WeekLock>({
        isLocked: false,
    });

    // User
    const userId = useUserStore((state) => state.userId);

    const handleDispoChange = (
        dateISO: string,
        shift: "midi" | "soir",
        field: "dispo" | "priorite",
        value: boolean | number
    ) => {
        setDisponibilites((prev) => ({
            ...prev,
            [dateISO]: {
                ...prev[dateISO],
                [shift]: {
                    ...prev[dateISO][shift],
                    [field]: value,
                },
            },
        }));
    };

    const handleChangeSemaine = (offset: number) => {
        setSemaine((prev) => {
            const d = new Date(prev);
            d.setDate(prev.getDate() + offset * 7);
            d.setHours(0, 0, 0, 0);
            return d;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (weekLock.isLocked) {
            toast.error("Cette semaine est verrouillée. Vous ne pouvez plus modifier vos disponibilités.");
            return;
        }

        onSubmit({
            role: initialData?.role || "CDI",
            shiftsSouhaites,
            preference,
            disponibilites,
            semaineStart: monday,
            semaineEnd: weekDates[6],
        });
    };

    const monday = new Date(semaine);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return d;
    });

    // Chargement des dispos Firestore pour la semaine et l'utilisateur + lock status
    useEffect(() => {
        async function fetchData() {
            if (!userId) return;

            const semaineUid = semaine.toISOString().slice(0, 10);

            // Charger les dispos utilisateur
            const userRef = doc(db, `disponibilites/${semaineUid}/users`, userId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data() as UserDispos;
                setShiftsSouhaites(data.shiftsSouhaites || 5);
                setPreference(data.preference || "aucune");
                setDisponibilites(data.disponibilites || {});
            } else {
                // Reset si pas de données
                const base: { [dateISO: string]: DispoDay } = {};
                const monday = new Date(semaine);
                for (let i = 0; i < 7; i++) {
                    const d = new Date(monday);
                    d.setDate(monday.getDate() + i);
                    const iso = d.toISOString().slice(0, 10);
                    base[iso] = {
                        midi: { dispo: false, priorite: 1 },
                        soir: { dispo: false, priorite: 1 },
                    };
                }
                setShiftsSouhaites(5);
                setPreference("aucune");
                setDisponibilites(base);
            }

            // Charger le lock status
            const lockRef = doc(db, `disponibilites/${semaineUid}/metadata`, "lock");
            const lockSnap = await getDoc(lockRef);

            if (lockSnap.exists()) {
                setWeekLock(lockSnap.data() as WeekLock);
            } else {
                setWeekLock({ isLocked: false });
            }
        }
        fetchData();
    }, [semaine, userId]);

    // Comptage des shifts cochés
    const shiftsChecked = Object.values(disponibilites).reduce(
        (acc, day) => {
            return acc + (day.midi.dispo ? 1 : 0) + (day.soir.dispo ? 1 : 0);
        },
        0
    );

    const isFormDisabled = weekLock.isLocked;

    return (
        <>
            <div className="mb-6 flex items-center gap-3">
                <span className="text-2xl text-primary">
                    <FontAwesomeIcon icon={faPeopleGroup} />
                </span>
                <div>
                    <h2 className="text-xl font-bold leading-tight dark:font-mono">
                        Disponibilités Hebdo
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Déclarez vos disponibilités pour la semaine à venir
                    </p>
                </div>
            </div>

            {weekLock.isLocked && (
                <div
                    className="
                        mb-4 p-4
                        bg-warning/10 border border-warning
                        dark:bg-amber-500/10 dark:border-amber-400
                        rounded-lg dark:rounded-sm
                        text-warning dark:text-amber-400
                        text-sm dark:font-mono
                    "
                >
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Cette semaine est verrouillée. Vous ne pouvez plus modifier vos
                    disponibilités.
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Week Header avec progress bar */}
                <DisposWeekHeader
                    weekStart={weekDates[0]}
                    weekEnd={weekDates[6]}
                    shiftsChecked={shiftsChecked}
                    shiftsSouhaites={shiftsSouhaites}
                    onPrevWeek={() => handleChangeSemaine(-1)}
                    onNextWeek={() => handleChangeSemaine(1)}
                />

                {/* Section Préférences */}
                <div
                    className="
                        bg-card/60 backdrop-blur-xl backdrop-saturate-150
                        dark:bg-card dark:backdrop-blur-none
                        p-4 md:p-6
                        rounded-2xl dark:rounded
                        border border-border/50 dark:border-2
                        shadow-lg dark:shadow-sm
                        transition-all duration-200 dark:duration-300
                        grid grid-cols-1 md:grid-cols-2 gap-4
                    "
                >
                    {/* Shifts souhaités */}
                    <div>
                        <Label
                            htmlFor="shiftsSouhaites"
                            className="block mb-2 dark:font-mono"
                        >
                            Shifts souhaités
                        </Label>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label="Retirer un shift"
                                onClick={() =>
                                    setShiftsSouhaites((v) => Math.max(1, v - 1))
                                }
                                disabled={isFormDisabled}
                                className="rounded-lg dark:rounded-sm"
                            >
                                -
                            </Button>
                            <Input
                                id="shiftsSouhaites"
                                type="number"
                                min={1}
                                max={14}
                                value={shiftsSouhaites}
                                onChange={(e) =>
                                    setShiftsSouhaites(Number(e.target.value))
                                }
                                disabled={isFormDisabled}
                                className="w-20 text-center dark:font-mono"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label="Ajouter un shift"
                                onClick={() =>
                                    setShiftsSouhaites((v) => Math.min(14, v + 1))
                                }
                                disabled={isFormDisabled}
                                className="rounded-lg dark:rounded-sm"
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    {/* Préférence */}
                    <div>
                        <Label
                            htmlFor="preference"
                            className="block mb-2 dark:font-mono"
                        >
                            Préférence de disponibilité
                        </Label>
                        <select
                            id="preference"
                            value={preference}
                            onChange={(e) =>
                                setPreference(e.target.value as DispoPreference)
                            }
                            disabled={isFormDisabled}
                            className="
                                w-full
                                border border-border
                                rounded-lg dark:rounded-sm
                                px-3 py-2
                                bg-background
                                text-foreground
                                dark:font-mono
                                transition-all duration-200 dark:duration-300
                            "
                            title="Préférence de disponibilité"
                        >
                            {preferenceOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Grid de cards par jour */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {weekDates.map((date, i) => {
                        const iso = date.toISOString().slice(0, 10);
                        const dateStr = date.toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                        });

                        // Assurer que la dispo existe pour cette date
                        const dispo = disponibilites[iso] || {
                            midi: { dispo: false, priorite: 1 },
                            soir: { dispo: false, priorite: 1 },
                        };

                        return (
                            <DisposDayCard
                                key={iso}
                                dayName={jours[i]}
                                dateStr={dateStr}
                                dispo={dispo}
                                onChange={(shift, field, value) =>
                                    handleDispoChange(iso, shift, field, value)
                                }
                                disabled={isFormDisabled}
                            />
                        );
                    })}
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isFormDisabled}
                        className="
                            rounded-lg dark:rounded-sm
                            dark:font-mono
                            transition-all duration-200 dark:duration-300
                        "
                    >
                        Soumettre mes dispos
                    </Button>
                </div>
            </form>
        </>
    );
};

export default DisposForm;
