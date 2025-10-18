import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClosureData } from "@/types/cloture";

type ClosuresStore = {
    closures: ClosureData[];
    lastUpdated: number | null; // Timestamp de la dernière mise à jour
    hasHydrated: boolean;
    setClosures: (closures: ClosureData[]) => void;
    setLastUpdated: (timestamp: number) => void;
    setHasHydrated: (hydrated: boolean) => void;
};

export const useClosuresStore = create(
    persist<ClosuresStore>(
        (set) => ({
            closures: [],
            lastUpdated: null,
            hasHydrated: false,
            setClosures: (closures) => set({ closures }),
            setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
            setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
        }),
        {
            name: "closures-store", // Key for localStorage
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);