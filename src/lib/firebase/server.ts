import { db } from "@/lib/firebase/firebase"; // Import de Firestore initialisé
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  limit,
  FieldValue,
} from "firebase/firestore";
import { Restaurant } from "@/types/restaurant";
import { ClosureData } from "@/types/cloture";
import { Ticket } from "@/types/ticket";
import { BatchUpdate, TiramisuBatch } from "@/types/tiramisu";
import { User } from "@/types/user";

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

export const listenToUsers = (callback?: (users: Record<string, User>) => void) => {
  const usersRef = collection(db, "users");

  const unsubscribe = onSnapshot(usersRef, (snapshot) => {
    const usersRecord: Record<string, User> = {};
    snapshot.docs.forEach((doc) => {
      usersRecord[doc.id] = doc.data() as User;
    });

    if (callback) {
      callback(usersRecord);
    } else {
      // Auto-sync avec le store si pas de callback
      import("@/store/useUsersStore").then(({ useUsersStore }) => {
        useUsersStore.getState().setUsers(usersRecord);
      });
    }
  });

  return unsubscribe;
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

export const deleteTicket = async (ticketId: string): Promise<void> => {
  const ticketRef = doc(db, "tickets", ticketId);
  await deleteDoc(ticketRef);
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

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const closure = snapshot.docs[0].data();
      return closure.cashToKeep ?? null; // Retourner `cashToKeep` si disponible
    }

    return null; // Aucune valeur trouvée
  } catch (error) {
    console.error("Error fetching previous cash:", error);
    throw error;
  }
};

export const addBatch = async (batch: {
  createdBy: string;
  totalBacs: number;
}): Promise<void> => {
  const newBatch = {
    createdBy: batch.createdBy,
    createdAt: Timestamp.now(),
    totalBacs: batch.totalBacs,
    consumedBacs: 0,
    partialConsumption: 0,
    remainingBacs: batch.totalBacs, // Champ calculé
    history: [],
  };

  try {
    await addDoc(collection(db, "batches"), newBatch);
  } catch (error) {
    console.error("Erreur lors de l'ajout du batch :", error);
    throw error;
  }
};

export const listenToBatchesFiltered = (callback: (batches: TiramisuBatch[]) => void) => {
  const batchesRef = collection(db, "batches");
  const q = query(batchesRef, orderBy("createdAt", "asc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const batches = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
        } as TiramisuBatch;
      })
      .filter((batch) => {
        // Filtrer les batches qui ont encore du stock restant
        const remaining = batch.totalBacs - batch.consumedBacs - batch.partialConsumption;
        return remaining > 0;
      });

    callback(batches);
  });

  return unsubscribe; // Permet de stopper l'écoute si nécessaire
};

