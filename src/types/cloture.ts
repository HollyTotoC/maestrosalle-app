// Type pour les données du formulaire
export type FormData = {
  date?: FirestoreTimestamp;
  cashCounted?: number;
  tpeAmounts: number[];
  cbZelty?: number;
  cashZelty?: number;
  cashOutZelty?: number; // Nouveau champ
  extraFlowEntries: { label: string; amount: number }[];
  previousCash?: number;
  cashToKeep?: number;
  cashToSafe?: number;
  tpeDiscrepancy?: number;
  cashDiscrepancy?: number;
  cbStatus?: "OK" | "alert";
  cashStatus?: "OK" | "warning" | "alert";
};

// Type pour les données de clôture
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type ClosureData = {
  id: string;
  restaurantId: string;
  date: FirestoreTimestamp;
  cashCounted?: number; // Argent physiquement compté en caisse (optionnel pour rétro-compatibilité)
  tpeAmounts: number[];
  cbZelty: number;
  cashZelty: number;
  cashOutZelty: number;
  extraFlowEntries: { label: string; amount: number }[];
  previousCash: number;
  cashToKeep: number;
  cashToSafe: number;
  tpeDiscrepancy: number;
  cashDiscrepancy: number;
  cbStatus: "OK" | "alert";
  cashStatus: "OK" | "warning" | "alert";
  validatedBy: string;
  timestamp: string;
};