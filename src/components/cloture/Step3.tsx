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
import { useState } from "react";
import { FormData } from "@/types/cloture";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function NewStep3({
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
            toast.error("Veuillez remplir tous les champs obligatoires avant de continuer.");
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
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                <CardHeader>
                    <CardTitle>Étape 3 : Informations Zelty</CardTitle>
                    <CardDescription>
                        Renseignez les montants déclarés sur la plateforme Zelty.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Aide contextuelle */}
                        <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                                <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                                <span>Où trouver ces montants ?</span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-1">
                                <p>Sur Zelty (logiciel de caisse) :</p>
                                <p>• CB Zelty : Menu → Rapports → CA journalier → CB</p>
                                <p>• Cash Zelty : Menu → Rapports → CA journalier → Espèces</p>
                                <p>• Cash-out : Montant retiré pour dépenses (si applicable)</p>
                                <p className="mt-2 text-warning">Ces montants doivent correspondre aux TPE et à la caisse.</p>
                            </CollapsibleContent>
                        </Collapsible>

                        <div>
                            <Label htmlFor="cbZelty">Montant CB (Zelty) *</Label>
                            <Input
                                id="cbZelty"
                                type="number"
                                placeholder="Ex: 1050"
                                value={cbZelty ?? ""}
                                onChange={(e) =>
                                    setCbZelty(Number(e.target.value))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="cashZelty">
                                Montant Cash (Zelty) *
                            </Label>
                            <Input
                                id="cashZelty"
                                type="number"
                                placeholder="Ex: 800"
                                value={cashZelty ?? ""}
                                onChange={(e) =>
                                    setCashZelty(Number(e.target.value))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="cashOutZelty">
                                Montant Cash Sortant (Zelty) - Optionnel
                            </Label>
                            <Input
                                id="cashOutZelty"
                                type="number"
                                placeholder="Ex: 0"
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
