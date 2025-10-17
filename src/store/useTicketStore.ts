import { create } from "zustand";
import { Ticket } from "@/types/ticket";
import {
  fetchTickets,
  addTicket as addTicketToFirebase,
  updateTicket as updateTicketInFirebase,
  deleteTicket as deleteTicketFromFirebase,
  hideOldResolvedTickets
} from "@/lib/firebase/server";
import { Timestamp } from "firebase/firestore";

interface TicketStore {
  tickets: Ticket[];
  lastFetchedAt: Timestamp | null; // Timestamp de la dernière synchronisation
  fetchTickets: (restaurantId: string) => Promise<void>;
  addTicket: (ticket: Omit<Ticket, "id">) => Promise<void>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  syncHiddenTickets: () => Promise<void>; // Nouvelle fonction pour synchroniser les tickets masqués
  setTickets: (tickets: Ticket[]) => void; // Nouvelle fonction pour définir les tickets
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  lastFetchedAt: null,
  fetchTickets: async (restaurantId) => {
    const now = Timestamp.now();
    const lastFetchedAt = get().lastFetchedAt;

    // Si les données ont été synchronisées récemment, ne pas refetch
    if (lastFetchedAt && now.seconds - lastFetchedAt.seconds < 60) {
      console.log("Les données sont déjà à jour.");
      return;
    }

    const tickets = await fetchTickets(restaurantId);
    set({ tickets, lastFetchedAt: now });
  },
  setTickets: (tickets) => {
    set({ tickets });
  },
  addTicket: async (ticket) => {
    // On ajoute juste à Firebase, le listener mettra à jour le store automatiquement
    await addTicketToFirebase(ticket);
  },
  updateTicket: async (ticketId, updates) => {
    // On met à jour juste Firebase, le listener mettra à jour le store automatiquement
    await updateTicketInFirebase(ticketId, updates);
  },
  deleteTicket: async (ticketId) => {
    // On supprime juste de Firebase, le listener mettra à jour le store automatiquement
    await deleteTicketFromFirebase(ticketId);
  },
  syncHiddenTickets: async () => {
    await hideOldResolvedTickets();
    const tickets = get().tickets.filter((ticket) => !ticket.hidden);
    set({ tickets });
  },
}));