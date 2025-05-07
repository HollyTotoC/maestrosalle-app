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
  onSnapshot,
  limit,
} from "firebase/firestore";
import { Restaurant } from "@/types/restaurant";
import { ClosureData } from "@/types/cloture";
import { Ticket } from "@/types/ticket";

export const listenToRestaurants = (callback: (restaurants: Restaurant[]) => void) => {
  const restaurantsRef = collection(db, "restaurants");

  const unsubscribe = onSnapshot(restaurantsRef, (snapshot) => {
    const restaurants = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Restaurant[];
    callback(restaurants);
  });

  return unsubscribe; // Permet de stopper l'écoute si nécessaire
};

export const addRestaurant = async (name: string, picture: string): Promise<Restaurant> => {
  const docRef = await addDoc(collection(db, "restaurants"), { name, picture });
  return { id: docRef.id, name, picture };
};

export const saveClosureData = async (closureData: ClosureData) => {
  try {
    const docRef = doc(db, "closures", closureData.timestamp); // Utilisez un ID unique
    await setDoc(docRef, {
      ...closureData,
      date: Timestamp.fromDate(new Date(closureData.date.seconds * 1000)),
    });
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

export const listenToClosures = (restaurantId: string, callback: (closures: ClosureData[]) => void) => {
  const closuresRef = collection(db, "closures");
  const q = query(
    closuresRef,
    where("restaurantId", "==", restaurantId),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const closures = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ClosureData[];
    callback(closures);
  });

  return unsubscribe; // Permet de stopper l'écoute si nécessaire
};

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

export const fetchPreviousCashToKeep = async (restaurantId: string, date: { seconds: number; nanoseconds: number }): Promise<number | null> => {
  console.log("%cserver: Starting fetchPreviousCashToKeep", "color: green");

  const closuresRef = collection(db, "closures");

  // Calculer la date de la veille en soustrayant 24 heures
  const previousDate = new Date(date.seconds * 1000);
  previousDate.setUTCDate(previousDate.getUTCDate() - 1); // Soustraire un jour
  previousDate.setUTCHours(0, 0, 0, 0); // Forcer à minuit UTC
  const previousTimestamp = Timestamp.fromDate(previousDate);

  try {
    // Requête pour récupérer les clôtures avant la date donnée
    const q = query(
      closuresRef,
      where("restaurantId", "==", restaurantId),
      where("date", "<=", previousTimestamp), // Utiliser le timestamp normalisé
      orderBy("date", "desc"),
      limit(1) // Récupérer la dernière clôture connue
    );

    console.log("%cserver: Query created successfully", "color: green");

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const closure = snapshot.docs[0].data();
      console.log("%cserver: Closure found: " + JSON.stringify(closure), "color: green");
      return closure.cashToKeep ?? null; // Retourner `cashToKeep` si disponible
    }

    console.log("%cserver: No closure found", "color: red");
    return null; // Aucune valeur trouvée
  } catch (error) {
    console.error("%cserver: Error fetching previous cash: " + error, "color: red");
    throw error;
  }
};