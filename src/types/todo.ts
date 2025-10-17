import { Timestamp } from "firebase/firestore";

export type Moment = "midi_before" | "midi_after" | "soir_before" | "soir_after";
export type Jour = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
export type Frequence = "quotidien" | "hebdo";

/**
 * Template de tâche réutilisable stocké dans Firestore
 * Peut être partagé entre restaurants ou spécifique à un restaurant
 */
export interface TaskTemplate {
  id: string; // ID Firestore
  tâche: string;
  moment: Moment[];
  jours: Jour[];
  fréquence: Frequence;
  checklist_id: number; // Gardé pour compatibilité
  restaurantIds: string[]; // ["all"] ou ["restaurant_id_1", "restaurant_id_2"]
  createdAt: Timestamp;
  createdBy: string; // userId
  isActive: boolean; // Pour désactiver sans supprimer
}

/**
 * Enregistrement de complétion d'une tâche template
 * Conservation : 30 jours
 */
export interface TaskCompletion {
  id: string;
  templateId: string; // Référence au TaskTemplate
  checklist_id: number;
  completedAt: Timestamp;
  completedBy: string; // userId
  completedByName: string; // displayName pour affichage
  moment: Moment;
  jour: Jour;
  date: Timestamp; // Date du jour où la tâche a été faite
  restaurantId: string;
}

/**
 * Tâche spéciale créée ad-hoc par un utilisateur
 * Conservation : 30 jours après complétion
 */
export interface SpecialTask {
  id: string;
  tâche: string;
  assignedTo?: string; // userId
  assignedToName?: string; // displayName
  createdAt: Timestamp;
  createdBy: string; // userId
  createdByName: string; // displayName
  date?: Timestamp; // Deadline optionnelle : si absent, apparaît à tous les shifts
  moment?: Moment; // Optionnel : requis seulement si date est définie
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string; // userId
  completedByName?: string; // displayName
  restaurantId: string;
  isDeleted: boolean; // Soft delete pour cleanup manuel
}
