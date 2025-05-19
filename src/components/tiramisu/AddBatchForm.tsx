"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBatch } from "@/lib/firebase/server"; // Import de la fonction centralisée
import { useUserStore } from "@/store/useUserStore"; // Import du store utilisateur
import { DialogTitle } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function AddBatchForm({ onClose }: { onClose: () => void }) {
  const displayName = useUserStore((state) => state.displayName); // Récupérer le displayName
  const userId = useUserStore((state) => state.userId); // Récupérer l'uid de l'utilisateur

  const [createdBy, setCreatedBy] = useState<string>(userId || ""); // Initialiser avec l'uid
  const [createdByDisplayName, setCreatedByDisplayName] = useState<string>(
    displayName || ""
  ); // Afficher le displayName
  const [totalBacs, setTotalBacs] = useState<number>(6);

  useEffect(() => {
    // Mettre à jour les champs si les données utilisateur changent
    setCreatedBy(userId || "");
    setCreatedByDisplayName(displayName || "");
  }, [userId, displayName]);

  const handleSubmit = async () => {
    if (!createdBy) {
      alert("Veuillez renseigner le nom du préparateur.");
      return;
    }

    try {
      await addBatch({ createdBy, totalBacs });
      alert("Batch ajouté avec succès !");
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du batch :", error);
      if (error instanceof Error) {
        alert("Erreur lors de l'ajout du batch : " + error.message);
      } else {
        alert("Erreur lors de l'ajout du batch.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 mb-6">
      <DialogTitle className="text-xl font-bold mb-4">Ajouter un batch de tiramisu</DialogTitle>
      <DialogDescription className="text-sm mb-4">
        Remplissez les informations ci-dessous pour ajouter un nouveau batch de tiramisu.
      </DialogDescription>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="createdByDisplayName">Préparé par</Label>
          <Input
            id="createdByDisplayName"
            type="text"
            placeholder="Nom du préparateur"
            value={createdByDisplayName} // Affiche le displayName
            disabled // Champ désactivé pour éviter les modifications
          />
        </div>
        <div>
          <Label htmlFor="totalBacs">Nombre de bacs</Label>
          <Input
            id="totalBacs"
            type="number"
            placeholder="Ex: 6"
            value={totalBacs}
            onChange={(e) => setTotalBacs(Number(e.target.value))}
          />
        </div>
        <Button onClick={handleSubmit}>Ajouter</Button>
      </div>
    </div>
  );
}