"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useThemeStore } from "@/store/useThemeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPizzaSlice } from "@fortawesome/free-solid-svg-icons";

/**
 * HydrationGuard ensures all persisted stores are hydrated before rendering children.
 * This prevents SSR hydration mismatches by waiting for client-side rehydration to complete.
 *
 * Design adapts to theme:
 * - Light Mode: Modern iOS-style loader with glassmorphism
 * - Dark Mode: Retro terminal-style loader with ASCII art
 */
export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const appStoreHydrated = useAppStore((state) => state.hasHydrated);
  const userStoreHydrated = useUserStore((state) => state.hasHydrated);
  const closuresStoreHydrated = useClosuresStore((state) => state.hasHydrated);
  const themeStoreHydrated = useThemeStore((state) => state.hasHydrated);

  // État pour savoir si on est côté client (évite hydration mismatch)
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  // Monte le composant côté client uniquement
  useEffect(() => {
    setIsMounted(true);
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Observer pour les changements de thème
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Délai minimum de 800ms pour voir le loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Wait for all stores to be hydrated AND minimum loading time
  const isLoading = !appStoreHydrated || !userStoreHydrated || !closuresStoreHydrated || !themeStoreHydrated || minLoadingTime;

  // Ne rien rendre côté serveur (évite hydration mismatch)
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-300 ${
        isDarkMode
          ? "bg-background"
          : "bg-gradient-to-br from-amber-50 via-white to-orange-50"
      }`}>

        {/* Light Mode - Modern iOS Style */}
        {!isDarkMode && (
          <div className="flex flex-col items-center gap-8 animate-fadeIn">
            {/* Logo with glassmorphism card */}
            <div className="bg-white/60 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-border/40 shadow-2xl p-8">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                <FontAwesomeIcon
                  icon={faPizzaSlice}
                  className="text-5xl sm:text-6xl text-primary animate-pulse"
                />
              </div>
            </div>

            {/* Loading text */}
            <div className="text-center space-y-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Chargement
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Dark Mode - Retro Terminal Style */}
        {isDarkMode && (
          <div className="flex flex-col items-center gap-6 font-mono text-primary animate-fadeIn">
            {/* Terminal Frame */}
            <div className="border-2 border-primary/30 rounded bg-card/50 p-6 sm:p-8 min-w-[280px] sm:min-w-[400px]">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-primary/30">
                <div className="w-3 h-3 rounded-sm border border-primary/50 bg-primary/20"></div>
                <div className="w-3 h-3 rounded-sm border border-primary/50 bg-primary/20"></div>
                <div className="w-3 h-3 rounded-sm border border-primary/50 bg-primary/20"></div>
                <span className="text-xs text-primary/60 ml-2">MAESTROSALLE v1.0</span>
              </div>

              {/* ASCII Logo */}
              <pre className="text-primary text-xs sm:text-sm mb-4 leading-tight">
{`   __  ______   _____
  /  |/  / _ | / __/
 / /|_/ / __ |_\\ \\
/_/  /_/_/ |_/___/
`}
              </pre>

              {/* Loading Status */}
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary/60">&gt;</span>
                  <span className="animate-pulse">Initialisation du système...</span>
                </div>

                {/* ASCII Progress Bar */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-primary/60">[</span>
                  <div className="flex-1 flex">
                    <span className="animate-pulse">████████</span>
                    <span className="text-primary/30">░░░░░░░░</span>
                  </div>
                  <span className="text-primary/60">]</span>
                  <span className="text-primary/60 text-xs">50%</span>
                </div>

                {/* Blinking cursor */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-primary/60">&gt;</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>

            {/* System info */}
            <div className="text-xs text-primary/40">
              LOADING WORKSPACE...
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
