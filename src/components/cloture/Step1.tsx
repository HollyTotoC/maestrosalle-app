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
import { FormData, FirestoreTimestamp } from "@/types/cloture"; // Import des types
import { toast } from "sonner";

export default function Step1({
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
  const [date, setDate] = useState<string>(
    formData.date
      ? new Date(formData.date.seconds * 1000).toISOString().split("T")[0]
      : ""
  );
  const [cashCounted, setCashCounted] = useState<number | "">(
    formData.cashCounted ?? ""
  );

  // Fonction pour convertir une date en FirestoreTimestamp
  const convertDateToFirestoreTimestamp = (date: string): FirestoreTimestamp => {
    const dateObject = new Date(date); // Convertir la chaîne en objet Date
    dateObject.setUTCHours(0, 0, 0, 0); // Forcer l'heure à minuit UTC
    return {
      seconds: Math.floor(dateObject.getTime() / 1000),
      nanoseconds: 0,
    };
  };

  const handleNext = () => {
    if (!date || !cashCounted) {
      toast.error("Veuillez remplir tous les champs avant de continuer.");
      return;
    }

    setFormData({
      date: convertDateToFirestoreTimestamp(date), // Conversion en FirestoreTimestamp
      cashCounted: Number(cashCounted),
    });

    nextStep();
  };

  // Simuler un état de chargement si nécessaire
  const isLoading = false; // Remplacez par une condition réelle si nécessaire

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
          <CardTitle>Étape 1 : Informations de base</CardTitle>
          <CardDescription>
            Renseignez les informations de la journée à clôturer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                title="Date de la clôture"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cashCounted">Espèces comptées</Label>
              <Input
                id="cashCounted"
                type="number"
                placeholder="Ex: 800"
                value={cashCounted}
                onChange={(e) => setCashCounted(Number(e.target.value))}
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