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

export default function Step7({
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
    // Initialiser cashCounted et cashToKeep avec des valeurs par défaut
    const cashCounted = formData?.cashCounted ?? 0;
    const [cashToKeep, setCashToKeep] = useState<number | "">(
        formData?.cashToKeep !== undefined ? formData.cashToKeep : ""
    );

    const isLoading = !formData; // Simuler un état de chargement

    const handleNext = () => {
        if (
            cashToKeep === "" ||
            cashToKeep < 0 ||
            cashToKeep > cashCounted
        ) {
            alert(
                "Le montant à laisser en caisse doit être compris entre 0 et le montant total compté."
            );
            return;
        }

        const cashToSafe = cashCounted - cashToKeep;

        setFormData({
            cashToKeep,
            cashToSafe,
        });
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
                    <CardTitle>Étape 7 : Reset caisse</CardTitle>
                    <CardDescription>
                        Définissez le montant à laisser en caisse pour le
                        lendemain.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="cashToKeep">
                                Montant à laisser en caisse
                            </Label>
                            <input
                                id="cashToKeep"
                                type="number"
                                placeholder="Ex: 200"
                                className="w-full border rounded-md p-2"
                                value={cashToKeep}
                                onChange={(e) =>
                                    setCashToKeep(
                                        e.target.value === ""
                                            ? ""
                                            : Number(e.target.value)
                                    )
                                }
                            />
                        </div>
                        <p>
                            <strong>Montant total compté :</strong>{" "}
                            {cashCounted} €
                        </p>
                        <p>
                            <strong>Montant à verser au coffre :</strong>{" "}
                            {cashToKeep === "" ? "-" : cashCounted - cashToKeep} €
                        </p>
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
