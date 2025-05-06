import { db } from "@/lib/firebase/firebase"; // Import de Firestore initialisé
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { Restaurant } from "@/types/restaurant";
import { ClosureData } from "@/types/cloture";
import { Ticket } from "@/types/ticket";

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const snapshot = await getDocs(collection(db, "restaurants"));
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      picture: data.picture || "",
    };
  });
};

export const addRestaurant = async (name: string, picture: string): Promise<Restaurant> => {
  const docRef = await addDoc(collection(db, "restaurants"), { name, picture });
  return { id: docRef.id, name, picture };
};

export const saveClosureData = async (closureData: ClosureData) => {
  try {
    const docRef = doc(db, "closures", closureData.timestamp); // Utilisez un ID unique
    await setDoc(docRef, closureData);
    console.log("Données sauvegardées avec succès !");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error);
    throw error;
  }
};

export async function fetchClosures(restaurantId: string): Promise<ClosureData[]> {
  const closuresRef = collection(db, "closures");
  const q = query(
    closuresRef,
    where("restaurantId", "==", restaurantId),
    orderBy("date", "desc")
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();

    // Assurez-vous que toutes les propriétés nécessaires sont présentes
    return {
      id: doc.id,
      restaurantId: data.restaurantId || "",
      date: data.date || "",
      tpeAmounts: data.tpeAmounts || [],
      cbZelty: data.cbZelty || 0,
      cashZelty: data.cashZelty || 0,
      cashOutZelty: data.cashOutZelty || 0,
      extraFlowEntries: data.extraFlowEntries || [],
      previousCash: data.previousCash || 0,
      cashToKeep: data.cashToKeep || 0,
      cashToSafe: data.cashToSafe || 0,
      tpeDiscrepancy: data.tpeDiscrepancy || 0,
      cashDiscrepancy: data.cashDiscrepancy || 0,
      cbStatus: data.cbStatus || "OK",
      cashStatus: data.cashStatus || "OK",
      validatedBy: data.validatedBy || "",
      timestamp: data.timestamp || "",
    } as ClosureData;
  });
}

export const addTicket = async (ticket: Omit<Ticket, "id">): Promise<Ticket> => {
  const docRef = await addDoc(collection(db, "tickets"), ticket);
  return { id: docRef.id, ...ticket };
};

export const fetchTickets = async (restaurantId: string): Promise<Ticket[]> => {
  const ticketsRef = collection(db, "tickets");
  const q = query(
    ticketsRef,
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Ticket[];
};

export const updateTicket = async (ticketId: string, updates: Partial<Ticket>): Promise<void> => {
  const ticketRef = doc(db, "tickets", ticketId);
  await setDoc(ticketRef, updates, { merge: true });
};

export const hideOldResolvedTickets = async (): Promise<void> => {
  const now = Timestamp.now();
  const ticketsRef = collection(db, "tickets");
  const q = query(
    ticketsRef,
    where("status", "==", "resolved"),
    where("hidden", "==", false)
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (doc) => {
    const ticket = doc.data();
    if (ticket.resolvedAt && now.seconds - ticket.resolvedAt.seconds > 72 * 60 * 60) {
      await updateTicket(doc.id, { hidden: true });
    }
  });
};