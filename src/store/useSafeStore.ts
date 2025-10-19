/**
 * Store Zustand pour la gestion du coffre
 * Gère l'état du coffre et les mouvements en temps réel
 */

import { create } from "zustand";
import type { SafeMovement, SafeState } from "@/types/safe";

interface SafeStore {
  // État du coffre
  safeState: SafeState | null;
  setSafeState: (state: SafeState | null) => void;

  // Liste des mouvements
  movements: SafeMovement[];
  setMovements: (movements: SafeMovement[]) => void;

  // État de chargement
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // État de recalcul
  isRecalculating: boolean;
  setIsRecalculating: (recalculating: boolean) => void;

  // Erreur éventuelle
  error: string | null;
  setError: (error: string | null) => void;

  // Reset du store (pour changement de restaurant par exemple)
  reset: () => void;
}

const initialState = {
  safeState: null,
  movements: [],
  isLoading: false,
  isRecalculating: false,
  error: null,
};

export const useSafeStore = create<SafeStore>((set) => ({
  ...initialState,

  setSafeState: (state) => set({ safeState: state }),

  setMovements: (movements) => set({ movements }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setIsRecalculating: (recalculating) => set({ isRecalculating: recalculating }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
