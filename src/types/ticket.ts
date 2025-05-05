import { Timestamp } from "firebase/firestore";

export type TicketStatus = "new" | "seen" | "in_progress" | "resolved";

export interface Ticket {
    id: string; // ID Firestore
    restaurantId: string;
    item: string;
    status: TicketStatus;
    note?: string;
    createdAt: Timestamp;
    createdBy: string;
    updatedAt?: Timestamp; // Added updatedAt property

    // Suivi de traitement
    seenAt?: Timestamp;
    resolvedAt?: Timestamp;
    updatedBy?: string;

    // Suivi livraison
    deliveryNote?: string;
    expectedDeliveryAt?: Timestamp;

    hidden?: boolean;
}
