"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

export default function TipsParty() {
    const [staffCount, setStaffCount] = useState<number>(0);
    const [totalTips, setTotalTips] = useState<number>(0);

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
            color: "#4CAF50",
        },
        ...Array.from({ length: staffCount }, (_, index) => ({
            name: `Serveur ${index + 1}`,
            value: tipsResult.tipPerStaff,
            color: `hsl(${(index * 50) / staffCount}, 70%, 50%)`,
        })),
    ];

    return (
        <div className="flex flex-col items-center min-h-screen w-full">
            <Navbar />
            <main className="p-4 flex flex-col gap-2 grow">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Partage des Pourboires</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label className="block font-semibold mb-1">
                                Nombre de serveurs
                            </label>
                            <Input
                                type="number"
                                value={staffCount}
                                onChange={(e) =>
                                    setStaffCount(Number(e.target.value))
                                }
                                placeholder="Ex: 3"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">
                                Montant total des pourboires
                            </label>
                            <Input
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
                    <Card className="max-w-md w-full mb-5">
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
            </main>
        </div>
    );
}
