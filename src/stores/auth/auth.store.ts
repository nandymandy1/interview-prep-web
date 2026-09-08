import { create } from 'zustand';
import type { AuthStatus, PublicUser } from '@/types/auth/auth.type';

type AuthState = {
  user: PublicUser | null;
  status: AuthStatus;
  setUser: (user: PublicUser) => void;
  clearUser: () => void;
  setStatus: (status: AuthStatus) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',
  setUser: (user) => set({ user, status: 'authenticated' }),
  clearUser: () => set({ user: null, status: 'unauthenticated' }),
  setStatus: (status) => set({ status }),
}));
