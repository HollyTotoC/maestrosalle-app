// Type pour les données du formulaire
export type FormData = {
  date?: Date;
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
export type ClosureData = FormData & {
  validatedBy: string;
  timestamp: string;
  restaurantId?: string;
};