export const updateTiramisuStock = async (update: {
  updatedBy: string;
  remainingBacs: number; // Stock restant déclaré par l'utilisateur
  partialConsumption: number; // Pourcentage du bac partiellement consommé
}): Promise<void> => {
  const batchesRef = collection(db, "batches");
  const q = query(batchesRef, orderBy("createdAt", "asc")); // FIFO : traiter les plus anciens en premier

  const snapshot = await getDocs(q);

  // Calculer le stock ACTUELLEMENT restant (pas le total initial)
  const currentRemainingBacs = snapshot.docs.reduce((acc, doc) => {
    const batch = doc.data() as TiramisuBatch;
    return acc + (batch.totalBacs - batch.consumedBacs - batch.partialConsumption);
  }, 0);

  // Calculer combien on doit consommer par rapport au stock actuel
  let toConsumePercentage = (currentRemainingBacs - update.remainingBacs - update.partialConsumption) * 100;
  const batchUpdates: BatchUpdate[] = [];

  snapshot.forEach((doc) => {
    const batch = doc.data() as TiramisuBatch;

    const batchTotalPercentage = batch.totalBacs * 100; // Stock total en %
    const batchConsumedPercentage =
      batch.consumedBacs * 100 + batch.partialConsumption * 100; // Stock consommé en %
    const batchRemainingPercentage = batchTotalPercentage - batchConsumedPercentage; // Stock restant en %

    if (toConsumePercentage <= 0) {
      // Si toute la consommation a été appliquée, arrêter
      return;
    }

    if (toConsumePercentage >= batchRemainingPercentage) {
      // Consommer tout le batch
      toConsumePercentage -= batchRemainingPercentage;

      batchUpdates.push({
        batchRef: doc.ref,
        update: {
          consumedBacs: batch.totalBacs,
          partialConsumption: 0,
          remainingBacs: 0,
          history: [
            ...batch.history,
            {
              updatedAt: Timestamp.now(),
              updatedBy: update.updatedBy,
              consumedBacs: batch.totalBacs - batch.consumedBacs,
              partialConsumption: 1 - batch.partialConsumption,
            },
          ],
        },
      });
    } else {
      // Consommer partiellement le batch
      const consumedPercentage = toConsumePercentage;
      const consumedBacs = Math.floor(consumedPercentage / 100);
      const partial = (consumedPercentage % 100) / 100;
      const newPartial = batch.partialConsumption + partial;

      let finalConsumedBacs = batch.consumedBacs + consumedBacs;
      let finalPartialConsumption = newPartial;

      if (newPartial >= 1) {
        finalConsumedBacs += 1;
        finalPartialConsumption = newPartial - 1;
      }

      batchUpdates.push({
        batchRef: doc.ref,
        update: {
          consumedBacs: finalConsumedBacs,
          partialConsumption: finalPartialConsumption,
          remainingBacs:
            batch.totalBacs -
            finalConsumedBacs -
            finalPartialConsumption,
          history: [
            ...batch.history,
            {
              updatedAt: Timestamp.now(),
              updatedBy: update.updatedBy,
              consumedBacs,
              partialConsumption: partial,
            },
          ],
        },
      });

      toConsumePercentage = 0; // Toute la consommation a été appliquée
    }
  });

  // Appliquer les mises à jour
  const batchPromises = batchUpdates.map(({ batchRef, update }) =>
    setDoc(batchRef, update, { merge: true })
  );

  try {
    await Promise.all(batchPromises);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du stock :", error);
    throw error;
  }
};

// Enregistre les disponibilités hebdo d'un utilisateur pour une semaine donnée
export const saveUserDispos = async ({
  semaineStart,
  semaineEnd,
  userId,
  data,
}: {
  semaineStart: Date;
  semaineEnd: Date;
  userId: string;
  data: import("@/types/dispos").UserDispos;
}) => {
  // Génère l'UID de la semaine (YYYY-MM-DD du lundi)
  const semaineUid = semaineStart.toISOString().slice(0, 10);
  // Références Firestore
  const semaineRef = doc(db, "disponibilites", semaineUid);
  const userRef = doc(db, `disponibilites/${semaineUid}/users`, userId);

  // 1. Stocke les métadonnées de la semaine (si besoin)
  await setDoc(semaineRef, {
    metadata: {
      semaineStart: Timestamp.fromDate(semaineStart),
      semaineEnd: Timestamp.fromDate(semaineEnd),
    },
  }, { merge: true });

  // 2. Nettoyage strict des données utilisateur
  const cleanDisponibilites: Record<string, { midi: { dispo: boolean; priorite: number }; soir: { dispo: boolean; priorite: number } }> = {};
  for (const [dateISO, day] of Object.entries(data.disponibilites)) {
    cleanDisponibilites[dateISO] = {
      midi: {
        dispo: Boolean(day.midi.dispo),
        priorite: Number(day.midi.priorite),
      },
      soir: {
        dispo: Boolean(day.soir.dispo),
        priorite: Number(day.soir.priorite),
      },
    };
  }
  const cleanData = {
    role: data.role,
    shiftsSouhaites: Number(data.shiftsSouhaites),
    preference: data.preference,
    disponibilites: cleanDisponibilites,
  };

  // 3. Stocke les dispos de l'utilisateur
  await setDoc(userRef, cleanData, { merge: true });
};

// ============================================================
// FONCTIONS TODO
// ============================================================

