"use client";

import { useAppStore } from "@/store/store";
import { useUserStore } from "@/store/useUserStore";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * HydrationGuard ensures all persisted stores are hydrated before rendering children.
 * This prevents SSR hydration mismatches by waiting for client-side rehydration to complete.
 */
export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const appStoreHydrated = useAppStore((state) => state.hasHydrated);
  const userStoreHydrated = useUserStore((state) => state.hasHydrated);
  const closuresStoreHydrated = useClosuresStore((state) => state.hasHydrated);
  const themeStoreHydrated = useThemeStore((state) => state.hasHydrated);

  // Wait for all stores to be hydrated
  if (!appStoreHydrated || !userStoreHydrated || !closuresStoreHydrated || !themeStoreHydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black dark:bg-black">
        <div className="flex flex-col items-center gap-6">
          <div className="font-mono text-sm text-white tracking-[0.3em] uppercase animate-pulse">
            Initialisation
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0ms]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:150ms]"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:300ms]"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
