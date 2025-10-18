import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppState = {
  selectedRestaurant: { id: string; name: string } | null;
  hasHydrated: boolean;
  setSelectedRestaurant: (restaurant: { id: string; name: string }) => void;
  setHasHydrated: (state: boolean) => void;
};

export const useAppStore = create(
  persist<AppState>(
    (set) => ({
      selectedRestaurant: null,
      hasHydrated: false,
      setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "selectedRestaurant-store",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);