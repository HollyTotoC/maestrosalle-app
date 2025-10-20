"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/store";

/**
 * Composant qui met à jour dynamiquement le titre de l'onglet
 * avec le nom du restaurant sélectionné
 */
export default function DynamicTitle() {
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const [mounted, setMounted] = useState(false);

  // Attendre que le composant soit monté côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !hasHydrated) return;

    if (selectedRestaurant) {
      document.title = `MaestroSalle : ${selectedRestaurant.name}`;
    } else {
      document.title = "MaestroSalle - Gestion Restaurant";
    }
  }, [selectedRestaurant, hasHydrated, mounted]);

  return null;
}
