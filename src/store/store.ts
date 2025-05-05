import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  selectedRestaurant: { id: string; name: string } | null;
  setSelectedRestaurant: (restaurant: { id: string; name: string }) => void;
};

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