import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create(
  persist<ThemeStore>(
    (set) => ({
      isDarkMode: false, // Default to light mode
      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          document.documentElement.classList.toggle("dark", newMode);
          return { isDarkMode: newMode };
        }),
    }),
    {
      name: "theme-store", // Key for localStorage
    }
  )
);