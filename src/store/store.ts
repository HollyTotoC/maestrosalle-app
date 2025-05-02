import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  selectedRestaurant: string | null;
  setSelectedRestaurant: (restaurant: string | null) => void;
}

export const useAppStore = create(
  persist<AppState>(
    (set) => ({
      selectedRestaurant: null,
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
    }),
    {
      name: "app-store", // Key for localStorage
    }
  )
);