/**
 * Écoute en temps réel les templates de tâches actifs pour un restaurant
 * @param restaurantId - ID du restaurant ou "all" pour tous les templates globaux
 * @param callback - Fonction appelée avec les templates mis à jour
 * @returns Fonction de désabonnement
 */
export const listenToTaskTemplates = (
  restaurantId: string,
  callback: (templates: import("@/types/todo").TaskTemplate[]) => void
) => {
  const templatesRef = collection(db, "taskTemplates");
  const q = query(
    templatesRef,
    where("isActive", "==", true),
    orderBy("checklist_id", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as import("@/types/todo").TaskTemplate[];

    // Filtrer pour ne garder que les templates pour ce restaurant
    const filteredTemplates = templates.filter(
      (template) =>
        template.restaurantIds.includes("all") ||
        template.restaurantIds.includes(restaurantId)
    );

    callback(filteredTemplates);
  });

  return unsubscribe;
};

/**
 * Crée un nouveau template de tâche
 * @param template - Données du template (sans id)
 * @returns Le template créé avec son ID
 */
export const createTaskTemplate = async (
  template: Omit<import("@/types/todo").TaskTemplate, "id">
): Promise<import("@/types/todo").TaskTemplate> => {
  const docRef = await addDoc(collection(db, "taskTemplates"), {
    ...template,
    createdAt: Timestamp.now(),
    isActive: true,
  });
  return { id: docRef.id, ...template };
};

/**
 * Met à jour un template de tâche existant
 * @param templateId - ID du template à mettre à jour
 * @param updates - Champs à mettre à jour
 */
export const updateTaskTemplate = async (
  templateId: string,
  updates: Partial<import("@/types/todo").TaskTemplate>
): Promise<void> => {
  const templateRef = doc(db, "taskTemplates", templateId);
  await setDoc(templateRef, updates, { merge: true });
};

/**
 * Crée un enregistrement de complétion de tâche
 * @param completion - Données de complétion (sans id)
 * @returns La complétion créée avec son ID
 */
export const createTaskCompletion = async (
  completion: Omit<import("@/types/todo").TaskCompletion, "id">
): Promise<import("@/types/todo").TaskCompletion> => {
  const docRef = await addDoc(collection(db, "taskCompletions"), {
    ...completion,
    completedAt: Timestamp.now(),
  });
  return { id: docRef.id, ...completion };
};

/**
 * Écoute en temps réel les complétions de tâches pour une période donnée (±3 jours)
 * @param restaurantId - ID du restaurant
 * @param startDate - Date de début (date actuelle - 3 jours)
 * @param endDate - Date de fin (date actuelle + 3 jours)
 * @param callback - Fonction appelée avec les complétions mises à jour
 * @returns Fonction de désabonnement
 */
export const listenToTaskCompletions = (
  restaurantId: string,
  startDate: Date,
  endDate: Date,
  callback: (completions: import("@/types/todo").TaskCompletion[]) => void
) => {
  const completionsRef = collection(db, "taskCompletions");
  const q = query(
    completionsRef,
    where("restaurantId", "==", restaurantId),
    where("date", ">=", Timestamp.fromDate(startDate)),
    where("date", "<=", Timestamp.fromDate(endDate)),
    orderBy("date", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const completions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as import("@/types/todo").TaskCompletion[];
    callback(completions);
  });

  return unsubscribe;
};

/**
 * Supprime une complétion de tâche (pour "décocher" une tâche)
 * @param completionId - ID de la complétion à supprimer
 */
export const deleteTaskCompletion = async (completionId: string): Promise<void> => {
  const completionRef = doc(db, "taskCompletions", completionId);
  await deleteDoc(completionRef);
};

/**
 * Supprime les complétions de tâches datant de plus de 30 jours
 * (Fonction manuelle à appeler périodiquement - pas de Cloud Function)
 * @param restaurantId - ID du restaurant (optionnel, sinon tous les restaurants)
 */
export const deleteOldTaskCompletions = async (
  restaurantId?: string
): Promise<void> => {
  const completionsRef = collection(db, "taskCompletions");
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let q;
  if (restaurantId) {
    q = query(
      completionsRef,
      where("restaurantId", "==", restaurantId),
      where("date", "<", Timestamp.fromDate(thirtyDaysAgo))
    );
  } else {
    q = query(
      completionsRef,
      where("date", "<", Timestamp.fromDate(thirtyDaysAgo))
    );
  }

  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));

  await Promise.all(deletePromises);
};

