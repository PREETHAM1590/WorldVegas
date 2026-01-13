import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  address: string;
  nullifierHash: string;
  verificationLevel: 'orb' | 'device' | 'phone';
  isVerified: boolean;
}

export interface Balance {
  wld: number;
  usdc: number;
}

interface UserState {
  user: User | null;
  balance: Balance;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setBalance: (balance: Partial<Balance>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  addBalance: (currency: 'wld' | 'usdc', amount: number) => void;
  subtractBalance: (currency: 'wld' | 'usdc', amount: number) => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      balance: { wld: 0, usdc: 0 },
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),

      setBalance: (balance) =>
        set((state) => ({
          balance: { ...state.balance, ...balance },
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      logout: () => set({ user: null, balance: { wld: 0, usdc: 0 } }),

      addBalance: (currency, amount) =>
        set((state) => ({
          balance: {
            ...state.balance,
            [currency]: state.balance[currency] + amount,
          },
        })),

      subtractBalance: (currency, amount) => {
        const state = get();
        if (state.balance[currency] < amount) {
          return false;
        }
        set({
          balance: {
            ...state.balance,
            [currency]: state.balance[currency] - amount,
          },
        });
        return true;
      },
    }),
    {
      name: 'worldvegas-user',
      partialize: (state) => ({ user: state.user, balance: state.balance }),
    }
  )
);
