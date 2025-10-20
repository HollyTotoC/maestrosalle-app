"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { faCircleInfo, faCheckCircle, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function NewStep4({
    nextStep,
    prevStep,
    setFormData,
    formData,
}: {
    nextStep: () => void;
    prevStep: () => void;
    setFormData: (data: Partial<FormData>) => void;
    formData: FormData;
}) {
    // Initialiser extraFlowEntries avec les données existantes ou une valeur par défaut
    const [extraFlowEntries, setExtraFlowEntries] = useState(
        formData.extraFlowEntries && formData.extraFlowEntries.length > 0
            ? formData.extraFlowEntries.map((e) => ({
                  label: e.label,
                  amount: e.amount === 0 ? "" : e.amount,
              }))
            : [{ label: "", amount: "" }]
    );

    // Simuler un état de chargement
    const isLoading = !formData;

    const handleAddEntry = () => {
        setExtraFlowEntries((prev) => [...prev, { label: "", amount: "" }]);
    };

    const handleRemoveEntry = (index: number) => {
        setExtraFlowEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEntryChange = (
        index: number,
        field: "label" | "amount",
        value: string | number
    ) => {
        setExtraFlowEntries((prev) =>
            prev.map((entry, i) =>
                i === index
                    ? {
                          ...entry,
                          [field]:
                              field === "amount"
                                  ? value === "" ? "" : Number(value)
                                  : value,
                      }
                    : entry
            )
        );
    };

    // Vérifier si tous les champs sont vides (pour smart skip)
    const allEntriesEmpty = extraFlowEntries.every(
        (entry) => !entry.label && (entry.amount === "" || entry.amount === 0)
    );

    const handleNext = () => {
        // Si toutes les entrées sont vides, on sauvegarde un tableau vide et on passe
        if (allEntriesEmpty) {
            setFormData({
                extraFlowEntries: [],
            });
            nextStep();
            return;
        }

        // Sinon, vérifier que les champs remplis sont complets
        if (
            extraFlowEntries.some(
                (entry) =>
                    (!entry.label && entry.amount !== "" && entry.amount !== 0) ||
                    (entry.label && (entry.amount === "" || Number(entry.amount) === 0))
            )
        ) {
            toast.error("Veuillez remplir tous les champs ou laisser vides pour passer.");
            return;
        }

        // Filtrer les entrées vides
        const validEntries = extraFlowEntries.filter(
            (entry) => entry.label && entry.amount !== "" && Number(entry.amount) !== 0
        );

        setFormData({
            extraFlowEntries: validEntries.map((e) => ({
                label: e.label,
                amount: Number(e.amount),
            })),
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
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
                <CardHeader>
                    <CardTitle>Étape 4 : Flux supplémentaires</CardTitle>
                    <CardDescription>
                        Ajoutez les flux d&apos;argent hors ventes (optionnel).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {/* Aide contextuelle */}
                        <Collapsible>
                            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                                <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                                <span>Qu&apos;est-ce qu&apos;un flux supplémentaire ?</span>
                                <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-1">
                                <p>Argent qui entre ou sort du coffre en dehors des ventes :</p>
                                <p>• Pourboires équipe</p>
                                <p>• Primes</p>
                                <p>• Avances sur salaire</p>
                                <p>• Achats cash (fournitures, etc.)</p>
                                <p className="mt-2">Peut être vide si pas de flux aujourd&apos;hui.</p>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Smart skip indicator */}
                        {allEntriesEmpty && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="text-success dark:text-green-400"
                                    />
                                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                                        Aucun flux supplémentaire aujourd&apos;hui
                                    </p>
                                </div>
                            </div>
                        )}

                        {extraFlowEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div className="flex-1">
                                    <Label htmlFor={`extraflow-label-${index}`}>
                                        Label
                                    </Label>
                                    <Input
                                        id={`extraflow-label-${index}`}
                                        type="text"
                                        placeholder="Ex: Remboursement"
                                        value={entry.label}
                                        onChange={(e) =>
                                            handleEntryChange(
                                                index,
                                                "label",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor={`extraflow-amount-${index}`}>
                                        Montant (€)
                                    </Label>
                                    <Input
                                        id={`extraflow-amount-${index}`}
                                        type="number"
                                        placeholder="Ex: 50"
                                        value={entry.amount}
                                        onChange={(e) =>
                                            handleEntryChange(
                                                index,
                                                "amount",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>
                                <div className="pt-3">
                                    <Button
                                        variant="outline"
                                        className="h-10"
                                        onClick={() => handleRemoveEntry(index)}
                                        disabled={extraFlowEntries.length === 1}
                                    >
                                        -
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={handleAddEntry}>
                            + Ajouter une entrée/sortie
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep}>
                        Retour
                    </Button>
                    <Button
                        onClick={handleNext}
                        variant={allEntriesEmpty ? "default" : "default"}
                    >
                        {allEntriesEmpty ? "Passer (aucun flux)" : "Suivant"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
