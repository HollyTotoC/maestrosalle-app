"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface DisposWeekHeaderProps {
    weekStart: Date;
    weekEnd: Date;
    shiftsChecked: number;
    shiftsSouhaites: number;
    onPrevWeek: () => void;
    onNextWeek: () => void;
}

/**
 * Header de navigation semaine avec progress bar
 * Design dual-theme:
 * - Light: Glassmorphism avec progress bar classique
 * - Dark: Terminal retrofuturiste avec ASCII progress bar
 */
export default function DisposWeekHeader({
    weekStart,
    weekEnd,
    shiftsChecked,
    shiftsSouhaites,
    onPrevWeek,
    onNextWeek,
}: DisposWeekHeaderProps) {
    // Format la date pour affichage
    const formatDate = (date: Date) => {
        return date.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
        });
    };

    // Calcul du pourcentage
    const percentage = Math.round((shiftsChecked / 14) * 100);

    // Progress bar ASCII style terminal pour dark mode
    const totalBlocks = 14;
    const filledBlocks = Math.min(shiftsChecked, totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const asciiProgress = "▓".repeat(filledBlocks) + "░".repeat(emptyBlocks);

    return (
        <div
            className="
                bg-card/60 backdrop-blur-xl backdrop-saturate-150
                dark:bg-card dark:backdrop-blur-none
                p-4 md:p-6
                rounded-2xl dark:rounded
                border border-border/50 dark:border-2
                shadow-lg dark:shadow-sm
                transition-all duration-200 dark:duration-300
            "
        >
            {/* Navigation semaine */}
            <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrevWeek}
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
                    {formatDate(weekStart)} au {formatDate(weekEnd)}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextWeek}
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

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="dark:font-mono">
                        Shifts souhaités : {shiftsSouhaites}
                    </span>
                    <span className="dark:font-mono font-semibold">
                        {shiftsChecked}/14 cochés
                    </span>
                </div>

                {/* Light mode: Progress standard */}
                <div className="block dark:hidden">
                    <Progress value={percentage} className="h-2" />
                </div>

                {/* Dark mode: ASCII progress bar */}
                <div className="hidden dark:block">
                    <div
                        className="
                            font-mono text-sm tracking-wider
                            text-center
                            p-2
                            bg-black/30
                            border border-green-500/30
                            rounded-sm
                        "
                        style={{
                            letterSpacing: "0.1em",
                        }}
                    >
                        <span className="text-green-400">{asciiProgress}</span>
                    </div>
                </div>

                {/* Warning si écart important */}
                {shiftsChecked < shiftsSouhaites - 2 && (
                    <div className="text-xs text-warning dark:text-amber-400 text-center dark:font-mono">
                        ⚠ Vous avez coché moins de shifts que souhaité
                    </div>
                )}
            </div>
        </div>
    );
}
