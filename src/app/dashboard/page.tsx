"use client";

import Navbar from "@/components/Navbar";
import RestaurantSelector from "@/components/RestaurantSelector";
import { useUserStore } from "@/store/useUserStore"; // Import Zustand store
import { useAppStore } from "@/store/store"; // Import Zustand store for app state
import { Toaster } from "@/components/ui/sonner"; // Import Sonner's Toaster component
import ToolsSection from "@/components/ToolsSection/ToolsSection";
import TodoSection from "@/components/TodoSection";
import RecapSection from "@/components/recap/RecapSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

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
                <main className="p-4 flex flex-col gap-6 w-full grow max-w-6xl mx-auto">
                    {!selectedRestaurant ? (
                        <RestaurantSelector />
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Titre et description uniquement si resto sélectionné */}
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-2">
                                    <FontAwesomeIcon icon={faChartLine} />
                                    Tableau de bord
                                </h1>
                                <p className="text-muted-foreground">
                                    Bienvenue {displayName || "Utilisateur"}, retrouvez ici vos outils et statistiques.
                                </p>
                            </div>
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
