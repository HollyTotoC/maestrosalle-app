"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { User } from "@/types/user";
import { useUsersStore } from "@/store/useUsersStore";

/**
 * Hook pour auto-remplir le store usersStore côté client
 * Synchronise tous les utilisateurs depuis Firestore en temps réel
 */
export function useUsersStoreSync() {
  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users: Record<string, User> = {};
      snapshot.forEach((doc) => {
        users[doc.id] = doc.data() as User;
      });
      useUsersStore.getState().setUsers(users);
    });
    return () => unsubscribe();
  }, []);
}
