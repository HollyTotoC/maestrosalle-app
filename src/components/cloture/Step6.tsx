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
import { Skeleton } from "@/components/ui/skeleton";
import { FormData } from "@/types/cloture";
import { toast } from "sonner";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function NewStep6({
    nextStep,
    prevStep,
    formData,
    setFormData,
}: {
    nextStep: () => void;
    prevStep: () => void;
    formData: FormData;
    setFormData: (data: Partial<FormData>) => void;
}) {
    const cashCounted = formData?.cashCounted ?? 0;
    const [cashToKeep, setCashToKeep] = useState<number | "">(
        formData?.cashToKeep !== undefined ? formData.cashToKeep : ""
    );

    const cashToSafe = cashToKeep === "" ? 0 : cashCounted - cashToKeep;

    const handleNext = () => {
        if (cashToKeep === "" || cashToKeep < 0 || cashToKeep > cashCounted) {
            toast.error(
                "Le montant à laisser en caisse doit être compris entre 0 et le montant total compté."
            );
            return;
        }

        setFormData({
            cashToKeep: Number(cashToKeep),
            cashToSafe: cashToSafe,
        });
        nextStep();
    };

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
        <div className="flex justify-center items-center">
            <Card className="max-w-md w-full bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                <CardHeader>
                    <CardTitle>Étape 6 : Répartition de la caisse</CardTitle>
                    <CardDescription>
                        Définissez le montant à laisser en caisse pour le lendemain.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Aide contextuelle */}
                        <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                                <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                                <span>Comment répartir l'argent ?</span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-1">
                                <p>• Cash à garder : Fond de caisse pour demain (recommandé : 50-70€)</p>
                                <p>• Cash au coffre : Le reste part au coffre</p>
                                <p className="mt-2">Montant total à répartir : {cashCounted}€</p>
                            </CollapsibleContent>
                        </Collapsible>

                        <div>
                            <Label htmlFor="cashToKeep">
                                Montant à laisser en caisse
                            </Label>
                            <Input
                                id="cashToKeep"
                                type="number"
                                placeholder="Ex: 60"
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
                            {cashToKeep === "" ? "-" : cashToSafe} €
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                        Retour
                    </Button>
                    <Button onClick={handleNext} disabled={cashToKeep === ""}>
                        Suivant
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
