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
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { FormData } from "@/types/cloture"; // Import des types

export default function Step2({
    nextStep,
    prevStep,
    formData,
    setFormData,
}: {
    nextStep: () => void;
    prevStep: () => void;
    formData: FormData; // Utilisation du type FormData
    setFormData: (data: Partial<FormData>) => void; // Utilisation de Partial<FormData>
}) {
    // Initialiser les montants TPE avec les données existantes ou une valeur par défaut
    const [tpeAmounts, setTpeAmounts] = useState<number[]>(
        formData.tpeAmounts || [0]
    );

    // Simuler un état de chargement
    const isLoading = !formData;

    const handleAddTpe = () => {
        setTpeAmounts((prev) => [...prev, 0]); // Ajouter un nouveau champ TPE
    };

    const handleRemoveTpe = (index: number) => {
        setTpeAmounts((prev) => prev.filter((_, i) => i !== index)); // Supprimer un champ TPE
    };

    const handleTpeChange = (index: number, value: number) => {
        setTpeAmounts((prev) =>
            prev.map((amount, i) => (i === index ? value : amount))
        );
    };

    const handleNext = () => {
        if (tpeAmounts.some((amount) => amount <= 0)) {
            alert("Veuillez remplir tous les montants TPE avant de continuer.");
            return;
        }
        setFormData({ tpeAmounts });
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
                    <CardTitle>Étape 2 : Montants CB sur les TPE</CardTitle>
                    <CardDescription>
                        Renseignez les montants CB affichés sur chaque TPE.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {tpeAmounts.map((amount, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div className="flex-1">
                                    <Label htmlFor={`tpe-${index}`}>
                                        Montant TPE {index + 1}
                                    </Label>
                                    <input
                                        id={`tpe-${index}`}
                                        type="number"
                                        placeholder={`Ex: 500`}
                                        className="w-full border rounded-md p-2"
                                        value={amount}
                                        onChange={(e) =>
                                            handleTpeChange(
                                                index,
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                {tpeAmounts.length > 1 && (
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => handleRemoveTpe(index)}
                                    >
                                        -
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="outline" onClick={handleAddTpe}>
                            + Ajouter un TPE
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
