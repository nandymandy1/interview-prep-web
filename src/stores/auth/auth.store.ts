import { create } from 'zustand';
import type { AuthStatus, PublicUser } from '@/types/auth/auth.type';

type AuthState = {
  status: AuthStatus;
  user: PublicUser | null;
  clearUser: () => void;
  setUser: (user: PublicUser) => void;
  setStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  setStatus: (status) => set({ status }),
  setUser: (user) => set({ user, status: 'authenticated' }),
  clearUser: () => set({ user: null, status: 'unauthenticated' }),
}));
