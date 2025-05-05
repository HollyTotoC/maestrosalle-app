"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { FormData, ClosureData } from "@/types/cloture"; // Import des types
import { useUserStore } from "@/store/useUserStore";

export default function Step8({
    prevStep,
    formData,
    onSave,
}: {
    prevStep: () => void;
    formData: FormData;
    onSave: (data: ClosureData) => void;
}) {
    const userId = useUserStore((state) => state.userId);
    const handleSave = async () => {
        if (!userId) {
            console.error("Utilisateur non authentifié.");
            return;
          }
        try {
            const timestamp = new Date().toISOString();
            const closureData: ClosureData = {
                ...formData,
                validatedBy: userId || "unknown",
                timestamp,
            };

            onSave(closureData);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des données :", error);
            alert("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
        }
    };

    const pieDataCash = [
        {
            name: "Montant laissé en caisse",
            value: formData.cashToKeep,
            color: "#03A9F4",
        },
        {
            name: "Entrées/Sorties Supplémentaires",
            value: formData.extraFlowEntries.reduce(
                (sum, entry) => sum + entry.amount,
                0
            ),
            color: "#F44336",
        },
        {
            name: "Montant versé au coffre (hors extra)",
            value:
                (formData.cashToSafe ?? 0) -
                formData.extraFlowEntries.reduce(
                    (sum, entry) => sum + entry.amount,
                    0
                ),
            color: "#4CAF50",
        },
    ];

    const isLoading = !formData;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Chargement...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center gap-3">
            {/* Informations Générales */}
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Informations Générales</CardTitle>
                    <CardDescription>Détails de la clôture</CardDescription>
                </CardHeader>
                <CardContent className="flex w-full justify-between gap-2">
                    <p>
                        <span className="font-semibold">Date :</span>{" "}
                        {formData.date
                            ? formData.date.toLocaleDateString()
                            : "Non défini"}
                    </p>
                </CardContent>
            </Card>

            {/* Écarts */}
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Écarts</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Écart CB */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between w-full gap-2">
                            <p className="font-semibold">Écart CD :</p>
                            <p
                                className={
                                    formData.cbStatus === "OK"
                                        ? "text-green-500"
                                        : "text-yellow-500"
                                }
                            >
                                {formData.tpeDiscrepancy} € ({formData.cbStatus}
                                )
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Zelty</span>
                            <div className="flex-1">
                                <Progress
                                    value={
                                        50 +
                                        ((formData.tpeDiscrepancy ?? 0) /
                                            ((formData.cbZelty ?? 0) +
                                                Math.abs(
                                                    formData.tpeDiscrepancy ?? 0
                                                ))) *
                                            50
                                    }
                                    className="w-full"
                                />
                            </div>
                            <span className="text-sm text-gray-500">TPE</span>
                        </div>
                    </div>

                    {/* Écart Espèces */}
                    <div>
                        <div className="flex items-center justify-between w-full gap-2">
                            <p className="font-semibold">Écart Espèces :</p>
                            <p
                                className={
                                    formData.cashStatus === "OK"
                                        ? "text-green-500"
                                        : "text-yellow-500"
                                }
                            >
                                {formData.cashDiscrepancy} € (
                                {formData.cashStatus})
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Zelty</span>
                            <div className="flex-1">
                                <Progress
                                    value={
                                        50 +
                                        ((formData.cashDiscrepancy ?? 0) /
                                            ((formData.cashZelty ?? 0) +
                                                Math.abs(
                                                    formData.cashDiscrepancy ??
                                                        0
                                                ))) *
                                            50
                                    }
                                    className="w-full"
                                />
                            </div>
                            <span className="text-sm text-gray-500">
                                Compté
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Répartition de la Caisse */}
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Répartition de la Caisse</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <PieChart width={300} height={300}>
                        <Pie
                            data={pieDataCash}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            label
                        >
                            {pieDataCash.map((entry, index) => (
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
                            Montant laissé en caisse :
                        </span>{" "}
                        {formData.cashToKeep} €
                    </p>
                    <p>
                        <span className="font-semibold">
                            Montant versé au coffre :
                        </span>{" "}
                        {formData.cashToSafe} €
                    </p>
                </CardContent>
            </Card>

            {/* Entrées/Sorties Supplémentaires */}
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Entrées/Sorties Supplémentaires</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Label</TableHead>
                                <TableHead>Montant (€)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.extraFlowEntries.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell className="capitalize">{entry.label}</TableCell>
                                    <TableCell>{entry.amount} €</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="max-w-md w-full flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                    Retour
                </Button>
                <Button onClick={handleSave}>Valider et Sauvegarder</Button>
            </div>
        </div>
    );
}
