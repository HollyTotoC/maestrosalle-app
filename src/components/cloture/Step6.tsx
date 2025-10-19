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
import { Skeleton } from "@/components/ui/skeleton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormData } from "@/types/cloture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";

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

    // Détection de coïncidence entre écart CB et écart espèces
    const discrepancyMatch = Math.abs(Math.abs(tpeDiscrepancy) - Math.abs(cashDiscrepancy)) <= 5;

    // Messages d'aide
    const getCbHelp = () => {
        if (tpeDiscrepancy > 0) {
            return "Plus d'argent sur Zelty que sur les TPE. Solution : faire une remise sur une table du montant de l'écart pour équilibrer.";
        } else if (tpeDiscrepancy < 0) {
            return "Moins d'argent sur Zelty que sur les TPE. Vérifiez les saisies sur Zelty.";
        }
        return "Les montants CB sont équilibrés.";
    };

    const getCashHelp = () => {
        if (cashDiscrepancy < 0) {
            return "Moins d'argent sur Zelty que compté en caisse. Pas grave : plus de liquide est rentré que prévu.";
        } else if (cashDiscrepancy > 0) {
            return "Plus d'argent sur Zelty que compté en caisse. Attention : il manque de l'argent en caisse.";
        }
        return "Les montants espèces sont équilibrés.";
    };

    return (
        <TooltipProvider>
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
                            {/* Alerte si coïncidence entre écarts */}
                            {discrepancyMatch && (tpeDiscrepancy !== 0 || cashDiscrepancy !== 0) && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <FontAwesomeIcon icon={faCircleInfo} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-blue-800 dark:text-blue-300">
                                                Coïncidence détectée
                                            </p>
                                            <p className="text-blue-700 dark:text-blue-400 mt-1">
                                                Les écarts CB et espèces sont similaires. C'est probablement une erreur de saisie :
                                                une table mise en espèce au lieu de CB (ou vice versa). Vérifiez les saisies sur Zelty.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Écart CB */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <strong>Écart CB :</strong>
                                    <span>{tpeDiscrepancy} €</span>
                                    <span
                                        className={
                                            cbStatus === "OK"
                                                ? "text-success"
                                                : "text-destructive"
                                        }
                                    >
                                        ({cbStatus})
                                    </span>
                                </div>
                                {tpeDiscrepancy !== 0 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="text-muted-foreground hover:text-foreground">
                                                <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p className="text-sm">{getCbHelp()}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>

                            {/* Écart espèces */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <strong>Écart espèces :</strong>
                                    <span>
                                        {isNaN(cashDiscrepancy) ? "Erreur" : cashDiscrepancy} €
                                    </span>
                                    <span
                                        className={
                                            cashStatus === "OK"
                                                ? "text-success"
                                                : "text-warning"
                                        }
                                    >
                                        ({cashStatus})
                                    </span>
                                </div>
                                {cashDiscrepancy !== 0 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="text-muted-foreground hover:text-foreground">
                                                <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p className="text-sm">{getCashHelp()}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
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
        </TooltipProvider>
    );
}
