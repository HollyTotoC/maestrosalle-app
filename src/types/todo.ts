import { Timestamp } from "firebase/firestore";

export type Moment = "midi_before" | "midi_after" | "soir_before" | "soir_after";
export type Jour = "lundi" | "mardi" | "mercredi" | "jeudi" | "vendredi" | "samedi" | "dimanche";
export type Frequence = "quotidien" | "hebdo";

export interface TaskTemplate {
  tâche: string;
  moment: Moment[];
  jours: Jour[];
  fréquence: Frequence;
  checklist_id: number;
}

export interface TaskCompletion {
  id: string;
  checklist_id: number;
  completedAt: Timestamp;
  completedBy: string; // userId
  moment: Moment;
  jour: Jour;
  date: Timestamp; // Date du jour où la tâche a été faite
  restaurantId: string;
}

export interface SpecialTask {
  id: string;
  tâche: string;
  assignedTo?: string; // userId
  assignedToName?: string; // displayName
  createdAt: Timestamp;
  createdBy: string;
  date: Timestamp;
  moment: Moment;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
  restaurantId: string;
}
