"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { User } from "@/types/user";
import { create } from "zustand";

// adapte selon ta structure
type UsersStore = {
  users: Record<string, User>;
  setUsers: (users: Record<string, User>) => void;
};

export const useUsersStore = create<UsersStore>((set) => ({
  users: {},
  setUsers: (users) => set({ users }),
}));

// Hook pour auto-remplir le store usersStore côté client
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