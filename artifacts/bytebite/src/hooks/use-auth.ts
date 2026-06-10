import { create } from "zustand";
import {
  apiGetSession,
  apiLogin,
  apiRegister,
  apiLogout,
  type AuthUser,
} from "@/lib/auth";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  fetchUser: async () => {
    try {
      const session = await apiGetSession();
      set({ user: session?.user ?? null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
  login: async (email, password) => {
    const result = await apiLogin({ email, password });
    set({ user: result.user });
    return result.user;
  },
  register: async (name, email, password, role) => {
    const result = await apiRegister({ name, email, password, role });
    set({ user: result.user });
    return result.user;
  },
  logout: async () => {
    await apiLogout();
    set({ user: null });
  },
}));
