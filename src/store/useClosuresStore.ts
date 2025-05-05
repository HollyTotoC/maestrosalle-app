import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClosureData } from "@/types/cloture";

type ClosuresStore = {
    closures: ClosureData[];
    lastUpdated: number | null; // Timestamp de la dernière mise à jour
    setClosures: (closures: ClosureData[]) => void;
    setLastUpdated: (timestamp: number) => void;
};

export const useClosuresStore = create(
    persist<ClosuresStore>(
        (set) => ({
            closures: [],
            lastUpdated: null,
            setClosures: (closures) => set({ closures }),
            setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
        }),
        {
            name: "closures-store", // Key for localStorage
        }
    )
);