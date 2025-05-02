import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "admin" | "serveur" | "manager" | "cuisine" | null;

interface UserStore {
    userId: string | null;
    role: Role;
    restaurantId: string | null;
    avatarUrl: string | null;
    displayName: string | null;
    setUser: (id: string, role: Role, restoId: string, avatarUrl: string, displayName: string) => void;
    logout: () => void;
}

export const useUserStore = create(
    persist<UserStore>(
        (set) => ({
            userId: null,
            role: null,
            restaurantId: null,
            avatarUrl: null,
            displayName: null,
            setUser: (userId, role, restaurantId, avatarUrl, displayName) =>
                set({ userId, role, restaurantId, avatarUrl, displayName }),
            logout: () =>
                set({
                    userId: null,
                    role: null,
                    restaurantId: null,
                    avatarUrl: null,
                    displayName: null,
                }),
        }),
        {
            name: "user-store", // Key for localStorage
        }
    )
);
