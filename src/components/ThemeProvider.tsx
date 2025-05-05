"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  theme: string | null;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<string | null>(null);

  // Lire le cookie pour initialiser le thème
  useEffect(() => {
    const savedTheme = document.cookie
      .split("; ")
      .find((row) => row.startsWith("theme="))
      ?.split("=")[1];
    const defaultTheme =
      savedTheme ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    setTheme(defaultTheme);
    document.documentElement.classList.toggle("dark", defaultTheme === "dark");
  }, []);

  // Basculer le thème et mettre à jour le cookie
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    document.cookie = `theme=${newTheme}; path=/; max-age=${365 * 24 * 60 * 60}`; // 1 an
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
