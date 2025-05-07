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
import { useEffect, useState } from "react";
import { FormData } from "@/types/cloture"; // Import des types
import { fetchPreviousCashToKeep } from "@/lib/firebase/server";
import { useAppStore } from "@/store/store"; // Pour récupérer `restaurantId`

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
    const restaurantId = useAppStore((state) => state.selectedRestaurant?.id);
    const [previousCash, setPreviousCash] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPreviousCash = async () => {
            if (!restaurantId || !formData.date) {
                console.log("%ccomponent: Missing restaurantId or formData.date", "color: red");
                return;
            }

            console.log("%ccomponent: Fetching previous cash for restaurantId: " + restaurantId, "color: green");
            console.log("%ccomponent: FormData : " + JSON.stringify(formData), "color: green");
            console.log("%ccomponent: FormData date: " + JSON.stringify(formData.date), "color: green");

            try {
                const cashToKeep = await fetchPreviousCashToKeep(restaurantId, formData.date);
                console.log("%ccomponent: Fetched cashToKeep: " + cashToKeep, "color: green");

                if (cashToKeep !== null) {
                    setPreviousCash(cashToKeep); // Utiliser la valeur trouvée
                    console.log("%ccomponent: Set previousCash to fetched value: " + cashToKeep, "color: green");
                } else {
                    setPreviousCash(300); // Valeur par défaut si aucune valeur connue
                    console.log("%ccomponent: Set previousCash to default value: 300", "color: green");
                }

                setIsLoading(false);
                console.log("%ccomponent: Set isLoading to false", "color: green");
            } catch (error) {
                console.error("%ccomponent: Error fetching previous cash: " + error, "color: red");
            }
        };

        fetchPreviousCash();
    }, [restaurantId, formData.date]);

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
