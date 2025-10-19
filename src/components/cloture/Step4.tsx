"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Import du composant Skeleton
import { useState } from "react";
import { FormData } from "@/types/cloture"; // Import des types
import { toast } from "sonner";

export default function Step4({
    nextStep,
    prevStep,
    setFormData,
    formData,
}: {
    nextStep: () => void;
    prevStep: () => void;
    setFormData: (data: Partial<FormData>) => void; // Utilisation de Partial<FormData>
    formData: FormData; // Utilisation du type FormData
}) {
    // Initialiser extraFlowEntries avec les données existantes ou une valeur par défaut
    const [extraFlowEntries, setExtraFlowEntries] = useState(
        formData.extraFlowEntries
            ? formData.extraFlowEntries.map((e) => ({
                  label: e.label,
                  amount: e.amount === 0 ? "" : e.amount,
              }))
            : [{ label: "", amount: "" }]
    );

    // Simuler un état de chargement
    const isLoading = !formData;

    const handleAddEntry = () => {
        setExtraFlowEntries((prev) => [...prev, { label: "", amount: "" }]);
    };

    const handleRemoveEntry = (index: number) => {
        setExtraFlowEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEntryChange = (
        index: number,
        field: "label" | "amount",
        value: string | number
    ) => {
        setExtraFlowEntries((prev) =>
            prev.map((entry, i) =>
                i === index
                    ? {
                          ...entry,
                          [field]:
                              field === "amount"
                                  ? value === "" ? "" : Number(value)
                                  : value,
                      }
                    : entry
            )
        );
    };

    const handleNext = () => {
        if (
            extraFlowEntries.some(
                (entry) =>
                    !entry.label ||
                    entry.amount === "" ||
                    Number(entry.amount) === 0
            )
        ) {
            toast.error("Veuillez remplir tous les champs avant de continuer.");
            return;
        }
        setFormData({
            extraFlowEntries: extraFlowEntries.map((e) => ({
                label: e.label,
                amount: Number(e.amount),
            })),
        });
        nextStep();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center">
                <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                    <CardHeader>
                        <CardTitle>
                            <Skeleton className="h-6 w-1/2" />
                        </CardTitle>
                        <CardDescription>
                            <Skeleton className="h-4 w-3/4" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Étape 4 : ExtraFlow</CardTitle>
                    <CardDescription>
                        Ajoutez les entrées ou sorties supplémentaires
                        (positives ou négatives).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {extraFlowEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div className="flex-1">
                                    <Label htmlFor={`extraflow-label-${index}`}>
                                        Label
                                    </Label>
                                    <Input
                                        id={`extraflow-label-${index}`}
                                        type="text"
                                        placeholder="Ex: Remboursement"
                                        value={entry.label}
                                        onChange={(e) =>
                                            handleEntryChange(
                                                index,
                                                "label",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor={`extraflow-amount-${index}`}>
                                        Montant
                                    </Label>
                                    <Input
                                        id={`extraflow-amount-${index}`}
                                        type="number"
                                        placeholder="Ex: -50"
                                        value={entry.amount}
                                        onChange={(e) =>
                                            handleEntryChange(
                                                index,
                                                "amount",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="pt-3">
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => handleRemoveEntry(index)}
                                        disabled={extraFlowEntries.length === 1}
                                    >
                                        -
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={handleAddEntry}>
                            + Ajouter une entrée/sortie
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                        Retour
                    </Button>
                    <Button onClick={handleNext}>Suivant</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
