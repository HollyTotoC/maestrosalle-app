"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
        formData.extraFlowEntries || [{ label: "", amount: 0 }]
    );

    // Simuler un état de chargement
    const isLoading = !formData;

    const handleAddEntry = () => {
        setExtraFlowEntries((prev) => [...prev, { label: "", amount: 0 }]);
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
                          [field]: field === "amount" ? Number(value) : value,
                      }
                    : entry
            )
        );
    };

    const handleNext = () => {
        if (
            extraFlowEntries.some((entry) => !entry.label || entry.amount === 0)
        ) {
            alert("Veuillez remplir tous les champs avant de continuer.");
            return;
        }
        setFormData({ extraFlowEntries });
        nextStep();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center">
                <Card className="w-full max-w-md">
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
                                    <Label htmlFor={`label-${index}`}>
                                        Label
                                    </Label>
                                    <input
                                        id={`label-${index}`}
                                        type="text"
                                        title={`label-${index}`}
                                        placeholder="Ex: Remboursement"
                                        className="w-full border rounded-md p-2"
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
                                    <Label htmlFor={`amount-${index}`}>
                                        Montant
                                    </Label>
                                    <input
                                        id={`amount-${index}`}
                                        type="number"
                                        placeholder="Ex: -50"
                                        className="w-full border rounded-md p-2"
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
                                <Button
                                    variant="outline"
                                    className="h-10"
                                    onClick={() => handleRemoveEntry(index)}
                                    disabled={extraFlowEntries.length === 1}
                                >
                                    -
                                </Button>
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
