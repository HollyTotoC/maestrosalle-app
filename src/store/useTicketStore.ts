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
    // Mise à jour optimiste locale (immédiate dans l'UI)
    const currentTickets = get().tickets;
    const optimisticTickets = currentTickets.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, ...updates, updatedAt: Timestamp.now() }
        : ticket
    );
    set({ tickets: optimisticTickets });

    // Puis mise à jour Firebase (le listener synchronisera si besoin)
    await updateTicketInFirebase(ticketId, updates);
  },
  deleteTicket: async (ticketId) => {
    // Mise à jour optimiste locale (suppression immédiate dans l'UI)
    const currentTickets = get().tickets;
    const optimisticTickets = currentTickets.filter(ticket => ticket.id !== ticketId);
    set({ tickets: optimisticTickets });

    // Puis suppression de Firebase (le listener synchronisera si besoin)
    await deleteTicketFromFirebase(ticketId);
  },
  syncHiddenTickets: async () => {
    await hideOldResolvedTickets();
    const tickets = get().tickets.filter((ticket) => !ticket.hidden);
    set({ tickets });
  },
}));