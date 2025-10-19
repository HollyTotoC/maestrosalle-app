"use client";

import {
    calculateTpeDiscrepancy,
    calculateCashDiscrepancy,
} from "@/utils/calculations";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import du composant Skeleton
import { FormData } from "@/types/cloture"; // Import des types

export default function Step6({
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
    const cbZelty = formData.cbZelty ?? 0;
    const tpeAmounts = formData.tpeAmounts ?? [];
    const cashCounted = formData.cashCounted ?? 0;
    const extraFlowEntries = formData.extraFlowEntries ?? [];
    const cashZelty = formData.cashZelty ?? 0;
    const previousCash = formData.previousCash ?? 0;
    const cashOutZelty = formData.cashOutZelty ?? 0;

    const isLoading = !formData;

    const tpeDiscrepancy = calculateTpeDiscrepancy(
        cbZelty,
        tpeAmounts
    ).tpeDiscrepancy;

    const extraFlow = extraFlowEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0
    );

    const { cashDiscrepancy } = calculateCashDiscrepancy(
        cashCounted,
        cashOutZelty,
        extraFlow,
        cashZelty,
        previousCash
    );

    const cbThreshold = 5;
    const cashThreshold = 20;

    const cbStatus = Math.abs(tpeDiscrepancy) <= cbThreshold ? "OK" : "alert";
    const cashStatus =
        Math.abs(cashDiscrepancy) <= cashThreshold ? "OK" : "warning";

    const handleNext = () => {
        setFormData({
            tpeDiscrepancy,
            cashDiscrepancy, 
            cbStatus,
            cashStatus,
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
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
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
                    <CardTitle>Étape 6 : Vérifications</CardTitle>
                    <CardDescription>
                        Vérifiez les écarts et la répartition des pourboires.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <p>
                            <strong>Écart CB :</strong> {tpeDiscrepancy} €{" "}
                            <span
                                className={
                                    cbStatus === "OK"
                                        ? "text-success"
                                        : "text-destructive"
                                }
                            >
                                ({cbStatus})
                            </span>
                        </p>
                        <p>
                            <strong>Écart espèces :</strong>{" "}
                            {isNaN(cashDiscrepancy)
                                ? "Erreur"
                                : cashDiscrepancy}{" "}
                            €{" "}
                            <span
                                className={
                                    cashStatus === "OK"
                                        ? "text-success"
                                        : "text-warning"
                                }
                            >
                                ({cashStatus})
                            </span>
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
