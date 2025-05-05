import { create } from "zustand";
import { Ticket } from "@/types/ticket";
import { fetchTickets, addTicket, updateTicket, hideOldResolvedTickets } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";

interface TicketStore {
  tickets: Ticket[];
  lastFetchedAt: Timestamp | null; // Timestamp de la dernière synchronisation
  fetchTickets: (restaurantId: string) => Promise<void>;
  addTicket: (ticket: Omit<Ticket, "id">) => Promise<void>;
  updateTicket: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  syncHiddenTickets: () => Promise<void>; // Nouvelle fonction pour synchroniser les tickets masqués
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
  addTicket: async (ticket) => {
    const newTicket = await addTicket(ticket);
    set((state) => ({ tickets: [newTicket, ...state.tickets] }));
  },
  updateTicket: async (ticketId, updates) => {
    await updateTicket(ticketId, updates);
    set((state) => ({
      tickets: state.tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      ),
    }));
  },
  syncHiddenTickets: async () => {
    await hideOldResolvedTickets();
    const tickets = get().tickets.filter((ticket) => !ticket.hidden);
    set({ tickets });
  },
}));