/**
 * Bouton pour recalculer l'état du coffre depuis le début
 * Utile en cas de désynchronisation
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { recalculateFromScratch } from "@/lib/firebase/safeOperations";
import { useAppStore } from "@/store/store";
import { useSafeStore } from "@/store/useSafeStore";
import { toast } from "sonner";

export default function SafeRecalculateButton() {
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const setIsRecalculating = useSafeStore((state) => state.setIsRecalculating);
  const [isOpen, setIsOpen] = useState(false);

  const handleRecalculate = async () => {
    if (!selectedRestaurant) {
      toast.error("Aucun restaurant sélectionné");
      return;
    }

    setIsRecalculating(true);
    setIsOpen(false);

    try {
      const result = await recalculateFromScratch(selectedRestaurant.id);

      toast.success(
        `Recalcul effectué avec succès !
        ${result.closuresCount} clôtures et ${result.movementsCount} mouvements intégrés.`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("Erreur recalcul coffre:", error);
      toast.error("Erreur lors du recalcul du coffre");
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-200"
        >
          <FontAwesomeIcon icon={faRotate} className="mr-2" />
          Recalculer depuis le début
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recalculer l&apos;état du coffre ?</DialogTitle>
          <DialogDescription>
            Cette action va recalculer l&apos;état du coffre depuis le début en
            parcourant toutes les clôtures et tous les mouvements manuels.
            <br />
            <br />
            Cela peut prendre quelques secondes. Utilisez cette fonctionnalité
            uniquement si vous soupçonnez une erreur dans les calculs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleRecalculate}>Recalculer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
