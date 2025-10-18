"use client";

import { useEffect } from "react";
import {
  listenToTaskTemplates,
  listenToTaskCompletions,
  listenToSpecialTasks,
} from "@/lib/firebase/server";
import { useTodoStore } from "@/store/useTodoStore";

/**
 * Hook pour synchroniser le store avec Firebase en temps réel
 * À utiliser dans un composant racine (ex: page principale)
 *
 * @param restaurantId - ID du restaurant à synchroniser
 * @param centerDate - Date centrale pour charger les complétions (±3 jours)
 */
export function useTodoStoreSync(restaurantId: string, centerDate: Date = new Date()) {
  // Extraire la date en string pour la dépendance
  const centerDateString = centerDate.toDateString();

  useEffect(() => {
    if (!restaurantId) return;

    // Calculer la plage de dates (±3 jours)
    const startDate = new Date(centerDate);
    startDate.setDate(startDate.getDate() - 3);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(centerDate);
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(23, 59, 59, 999);

    // Écouter les templates
    const unsubscribeTemplates = listenToTaskTemplates(restaurantId, (templates) => {
      useTodoStore.getState().setTemplates(templates);
    });

    // Écouter les complétions (±3 jours)
    const unsubscribeCompletions = listenToTaskCompletions(
      restaurantId,
      startDate,
      endDate,
      (completions) => {
        useTodoStore.getState().setCompletions(completions);
      }
    );

    // Écouter les tâches spéciales
    const unsubscribeSpecialTasks = listenToSpecialTasks(restaurantId, (tasks) => {
      useTodoStore.getState().setSpecialTasks(tasks);
    });

    // Cleanup
    return () => {
      unsubscribeTemplates();
      unsubscribeCompletions();
      unsubscribeSpecialTasks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, centerDateString]); // Re-sync si le restaurant ou la date change
}
