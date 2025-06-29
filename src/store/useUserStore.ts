import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "admin" | "CDI" | "manager" | "cuisine" | "extra" | null;

interface UserStore {
    userId: string | null;
    role: Role;
    email: string | null;
    restaurantId: string | null;
    avatarUrl: string | null;
    displayName: string | null;
    isAdmin: boolean;
    since: string | null;
    phone: string | null;
    birthday: string | null;
    setUser: (
        userId: string | null,
        role: Role | null,
        email: string | null,
        restaurantId: string | null,
        avatarUrl: string | null,
        displayName: string | null,
        isAdmin?: boolean,
        since?: string | null,
        phone?: string | null,
        birthday?: string | null
    ) => void;
    logout: () => void;
}

export const useUserStore = create(
    persist<UserStore>(
        (set) => ({
            userId: null,
            email: null,
            role: null,
            restaurantId: null,
            avatarUrl: null,
            displayName: null,
            isAdmin: false,
            since: null,
            phone: null,
            birthday: null,
            setUser: (userId, role, email, restaurantId, avatarUrl, displayName, isAdmin, since, phone, birthday) =>
                set({ userId, email, role, restaurantId, avatarUrl, displayName, isAdmin, since, phone, birthday }),
            logout: () =>
                set({
                    userId: null,
                    role: null,
                    email: null,
                    restaurantId: null,
                    avatarUrl: null,
                    displayName: null,
                    isAdmin: false,
                    since: null,
                    phone: null,
                    birthday: null,
                }),
        }),
        {
            name: "user-store", // Key for localStorage
        }
    )
);
