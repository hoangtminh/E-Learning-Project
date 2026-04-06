import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
};

type UserState = {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
