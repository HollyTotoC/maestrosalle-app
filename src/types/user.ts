import { Timestamp } from "firebase/firestore";

export type User = {
  displayName: string;
  email: string;
  avatarUrl?: string;
  role: string;
  restaurantId?: string;
  createdAt?: Timestamp; // ou Date ou Timestamp selon ton usage
  phone?: string;
  birthday?: string;
  isAdmin?: boolean;
  since?: string;
};