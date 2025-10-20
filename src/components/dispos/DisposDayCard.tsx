"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { DispoDay } from "@/types/dispos";

interface DisposDayCardProps {
    dayName: string;
    dateStr: string;
    dispo: DispoDay;
    onChange: (shift: "midi" | "soir", field: "dispo" | "priorite", value: boolean | number) => void;
    disabled?: boolean;
}

/**
 * Card d'une journée avec design dual-theme:
 * - Light: Glassmorphism iOS-style
 * - Dark: Terminal retrofuturiste avec bordures marquées
 */
export default function DisposDayCard({
    dayName,
    dateStr,
    dispo,
    onChange,
    disabled = false,
}: DisposDayCardProps) {
    // Helper pour déterminer la classe de couleur selon priorité
    const getPriorityClass = (shift: "midi" | "soir") => {
        if (!dispo[shift].dispo) return "";

        const priorite = dispo[shift].priorite;
        switch (priorite) {
            case 1: // Forte
                return "bg-success/20 border-success text-success dark:bg-green-500/10 dark:border-green-400";
            case 2: // Normale
                return "bg-warning/20 border-warning text-warning dark:bg-amber-500/10 dark:border-amber-400";
            case 3: // Faible
                return "bg-muted/40 border-muted-foreground/30 text-muted-foreground dark:bg-gray-500/10 dark:border-gray-400";
            default:
                return "";
        }
    };

    const getPriorityLabel = (priorite: number) => {
        switch (priorite) {
            case 1:
                return "Forte";
            case 2:
                return "Normale";
            case 3:
                return "Faible";
            default:
                return "";
        }
    };

    return (
        <div
            className="
                bg-card/60 backdrop-blur-xl backdrop-saturate-150
                dark:bg-card dark:backdrop-blur-none
                p-4
                rounded-2xl dark:rounded
                border border-border/50 dark:border-2
                shadow-lg dark:shadow-sm
                transition-all duration-200 dark:duration-300
                hover:shadow-xl dark:hover:border-primary/50
            "
        >
            {/* En-tête jour */}
            <div className="mb-3 text-center">
                <h3 className="text-base font-bold leading-tight uppercase dark:font-mono">
                    {dayName}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
            </div>

            {/* Séparateur */}
            <div className="border-b border-border/30 dark:border-border/50 mb-3" />

            {/* Section Midi */}
            <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faSun} className="text-amber-500 dark:text-amber-400" />
                    <span className="text-sm font-semibold dark:font-mono">Midi</span>
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={dispo.midi.dispo}
                        onCheckedChange={(checked) =>
                            onChange("midi", "dispo", !!checked)
                        }
                        disabled={disabled}
                        aria-label="Disponible midi"
                    />
                    {dispo.midi.dispo && (
                        <Badge
                            className={`text-xs px-2 py-1 transition-all duration-200 dark:duration-300 ${getPriorityClass(
                                "midi"
                            )}`}
                        >
                            {getPriorityLabel(dispo.midi.priorite)}
                        </Badge>
                    )}
                </div>
                {dispo.midi.dispo && (
                    <div className="mt-2 flex gap-1">
                        {[
                            { value: 1, label: "Forte" },
                            { value: 2, label: "Norm." },
                            { value: 3, label: "Faib." },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => onChange("midi", "priorite", value)}
                                disabled={disabled}
                                className={`
                                    flex-1 text-xs py-1 px-1
                                    rounded dark:rounded-sm
                                    border transition-all duration-200 dark:duration-300
                                    dark:font-mono
                                    ${
                                        dispo.midi.priorite === value
                                            ? "bg-primary text-primary-foreground border-primary dark:border-primary"
                                            : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50 dark:hover:border-muted-foreground"
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                type="button"
                                aria-label={`Priorité ${label}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Section Soir */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={faMoon} className="text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-semibold dark:font-mono">Soir</span>
                </div>
                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={dispo.soir.dispo}
                        onCheckedChange={(checked) =>
                            onChange("soir", "dispo", !!checked)
                        }
                        disabled={disabled}
                        aria-label="Disponible soir"
                    />
                    {dispo.soir.dispo && (
                        <Badge
                            className={`text-xs px-2 py-1 transition-all duration-200 dark:duration-300 ${getPriorityClass(
                                "soir"
                            )}`}
                        >
                            {getPriorityLabel(dispo.soir.priorite)}
                        </Badge>
                    )}
                </div>
                {dispo.soir.dispo && (
                    <div className="mt-2 flex gap-1">
                        {[
                            { value: 1, label: "Forte" },
                            { value: 2, label: "Norm." },
                            { value: 3, label: "Faib." },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => onChange("soir", "priorite", value)}
                                disabled={disabled}
                                className={`
                                    flex-1 text-xs py-1 px-1
                                    rounded dark:rounded-sm
                                    border transition-all duration-200 dark:duration-300
                                    dark:font-mono
                                    ${
                                        dispo.soir.priorite === value
                                            ? "bg-primary text-primary-foreground border-primary dark:border-primary"
                                            : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50 dark:hover:border-muted-foreground"
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                type="button"
                                aria-label={`Priorité ${label}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
