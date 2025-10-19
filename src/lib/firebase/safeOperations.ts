/**
 * Opérations Firebase pour la gestion du coffre
 * Gère les mouvements manuels et le calcul de l'état du coffre
 */

import { db } from "@/lib/firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  limit as firestoreLimit,
} from "firebase/firestore";
import type {
  SafeMovement,
  SafeState,
  SafeMovementFormData,
  SafeCalculationResult,
} from "@/types/safe";
import type { ClosureData } from "@/types/cloture";

/**
 * Écouter les mouvements du coffre en temps réel
 */
export function listenToSafeMovements(
  restaurantId: string,
  callback: (movements: SafeMovement[]) => void
) {
  const movementsRef = collection(db, "safeMovements");
  const q = query(
    movementsRef,
    where("restaurantId", "==", restaurantId),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const movements = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SafeMovement[];
    callback(movements);
  });

  return unsubscribe;
}

/**
 * Ajouter un mouvement au coffre
 */
export async function addSafeMovement(
  restaurantId: string,
  movementData: SafeMovementFormData,
  userId: string,
  userName: string
): Promise<string> {
  const movementsRef = collection(db, "safeMovements");

  const movement: Omit<SafeMovement, "id"> = {
    restaurantId,
    date: movementData.date
      ? Timestamp.fromDate(movementData.date)
      : Timestamp.now(),
    type: movementData.type,
    category: movementData.category,
    amount: Math.abs(movementData.amount), // Toujours positif
    description: movementData.description,
    createdBy: userId,
    createdByName: userName,
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(movementsRef, movement);
  return docRef.id;
}

/**
 * Récupérer l'état actuel du coffre (optimisé)
 */
export async function getSafeState(
  restaurantId: string
): Promise<SafeState | null> {
  const stateRef = doc(db, "safeStates", restaurantId);
  const stateSnap = await getDoc(stateRef);

  if (stateSnap.exists()) {
    return {
      restaurantId,
      ...stateSnap.data(),
    } as SafeState;
  }

  return null;
}

/**
 * Écouter l'état du coffre en temps réel
 */
export function listenToSafeState(
  restaurantId: string,
  callback: (state: SafeState | null) => void
) {
  const stateRef = doc(db, "safeStates", restaurantId);

  const unsubscribe = onSnapshot(stateRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        restaurantId,
        ...snapshot.data(),
      } as SafeState);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Calculer l'état du coffre depuis la dernière mise à jour (calcul incrémental)
 */
export async function calculateSafeState(
  restaurantId: string
): Promise<SafeCalculationResult> {
  // 1. Récupérer l'état actuel (si existe)
  const currentState = await getSafeState(restaurantId);

  let extraFlowBalance = 0;
  let banqueBalance = 0;
  let closuresCount = 0;
  let movementsCount = 0;

  // 2. Si état existe, partir de ces valeurs
  if (currentState) {
    extraFlowBalance = currentState.extraFlowBalance;
    banqueBalance = currentState.banqueBalance;
  }

  // 3. Récupérer les clôtures depuis lastClosureDate (ou depuis le début)
  const closuresRef = collection(db, "closures");
  let closuresQuery = query(
    closuresRef,
    where("restaurantId", "==", restaurantId),
    orderBy("date", "asc")
  );

  if (currentState?.lastClosureDate) {
    closuresQuery = query(
      closuresRef,
      where("restaurantId", "==", restaurantId),
      where("date", ">", currentState.lastClosureDate),
      orderBy("date", "asc")
    );
  }

  const closuresSnap = await getDocs(closuresQuery);
  let lastClosureDate = currentState?.lastClosureDate;

  closuresSnap.docs.forEach((doc) => {
    const closure = doc.data() as ClosureData;
    closuresCount++;

    // Ajouter cashToSafe à la banque
    banqueBalance += closure.cashToSafe || 0;

    // Ajouter extraFlow à l'extra-flow
    const extraFlowTotal =
      closure.extraFlowEntries?.reduce((sum, e) => sum + e.amount, 0) || 0;
    extraFlowBalance += extraFlowTotal;

    // Mettre à jour la dernière date de clôture
    if (!lastClosureDate || closure.date.seconds > lastClosureDate.seconds) {
      lastClosureDate = closure.date;
    }
  });

  // 4. Récupérer les mouvements manuels depuis lastMovementDate (ou depuis le début)
  const movementsRef = collection(db, "safeMovements");
  let movementsQuery = query(
    movementsRef,
    where("restaurantId", "==", restaurantId),
    orderBy("date", "asc")
  );

  if (currentState?.lastMovementDate) {
    movementsQuery = query(
      movementsRef,
      where("restaurantId", "==", restaurantId),
      where("date", ">", currentState.lastMovementDate),
      orderBy("date", "asc")
    );
  }

  const movementsSnap = await getDocs(movementsQuery);
  let lastMovementDate = currentState?.lastMovementDate;

  movementsSnap.docs.forEach((doc) => {
    const movement = doc.data() as SafeMovement;
    movementsCount++;

    const amount = movement.amount;
    const multiplier = movement.type === "deposit" ? 1 : -1;

    if (movement.category === "extraFlow") {
      extraFlowBalance += amount * multiplier;
    } else {
      banqueBalance += amount * multiplier;
    }

    // Mettre à jour la dernière date de mouvement
    if (!lastMovementDate || movement.date.seconds > lastMovementDate.seconds) {
      lastMovementDate = movement.date;
    }
  });

  // 5. Calculer le total
  const totalBalance = extraFlowBalance + banqueBalance;
  const lastUpdate = Timestamp.now();

  // 6. Sauvegarder le nouvel état (ne pas inclure undefined)
  const newState: any = {
    restaurantId,
    extraFlowBalance,
    banqueBalance,
    totalBalance,
    lastRecalculatedAt: lastUpdate,
  };

  // Ajouter les dates optionnelles seulement si elles existent
  if (lastClosureDate) {
    newState.lastClosureDate = lastClosureDate;
  }
  if (lastMovementDate) {
    newState.lastMovementDate = lastMovementDate;
  }

  const stateRef = doc(db, "safeStates", restaurantId);
  await setDoc(stateRef, newState);

  return {
    extraFlowBalance,
    banqueBalance,
    totalBalance,
    closuresCount,
    movementsCount,
    lastUpdate,
  };
}

/**
 * Recalculer l'état du coffre depuis le début (reset complet)
 * Utile en cas de désynchronisation ou pour initialiser
 */
export async function recalculateFromScratch(
  restaurantId: string
): Promise<SafeCalculationResult> {
  // Réinitialiser l'état pour forcer un recalcul complet (ne pas inclure les dates optionnelles)
  const stateRef = doc(db, "safeStates", restaurantId);
  await setDoc(stateRef, {
    restaurantId,
    extraFlowBalance: 0,
    banqueBalance: 0,
    totalBalance: 0,
    lastRecalculatedAt: Timestamp.fromDate(new Date(0)), // Date très ancienne pour forcer le recalcul
  });

  // Recalculer depuis le début
  return await calculateSafeState(restaurantId);
}

/**
 * Récupérer les mouvements récents (pour affichage historique)
 */
export async function getRecentSafeMovements(
  restaurantId: string,
  limitCount: number = 50
): Promise<SafeMovement[]> {
  const movementsRef = collection(db, "safeMovements");
  const q = query(
    movementsRef,
    where("restaurantId", "==", restaurantId),
    orderBy("date", "desc"),
    firestoreLimit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SafeMovement[];
}
