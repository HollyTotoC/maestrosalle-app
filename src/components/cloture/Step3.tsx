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

export default function Step3({
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
    // Initialiser les valeurs avec les données existantes ou des valeurs par défaut
    const [cbZelty, setCbZelty] = useState<number | undefined>(
        formData.cbZelty
    );
    const [cashZelty, setCashZelty] = useState<number | undefined>(
        formData.cashZelty
    );
    const [cashOutZelty, setCashOutZelty] = useState<number | "">(formData.cashOutZelty ?? "");

    // Simuler un état de chargement
    const isLoading = !formData;

    const handleNext = () => {
        if (cbZelty === undefined || cashZelty === undefined) {
            alert("Veuillez remplir tous les champs avant de continuer.");
            return;
        }
        setFormData({ 
            cbZelty, 
            cashZelty, 
            cashOutZelty: cashOutZelty === "" ? undefined : cashOutZelty 
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
                    <CardTitle>Étape 3 : Informations Zelty</CardTitle>
                    <CardDescription>
                        Renseignez les montants déclarés sur la plateforme
                        Zelty.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="cbZelty">Montant CB (Zelty)</Label>
                            <input
                                id="cbZelty"
                                type="number"
                                placeholder="Ex: 1050"
                                className="w-full border rounded-md p-2"
                                value={cbZelty ?? ""}
                                onChange={(e) =>
                                    setCbZelty(Number(e.target.value))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="cashZelty">
                                Montant Cash (Zelty)
                            </Label>
                            <input
                                id="cashZelty"
                                type="number"
                                placeholder="Ex: 800"
                                className="w-full border rounded-md p-2"
                                value={cashZelty ?? ""}
                                onChange={(e) =>
                                    setCashZelty(Number(e.target.value))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="cashOutZelty">
                                Montant Cash Sortant (Zelty)
                            </Label>
                            <input
                                id="cashOutZelty"
                                type="number"
                                placeholder="Ex: 800"
                                className="w-full border rounded-md p-2"
                                value={cashOutZelty ?? ""}
                                onChange={(e) =>
                                    setCashOutZelty(Number(e.target.value))
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
