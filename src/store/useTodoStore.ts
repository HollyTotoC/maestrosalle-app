"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { deleteField, Timestamp } from "firebase/firestore";
import { TaskTemplate, TaskCompletion, SpecialTask } from "@/types/todo";
import {
  listenToTaskTemplates,
  listenToTaskCompletions,
  listenToSpecialTasks,
  createTaskCompletion,
  deleteTaskCompletion,
  createSpecialTask,
  updateSpecialTask,
  deleteSpecialTask,
} from "@/lib/firebase/server";

type TodoStore = {
  // State
  templates: TaskTemplate[];
  completions: TaskCompletion[];
  specialTasks: SpecialTask[];

  // Actions
  setTemplates: (templates: TaskTemplate[]) => void;
  setCompletions: (completions: TaskCompletion[]) => void;
  setSpecialTasks: (tasks: SpecialTask[]) => void;

  // Helper pour vérifier si une tâche template est complétée
  isTaskCompleted: (checklistId: number, moment: string, date: Date) => boolean;

  // Helper pour récupérer l'ID de la complétion
  getCompletionId: (checklistId: number, moment: string, date: Date) => string | null;

  // Actions pour les tâches spéciales
  addSpecialTask: (task: Omit<SpecialTask, "id" | "isDeleted" | "createdAt">) => Promise<void>;
  toggleSpecialTask: (taskId: string, completedBy: string, completedByName: string) => Promise<void>;
  removeSpecialTask: (taskId: string) => Promise<void>;

  // Actions pour les complétions
  completeTask: (completion: Omit<TaskCompletion, "id" | "completedAt">) => Promise<void>;
  uncompleteTask: (checklistId: number, moment: string, date: Date) => Promise<void>;
};

export const useTodoStore = create<TodoStore>((set, get) => ({
  // State initial
  templates: [],
  completions: [],
  specialTasks: [],

  // Setters
  setTemplates: (templates) => set({ templates }),
  setCompletions: (completions) => set({ completions }),
  setSpecialTasks: (tasks) => set({ specialTasks: tasks }),

  // Vérifie si une tâche template est complétée pour un moment/date donnés
  isTaskCompleted: (checklistId, moment, date) => {
    const completions = get().completions;

    // Normaliser la date à minuit pour comparaison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return completions.some((completion) => {
      const completionDate = completion.date.toDate();
      completionDate.setHours(0, 0, 0, 0);

      return (
        completion.checklist_id === checklistId &&
        completion.moment === moment &&
        completionDate.getTime() === normalizedDate.getTime()
      );
    });
  },

  // Récupère l'ID de la complétion pour pouvoir la supprimer
  getCompletionId: (checklistId, moment, date) => {
    const completions = get().completions;

    // Normaliser la date à minuit pour comparaison
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const completion = completions.find((completion) => {
      const completionDate = completion.date.toDate();
      completionDate.setHours(0, 0, 0, 0);

      return (
        completion.checklist_id === checklistId &&
        completion.moment === moment &&
        completionDate.getTime() === normalizedDate.getTime()
      );
    });

    return completion ? completion.id : null;
  },

  // Ajoute une tâche spéciale
  addSpecialTask: async (task) => {
    await createSpecialTask(task as Omit<SpecialTask, "id" | "isDeleted">);
  },

  // Bascule l'état de complétion d'une tâche spéciale
  toggleSpecialTask: async (taskId, completedBy, completedByName) => {
    const task = get().specialTasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      // Marquer comme complétée
      await updateSpecialTask(taskId, {
        completed: true,
        completedBy,
        completedByName,
        completedAt: Timestamp.fromDate(new Date()),
      });
    } else {
      // Marquer comme non complétée et supprimer les champs de complétion
      await updateSpecialTask(taskId, {
        completed: false,
        completedBy: deleteField(),
        completedByName: deleteField(),
        completedAt: deleteField(),
      });
    }
  },

  // Supprime une tâche spéciale (soft delete)
  removeSpecialTask: async (taskId) => {
    await deleteSpecialTask(taskId);
  },

  // Complète une tâche template
  completeTask: async (completion) => {
    // completedAt sera ajouté automatiquement par createTaskCompletion
    await createTaskCompletion(completion as Omit<TaskCompletion, "id">);
  },

  // Décomplète une tâche template
  uncompleteTask: async (checklistId, moment, date) => {
    const completionId = get().getCompletionId(checklistId, moment, date);
    if (completionId) {
      await deleteTaskCompletion(completionId);
    }
  },
}));

/**
 * Hook pour synchroniser le store avec Firebase en temps réel
 * À utiliser dans un composant racine (ex: page principale)
 *
 * @param restaurantId - ID du restaurant à synchroniser
 * @param centerDate - Date centrale pour charger les complétions (±3 jours)
 */
export function useTodoStoreSync(restaurantId: string, centerDate: Date = new Date()) {
  useEffect(() => {
    if (!restaurantId) return;

    console.log("🔄 Synchronisation des todos pour le restaurant:", restaurantId);

    // Calculer la plage de dates (±3 jours)
    const startDate = new Date(centerDate);
    startDate.setDate(startDate.getDate() - 3);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(centerDate);
    endDate.setDate(endDate.getDate() + 3);
    endDate.setHours(23, 59, 59, 999);

    // Écouter les templates
    const unsubscribeTemplates = listenToTaskTemplates(restaurantId, (templates) => {
      console.log(`📋 ${templates.length} templates chargés`);
      useTodoStore.getState().setTemplates(templates);
    });

    // Écouter les complétions (±3 jours)
    const unsubscribeCompletions = listenToTaskCompletions(
      restaurantId,
      startDate,
      endDate,
      (completions) => {
        console.log(`✅ ${completions.length} complétions chargées`);
        useTodoStore.getState().setCompletions(completions);
      }
    );

    // Écouter les tâches spéciales
    const unsubscribeSpecialTasks = listenToSpecialTasks(restaurantId, (tasks) => {
      console.log(`⭐ ${tasks.length} tâches spéciales chargées`);
      useTodoStore.getState().setSpecialTasks(tasks);
    });

    // Cleanup
    return () => {
      console.log("🔌 Désabonnement des listeners todos");
      unsubscribeTemplates();
      unsubscribeCompletions();
      unsubscribeSpecialTasks();
    };
  }, [restaurantId, centerDate.toDateString()]); // Re-sync si le restaurant ou la date change
}