/**
 * Crée une nouvelle tâche spéciale
 * @param task - Données de la tâche (sans id)
 * @returns La tâche créée avec son ID
 */
export const createSpecialTask = async (
  task: Omit<import("@/types/todo").SpecialTask, "id" | "isDeleted">
): Promise<import("@/types/todo").SpecialTask> => {
  const docRef = await addDoc(collection(db, "specialTasks"), {
    ...task,
    createdAt: Timestamp.now(),
    isDeleted: false,
  });
  return { id: docRef.id, isDeleted: false, ...task };
};

/**
 * Type pour les mises à jour de tâches spéciales
 * Permet d'utiliser deleteField() pour supprimer des champs optionnels
 */
type SpecialTaskUpdate = Partial<{
  [K in keyof import("@/types/todo").SpecialTask]:
    import("@/types/todo").SpecialTask[K] | FieldValue;
}>;

/**
 * Met à jour une tâche spéciale (généralement pour la marquer comme complétée)
 * @param taskId - ID de la tâche à mettre à jour
 * @param updates - Champs à mettre à jour (peut inclure deleteField() pour les champs optionnels)
 */
export const updateSpecialTask = async (
  taskId: string,
  updates: SpecialTaskUpdate
): Promise<void> => {
  const taskRef = doc(db, "specialTasks", taskId);
  await setDoc(taskRef, updates, { merge: true });
};

/**
 * Supprime une tâche spéciale (soft delete)
 * @param taskId - ID de la tâche à supprimer
 */
export const deleteSpecialTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, "specialTasks", taskId);
  await setDoc(taskRef, { isDeleted: true }, { merge: true });
};

/**
 * Écoute en temps réel les tâches spéciales actives (non supprimées)
 * Inclut les tâches complétées depuis moins de 7 jours
 * @param restaurantId - ID du restaurant
 * @param callback - Fonction appelée avec les tâches mises à jour
 * @returns Fonction de désabonnement
 */
export const listenToSpecialTasks = (
  restaurantId: string,
  callback: (tasks: import("@/types/todo").SpecialTask[]) => void
) => {
  const tasksRef = collection(db, "specialTasks");
  const q = query(
    tasksRef,
    where("restaurantId", "==", restaurantId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

    const tasks = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((task) => {
        const t = task as import("@/types/todo").SpecialTask;
        // Inclure toutes les tâches non complétées
        if (!t.completed) return true;
        // Inclure les tâches complétées il y a moins de 7 jours
        if (t.completedAt && t.completedAt.seconds >= sevenDaysAgoTimestamp.seconds) {
          return true;
        }
        return false;
      }) as import("@/types/todo").SpecialTask[];

    callback(tasks);
  });

  return unsubscribe;
};

/**
 * Marque comme supprimées les tâches spéciales complétées il y a plus de 30 jours
 * (Fonction manuelle à appeler périodiquement - pas de Cloud Function)
 * @param restaurantId - ID du restaurant (optionnel, sinon tous les restaurants)
 */
export const cleanupOldSpecialTasks = async (
  restaurantId?: string
): Promise<void> => {
  const tasksRef = collection(db, "specialTasks");
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

  let q;
  if (restaurantId) {
    q = query(
      tasksRef,
      where("restaurantId", "==", restaurantId),
      where("completed", "==", true),
      where("completedAt", "<", thirtyDaysAgoTimestamp),
      where("isDeleted", "==", false)
    );
  } else {
    q = query(
      tasksRef,
      where("completed", "==", true),
      where("completedAt", "<", thirtyDaysAgoTimestamp),
      where("isDeleted", "==", false)
    );
  }

  const snapshot = await getDocs(q);
  const updatePromises = snapshot.docs.map((doc) =>
    setDoc(doc.ref, { isDeleted: true }, { merge: true })
  );

  await Promise.all(updatePromises);
};