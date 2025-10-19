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
import { FormData, ClosureData, FirestoreTimestamp } from "@/types/cloture"; // Import des types
import { useUserStore } from "@/store/useUserStore";
import { useAppStore } from "@/store/store"; // Import useAppStore
import { toast } from "sonner";

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
    const restaurantId = useAppStore((state) => state.selectedRestaurant?.id); // Récupérer le restaurantId depuis Zustand

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
            // Utiliser formData.date ou une valeur par défaut
            const dateToUse: FirestoreTimestamp = formData.date || {
                seconds: Math.floor(Date.now() / 1000),
                nanoseconds: 0,
            };

            // Convertir FirestoreTimestamp en objet Date pour générer l'ID
            const dateObject = new Date(dateToUse.seconds * 1000);
            const formattedDate = `${dateObject.getDate().toString().padStart(2, "0")}${(dateObject.getMonth() + 1)
                .toString()
                .padStart(2, "0")}${dateObject.getFullYear()}`;
            const id = `id-${formattedDate}`;

            const timestamp = new Date().toISOString();

            // Construire l'objet ClosureData
            const closureData: ClosureData = {
                id, // Utiliser l'id généré
                restaurantId, // Récupérer depuis Zustand
                date: dateToUse, // Utiliser le FirestoreTimestamp
                validatedBy: userId || "unknown",
                timestamp,
                cashCounted: formData.cashCounted ?? 0, // Argent physiquement compté en caisse
                tpeAmounts: formData.tpeAmounts || [], // Valeur par défaut : tableau vide
                cbZelty: formData.cbZelty ?? 0, // Valeur par défaut : 0
                cashZelty: formData.cashZelty ?? 0, // Valeur par défaut : 0
                cashOutZelty: formData.cashOutZelty ?? 0, // Valeur par défaut : 0
                extraFlowEntries: formData.extraFlowEntries || [], // Valeur par défaut : tableau vide
                previousCash: formData.previousCash ?? 0, // Valeur par défaut : 0
                cashToKeep: formData.cashToKeep ?? 0, // Valeur par défaut : 0
                cashToSafe: formData.cashToSafe ?? 0, // Valeur par défaut : 0
                tpeDiscrepancy: formData.tpeDiscrepancy ?? 0, // Valeur par défaut : 0
                cashDiscrepancy: formData.cashDiscrepancy ?? 0, // Valeur par défaut : 0
                cbStatus: formData.cbStatus || "OK", // Valeur par défaut : "OK"
                cashStatus: formData.cashStatus || "OK", // Valeur par défaut : "OK"
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

            {/* Répartition de la Caisse */}
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
