'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  department?: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        set({ user: null });
        window.location.href = '/login';
      },
    }),
    { name: 'taskflow-auth', partialize: (s) => ({ user: s.user }) }
  )
);
