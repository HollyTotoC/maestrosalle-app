import { Timestamp, DocumentReference } from "firebase/firestore";

export type TiramisuBatch = {
  id: string; // ID unique du batch
  createdBy: string; // Nom de la personne ayant préparé le batch
  createdAt: Timestamp; // Date de création
  totalBacs: number; // Nombre total de bacs créés
  consumedBacs: number; // Nombre de bacs entièrement consommés
  partialConsumption: number; // Pourcentage de bac entamé (entre 0 et 1)
  remainingBacs: number; // Nombre de bacs restants
  history: {
    updatedAt: Timestamp; // Date de mise à jour
    updatedBy: string; // Nom de la personne ayant effectué la mise à jour
    consumedBacs: number; // Nombre de bacs consommés
    partialConsumption: number; // Pourcentage de bac entamé
  }[]; // Historique des mises à jour
};

export type BatchUpdate = {
  batchRef: DocumentReference; // Référence au document Firestore
  update: Partial<TiramisuBatch>; // Mise à jour partielle des données du batch
};

export type Bac = 
  | { type: "full"; batch: TiramisuBatch }
  | { type: "partial"; batch: TiramisuBatch; width: number };

  