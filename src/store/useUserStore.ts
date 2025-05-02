import { create } from 'zustand'

type Role = 'admin' | 'serveur' | 'manager' | 'cuisine' | null

interface UserStore {
  userId: string | null
  role: Role
  restaurantId: string | null
  setUser: (id: string, role: Role, restoId: string) => void
  logout: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  userId: null,
  role: null,
  restaurantId: null,
  setUser: (userId, role, restaurantId) =>
    set({ userId, role, restaurantId }),
  logout: () =>
    set({ userId: null, role: null, restaurantId: null }),
}))