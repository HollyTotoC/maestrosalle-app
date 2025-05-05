import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { Restaurant } from "@/types/restaurant";
import { ClosureData } from '@/types/cloture';
import { Ticket } from '@/types/ticket';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("User logged in:", {
      displayName: user.displayName,
      photoURL: user.photoURL,
    });

    return user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error; // Propager l'erreur pour la gestion dans le composant
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const logout = async () => {
  await signOut(auth);
};

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