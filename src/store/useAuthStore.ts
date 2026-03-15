import create from "zustand";

interface AuthState {
  userId: string | null;
  token: string | null;
  setUser: (userId: string, token: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  setUser: (userId, token) => set({ userId, token }),
  clear: () => set({ userId: null, token: null }),
}));
