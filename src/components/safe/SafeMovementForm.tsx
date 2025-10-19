/**
 * Formulaire d'ajout de mouvement dans le coffre
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { addSafeMovement, calculateSafeState } from "@/lib/firebase/safeOperations";
import { useUserStore } from "@/store/useUserStore";
import { useAppStore } from "@/store/store";
import { toast } from "sonner";
import type { SafeMovementType, SafeCategory } from "@/types/safe";

export default function SafeMovementForm() {
  const userId = useUserStore((state) => state.userId);
  const userName = useUserStore((state) => state.displayName);
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);

  const [type, setType] = useState<SafeMovementType>("withdrawal");
  const [category, setCategory] = useState<SafeCategory>("banque");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !userName || !selectedRestaurant) {
      toast.error("Utilisateur ou restaurant non identifié");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Montant invalide");
      return;
    }

    if (!description.trim()) {
      toast.error("Description obligatoire");
      return;
    }

    setIsSubmitting(true);

    try {
      await addSafeMovement(
        selectedRestaurant.id,
        {
          type,
          category,
          amount: parseFloat(amount),
          description: description.trim(),
        },
        userId,
        userName
      );

      // Recalculer l'état du coffre après ajout
      await calculateSafeState(selectedRestaurant.id);

      toast.success("Mouvement ajouté avec succès");

      // Reset du formulaire
      setAmount("");
      setDescription("");
    } catch (error) {
      console.error("Erreur ajout mouvement:", error);
      toast.error("Erreur lors de l'ajout du mouvement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faPlus} className="text-primary" />
          Nouveau mouvement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de mouvement */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de mouvement</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as SafeMovementType)}
            >
              <SelectTrigger id="type" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="withdrawal">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faArrowUp} className="text-red-500" />
                    Retrait
                  </div>
                </SelectItem>
                <SelectItem value="deposit">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faArrowDown} className="text-green-500" />
                    Dépôt
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as SafeCategory)}
            >
              <SelectTrigger id="category" className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extraFlow">Extra-Flow (Prime de Noël)</SelectItem>
                <SelectItem value="banque">Banque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background/50"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Achat boucher, Apport banque..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50"
              required
            />
          </div>

          {/* Bouton submit */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ajout en cours..." : "Ajouter le mouvement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
