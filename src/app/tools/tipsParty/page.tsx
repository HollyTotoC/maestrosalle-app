"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAppStore } from "@/store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingDollar } from "@fortawesome/free-solid-svg-icons";

export default function TipsParty() {
    const [staffCount, setStaffCount] = useState<number>(0);
    const [totalTips, setTotalTips] = useState<number>(0);

            const hasHydrated = useAppStore((state) => state.hasHydrated);
        
            if (!hasHydrated) return null; // Avoid UI flicker
    

    const calculateTips = (totalTips: number, staffCount: number) => {
        let kitchenShare = 0;
        let tipPerStaff = 0;

        if (staffCount > 2) {
            kitchenShare = totalTips * 0.3;
            tipPerStaff = (totalTips * 0.7) / staffCount;
        } else {
            kitchenShare = totalTips / (staffCount + 1);
            tipPerStaff = kitchenShare;
        }

        // Arrondir les montants à 10 centimes
        const roundToNearest = (value: number, precision: number) => {
            return Math.round(value / precision) * precision;
        };

        const roundedTipPerStaff = roundToNearest(tipPerStaff, 0.1); // Arrondi à 10 centimes
        const roundedKitchenShare = roundToNearest(kitchenShare, 0.1); // Arrondi à 10 centimes

        // Calculer la petite monnaie restante
        const totalRoundedTips =
            roundedKitchenShare + roundedTipPerStaff * staffCount;
        const leftover = totalTips - totalRoundedTips;

        // Ajouter la petite monnaie restante à la part de la cuisine
        const finalKitchenShare = roundedKitchenShare + leftover;

        return {
            kitchenShare: parseFloat(finalKitchenShare.toFixed(2)),
            tipPerStaff: parseFloat(roundedTipPerStaff.toFixed(2)),
        };
    };

    const tipsResult = calculateTips(totalTips, staffCount);

    const pieData = [
        {
            name: "Part Cuisine",
            value: tipsResult.kitchenShare,
            color: "hsla(176, 88%, 22%, 1)",
        },
        ...Array.from({ length: staffCount }, (_, index) => ({
            name: `Serveur ${index + 1}`,
            value: tipsResult.tipPerStaff,
            color: `hsla(360, 74%, ${66 - index * (40 / staffCount)}%, 1)`,
        })),
    ];

    return (
        <div className="flex flex-col min-h-screen w-full">
            <Navbar />
            <main className="p-4 md:p-6 flex flex-col gap-4 grow max-w-4xl mx-auto w-full">
                {/* Container glassmorphism - Mini-App wrapper */}
                <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                            <FontAwesomeIcon icon={faHandHoldingDollar} className="text-primary" />
                            Partage des Pourboires
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Calculez la répartition équitable des pourboires entre la salle et la cuisine
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                <Card className="max-w-md w-full bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                    <CardHeader>
                        <CardTitle>Partage des Pourboires</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="staffCount">
                                Nombre de serveurs
                            </Label>
                            <Input
                                id="staffCount"
                                type="number"
                                value={staffCount}
                                onChange={(e) =>
                                    setStaffCount(Number(e.target.value))
                                }
                                placeholder="Ex: 3"
                            />
                        </div>
                        <div>
                            <Label htmlFor="totalTips">
                                Montant total des pourboires
                            </Label>
                            <Input
                                id="totalTips"
                                type="number"
                                value={totalTips}
                                onChange={(e) =>
                                    setTotalTips(Number(e.target.value))
                                }
                                placeholder="Ex: 120"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Affiche la deuxième carte uniquement si les champs sont remplis */}
                {staffCount > 0 && totalTips > 0 && (
                    <Card className="max-w-md w-full mb-5 bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                        <CardHeader>
                            <CardTitle>Répartition des Pourboires</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center">
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                            <p>
                                <span className="font-semibold">
                                    Pourboires totaux :
                                </span>{" "}
                                {totalTips} €
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Part Cuisine :
                                </span>{" "}
                                {tipsResult.kitchenShare} €
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Pourboires par serveur :
                                </span>{" "}
                                {tipsResult.tipPerStaff} €
                            </p>
                        </CardContent>
                    </Card>
                )}
                    </div>
                </div>
            </main>
        </div>
    );
}
