"use client";

import Navbar from "@/components/Navbar";
import RestaurantSelector from "@/components/RestaurantSelector";
import { useUserStore } from "@/store/useUserStore"; // Import Zustand store
import { useAppStore } from "@/store/store"; // Import Zustand store for app state
import { Toaster } from "@/components/ui/sonner"; // Import Sonner's Toaster component
import ToolsSection from "@/components/ToolsSection";
import TodoSection from "@/components/TodoSection";
import RecapSection from "@/components/RecapSection";

export default function Dashboard() {
    const displayName = useUserStore((state) => state.displayName);
    const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
    const hasHydrated = useAppStore((state) => state.hasHydrated);
    const role = useUserStore((state) => state.role);

    if (!hasHydrated) return null; // Avoid UI flicker

    return (
        <>
            <div className="crt-dome flex flex-col min-h-screen">
                <Navbar />
                <main className="p-4 flex flex-col gap-4 w-full grow max-w-6xl mx-auto">
                    <div>
                        <h1 className="text-3xl">Tableau de bord</h1>
                        <p>
                            Bienvenue dans votre tableau de bord{" "}
                            {displayName || "Utilisateur"}.
                        </p>
                    </div>
                    {!selectedRestaurant ? (
                        <RestaurantSelector />
                    ) : (
                        <div className="flex flex-col gap-6">
                            <ToolsSection />
                            <TodoSection />
                            {/* RecapSection visible uniquement si le rôle n'est pas extra */}
                            {role !== "extra" && <RecapSection />}
                        </div>
                    )}
                </main>
            </div>
            <Toaster />
        </>
    );
}
