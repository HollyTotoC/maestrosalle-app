import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDarkMode: boolean;
  hasHydrated: boolean;
  toggleDarkMode: () => void;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useThemeStore = create(
  persist<ThemeStore>(
    (set) => ({
      isDarkMode: false, // Default to light mode
      hasHydrated: false,
      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          document.documentElement.classList.toggle("dark", newMode);
          return { isDarkMode: newMode };
        }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "theme-store", // Key for localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);