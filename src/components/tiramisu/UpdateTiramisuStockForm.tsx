"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider"; // Import du slider ShadCN
import { listenToBatchesFiltered, updateTiramisuStock } from "@/lib/firebase/server";
import { TiramisuBatch } from "@/types/tiramisu";
import { DialogDescription, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";

export default function UpdateTiramisuStockForm({ onClose }: { onClose: () => void }) {
  const [initialStock, setInitialStock] = useState<number>(0); // Stock initial (en %)
  const [remainingStock, setRemainingStock] = useState<number>(0); // Stock restant déclaré par l'utilisateur (en %)

  useEffect(() => {
    // Récupérer les données des batches depuis Firebase
    const fetchStock = async () => {
      try {
        listenToBatchesFiltered((batches: TiramisuBatch[]) => {
          // Calculer le stock total restant
          const totalRemainingStock = batches.reduce((total, batch) => {
            const batchRemaining = batch.totalBacs - batch.consumedBacs - batch.partialConsumption;
            return total + batchRemaining * 100; // Convertir en pourcentage
          }, 0);

          setInitialStock(totalRemainingStock); // Stock initial en %
          setRemainingStock(totalRemainingStock); // Initialiser avec le stock actuel
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des stocks :", error);
      }
    };

    fetchStock();
  }, []);

  const handleSubmit = async () => {
    try {
      // Calculer la consommation totale en % (supprimé car non utilisé)

      // Convertir la consommation en bacs pleins et partiels
      const remainingBacs = Math.floor(remainingStock / 100); // Bacs pleins restants
      const partialConsumption = (remainingStock % 100) / 100; // Bac partiellement restant
      console.log("Bacs restants :", remainingBacs);
      console.log("Consommation partielle :", partialConsumption);
      
      await updateTiramisuStock({
        updatedBy: "Utilisateur", // Remplacez par l'utilisateur connecté
        remainingBacs,
        partialConsumption,
      });

      toast.success("Stock mis à jour avec succès !");
      onClose();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock :", error);
      toast.error("Erreur lors de la mise à jour du stock.");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mb-6">
      <DialogTitle className="text-xl font-bold mb-4">Mise à jour du stock</DialogTitle>
      <DialogDescription className="text-sm mb-4">
        Utilisez le slider pour ajuster le stock restant de tiramisu.
      </DialogDescription>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="remainingStock">Stock restant</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="remainingStock"
              value={[remainingStock]} // Valeur actuelle du slider
              onValueChange={(value) => setRemainingStock(value[0])} // Mettre à jour le stock restant
              max={initialStock} // Limiter la plage au stock initial
              step={10} // Pas de 0.1 pour inclure des consommations plus précises
              className="w-full"
            />
            <span className="text-sm text-gray-700">{(remainingStock / 100).toFixed(1).replace('.', ',')} bacs</span>
          </div>
        </div>
        <Button onClick={handleSubmit}>Mettre à jour</Button>
      </div>
    </div>
  );
}