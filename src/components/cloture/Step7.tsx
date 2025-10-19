"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

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
            toast.error(
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
                            <Input
                                id="cashToKeep"
                                type="number"
                                placeholder="Ex: 200"
                                value={cashToKeep === "" ? "" : cashToKeep}
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
