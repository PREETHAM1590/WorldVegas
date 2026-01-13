import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

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
  _hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setBalance: (balance: Partial<Balance>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  addBalance: (currency: 'wld' | 'usdc', amount: number) => void;
  subtractBalance: (currency: 'wld' | 'usdc', amount: number) => boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      balance: { wld: 0, usdc: 0 },
      isLoading: false,
      error: null,
      _hasHydrated: false,

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

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'worldvegas-user',
      partialize: (state) => ({ user: state.user, balance: state.balance }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hook to check if store has hydrated
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Check if already hydrated
    const storeHydrated = useUserStore.getState()._hasHydrated;
    if (storeHydrated) {
      setHasHydrated(true);
      return;
    }

    // Subscribe to hydration
    const unsubscribe = useUserStore.subscribe(
      (state) => {
        if (state._hasHydrated) {
          setHasHydrated(true);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return hasHydrated;
}
