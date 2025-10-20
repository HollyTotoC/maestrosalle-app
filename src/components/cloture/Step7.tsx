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
import { FormData, ClosureData, FirestoreTimestamp } from "@/types/cloture";
import { useUserStore } from "@/store/useUserStore";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";

export default function NewStep7({
    prevStep,
    formData,
    onSave,
}: {
    prevStep: () => void;
    formData: FormData;
    onSave: (data: ClosureData) => void;
}) {
    const userId = useUserStore((state) => state.userId);
    const restaurantId = useAppStore((state) => state.selectedRestaurant?.id);

    const cashCounted = formData?.cashCounted ?? 0;
    const cashToKeep = formData?.cashToKeep ?? 0;
    const cashToSafe = formData?.cashToSafe ?? 0;

    const handleSave = async () => {
        if (!userId) {
            console.error("Utilisateur non authentifié.");
            return;
        }

        if (!restaurantId) {
            console.error("Aucun restaurant sélectionné.");
            return;
        }

        try {
            const dateToUse: FirestoreTimestamp = formData.date || {
                seconds: Math.floor(Date.now() / 1000),
                nanoseconds: 0,
            };

            const dateObject = new Date(dateToUse.seconds * 1000);
            const formattedDate = `${dateObject.getDate().toString().padStart(2, "0")}${(dateObject.getMonth() + 1)
                .toString()
                .padStart(2, "0")}${dateObject.getFullYear()}`;
            const id = `id-${formattedDate}`;

            const timestamp = new Date().toISOString();

            const closureData: ClosureData = {
                id,
                restaurantId,
                date: dateToUse,
                validatedBy: userId || "unknown",
                timestamp,
                cashCounted: formData.cashCounted ?? 0,
                tpeAmounts: formData.tpeAmounts || [],
                cbZelty: formData.cbZelty ?? 0,
                cashZelty: formData.cashZelty ?? 0,
                cashOutZelty: formData.cashOutZelty ?? 0,
                extraFlowEntries: formData.extraFlowEntries || [],
                previousCash: formData.previousCash ?? 0,
                cashToKeep: Number(cashToKeep),
                cashToSafe: cashToSafe,
                tpeDiscrepancy: formData.tpeDiscrepancy ?? 0,
                cashDiscrepancy: formData.cashDiscrepancy ?? 0,
                cbStatus: formData.cbStatus || "OK",
                cashStatus: formData.cashStatus || "OK",
            };

            onSave(closureData);
        } catch (error) {
            console.error("Erreur lors de la sauvegarde des données :", error);
            toast.error("Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.");
        }
    };

    const pieDataCash = [
        {
            name: "Montant laissé en caisse",
            value: cashToKeep,
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
                cashToSafe -
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
                <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
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
            {/* Warning Banner */}
            <div className="max-w-md w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    Vérifiez le récapitulatif complet avant validation
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    Une fois validée, la clôture ne peut plus être modifiée.
                </p>
            </div>

            {/* Informations Générales */}
            <Card className="max-w-md w-full bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                <CardHeader>
                    <CardTitle>Informations Générales</CardTitle>
                    <CardDescription>Détails de la clôture</CardDescription>
                </CardHeader>
                <CardContent className="flex w-full justify-between gap-2">
                    <p>
                        <span className="font-semibold">Date :</span>{" "}
                        {formData.date
                            ? new Date(formData.date.seconds * 1000).toLocaleDateString()
                            : "Non défini"}
                    </p>
                </CardContent>
            </Card>

            {/* Écarts */}
            <Card className="max-w-md w-full bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                <CardHeader>
                    <CardTitle>Écarts</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Écart CB */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between w-full gap-2">
                            <p className="font-semibold">Écart CB :</p>
                            <p
                                className={
                                    formData.cbStatus === "OK"
                                        ? "text-success"
                                        : "text-warning"
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
                                        ? "text-success"
                                        : "text-warning"
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

            {/* Répartition de la Caisse (Pie Chart) */}
            <Card className="max-w-md w-full bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
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
                        {cashToKeep} €
                    </p>
                    <p>
                        <span className="font-semibold">
                            Montant versé au coffre :
                        </span>{" "}
                        {cashToSafe} €
                    </p>
                </CardContent>
            </Card>

            {/* Entrées/Sorties Supplémentaires */}
            {formData.extraFlowEntries.length > 0 && (
                <Card className="max-w-md w-full bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
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
            )}

            {/* Actions */}
            <div className="max-w-md w-full flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                    Retour
                </Button>
                <Button onClick={handleSave}>
                    Valider et Sauvegarder
                </Button>
            </div>
        </div>
    );
}
