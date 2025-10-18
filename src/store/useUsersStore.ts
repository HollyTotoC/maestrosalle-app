"use client";

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