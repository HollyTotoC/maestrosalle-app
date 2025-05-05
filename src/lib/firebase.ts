import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, query, where, orderBy } from 'firebase/firestore'
import { Restaurant } from "@/types/restaurant";
import { ClosureData } from '@/types/cloture';

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
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ClosureData[];
}