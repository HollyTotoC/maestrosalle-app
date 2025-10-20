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
import { useEffect, useState } from "react";
import { FormData, FirestoreTimestamp } from "@/types/cloture";
import { fetchPreviousCashToKeep } from "@/lib/firebase/server";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faCheckCircle, faEdit, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function NewStep1({
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
  const restaurantId = useAppStore((state) => state.selectedRestaurant?.id);
  const [date, setDate] = useState<string>(
    formData.date
      ? new Date(formData.date.seconds * 1000).toISOString().split("T")[0]
      : ""
  );
  const [previousCash, setPreviousCash] = useState<number | undefined>(undefined);
  const [cashCounted, setCashCounted] = useState<number | "">(
    formData.cashCounted ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [previousCashValidated, setPreviousCashValidated] = useState(false);

  // Fonction pour convertir une date en FirestoreTimestamp
  const convertDateToFirestoreTimestamp = (date: string): FirestoreTimestamp => {
    const dateObject = new Date(date);
    dateObject.setUTCHours(0, 0, 0, 0);
    return {
      seconds: Math.floor(dateObject.getTime() / 1000),
      nanoseconds: 0,
    };
  };

  // Fetch previousCash quand la date change
  useEffect(() => {
    if (!date || !restaurantId) {
      setPreviousCash(undefined);
      setPreviousCashValidated(false);
      return;
    }

    const fetchPreviousCash = async () => {
      setIsLoading(true);
      try {
        const firestoreDate = convertDateToFirestoreTimestamp(date);
        const cashToKeep = await fetchPreviousCashToKeep(restaurantId, firestoreDate);

        if (cashToKeep !== null) {
          setPreviousCash(cashToKeep);
        } else {
          setPreviousCash(0); // Première clôture
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching previous cash:", error);
        setPreviousCash(0); // Fallback à 0
        setIsLoading(false);
      }
    };

    fetchPreviousCash();
  }, [date, restaurantId]);

  const handleNext = () => {
    if (!date) {
      toast.error("Veuillez sélectionner une date avant de continuer.");
      return;
    }

    if (!previousCashValidated) {
      toast.error("Veuillez valider le cash de la veille avant de continuer.");
      return;
    }

    if (!cashCounted || cashCounted <= 0) {
      toast.error("Veuillez compter l'argent en caisse avant de continuer.");
      return;
    }

    setFormData({
      date: convertDateToFirestoreTimestamp(date),
      previousCash: previousCash ?? 0,
      cashCounted: Number(cashCounted),
    });

    nextStep();
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300">
        <CardHeader>
          <CardTitle>Étape 1 : Informations de base</CardTitle>
          <CardDescription>
            Date, validation du cash de la veille et comptage actuel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Section 1: Date */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="text-primary text-xs" />
                Date de clôture
              </h3>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  title="Date de la clôture"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    // Reset validation quand date change
                    setPreviousCashValidated(false);
                  }}
                />
              </div>

              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                  <span>Aide</span>
                  <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
                  Sélectionnez la date de la clôture (généralement aujourd'hui).
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Divider */}
            {date && <div className="border-t border-border/50"></div>}

            {/* Section 2: Validation du cash précédent (affiché seulement si date sélectionnée) */}
            {date && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Validez le cash de la veille</h3>
                  {previousCashValidated && (
                    <FontAwesomeIcon icon={faCheckCircle} className="text-success dark:text-green-400" />
                  )}
                </div>

                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Récupération du cash de la veille...
                  </p>
                ) : (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                      <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                      <span>Aide</span>
                      <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-1">
                      <p>Si correct → Validez</p>
                      <p>Si erreur → Corrigez le montant</p>
                      <p>Première clôture ? Le montant est 0€</p>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {!isLoading && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor="previousCash">
                        Montant laissé en caisse (veille)
                      </Label>
                      <Input
                        id="previousCash"
                        type="number"
                        placeholder="Ex: 50"
                        value={previousCash ?? ""}
                        onChange={(e) => {
                          setPreviousCash(Number(e.target.value));
                          setPreviousCashValidated(false);
                        }}
                      />
                    </div>
                    <Button
                      variant={previousCashValidated ? "default" : "outline"}
                      className="mt-6"
                      onClick={() => setPreviousCashValidated(true)}
                    >
                      {previousCashValidated ? (
                        <>
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                          Validé
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faEdit} className="mr-2" />
                          Valider
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {date && previousCashValidated && <div className="border-t border-border/50"></div>}

            {/* Section 3: Comptage cash actuel (affiché seulement si previousCash validé) */}
            {date && previousCashValidated && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Comptez l'argent actuel</h3>

                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                    <FontAwesomeIcon icon={faCircleInfo} className="text-primary" />
                    <span>Aide</span>
                    <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-1">
                    <p>1. Ouvrez le tiroir-caisse</p>
                    <p>2. Comptez TOUT l'argent présent</p>
                    <p>3. Saisissez le montant TOTAL compté</p>
                  </CollapsibleContent>
                </Collapsible>

                <div>
                  <Label htmlFor="cashCounted">Espèces comptées (total)</Label>
                  <Input
                    id="cashCounted"
                    type="number"
                    placeholder="Ex: 800"
                    value={cashCounted}
                    onChange={(e) => setCashCounted(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep}>
            Retour
          </Button>
          <Button onClick={handleNext} disabled={!date || !previousCashValidated || !cashCounted}>
            Suivant
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
