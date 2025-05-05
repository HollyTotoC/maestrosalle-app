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

export default function Step5({
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
    // Initialiser previousCash avec les données existantes ou une valeur par défaut
    const [previousCash, setPreviousCash] = useState<number | undefined>(
        formData.previousCash ?? 0
    );

    const isLoading = !formData; // Simuler un état de chargement

    const handleNext = () => {
        if (previousCash === undefined || previousCash < 0) {
            alert("Veuillez vérifier le montant de la caisse de la veille.");
            return;
        }
        setFormData({ previousCash });
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
                    <CardTitle>Étape 5 : Infos caisse de la veille</CardTitle>
                    <CardDescription>
                        Vérifiez ou modifiez le montant laissé en caisse la
                        veille.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="previousCash">
                                Montant laissé en caisse (veille)
                            </Label>
                            <input
                                id="previousCash"
                                type="number"
                                placeholder="Ex: 500"
                                className="w-full border rounded-md p-2"
                                value={previousCash ?? ""}
                                onChange={(e) =>
                                    setPreviousCash(Number(e.target.value))
                                }
                            />
                        </div>
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
