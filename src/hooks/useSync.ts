'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore, Transaction } from '@/stores/transactionStore';
import { useGameStore, GameResult } from '@/stores/gameStore';

interface SyncResponse {
  success: boolean;
  exists?: boolean;
  userId?: string;
  balance?: { wld: number; usdc: number };
  transactions?: Transaction[];
  gameHistory?: GameResult[];
  stats?: {
    totalWagered: number;
    totalWon: number;
    gamesPlayed: number;
  };
  error?: string;
}

/**
 * Hook to sync local state with database
 * - Loads user data from database on login
 * - Saves important state changes to database
 */
export function useSync() {
  const { user, setBalance } = useUserStore();
  const { transactions } = useTransactionStore();
  const { results } = useGameStore();
  const syncedRef = useRef(false);
  const lastAddressRef = useRef<string | null>(null);

  /**
   * Load user data from database
   */
  const loadFromDatabase = useCallback(async (address: string): Promise<SyncResponse> => {
    try {
      const response = await fetch(`/api/user/sync?address=${encodeURIComponent(address)}`);
      const data = await response.json();

      if (data.success && data.exists && data.balance) {
        // Update local balance from database
        setBalance({ wld: data.balance.wld, usdc: data.balance.usdc });

        // Update transaction store if we have server data
        if (data.transactions && data.transactions.length > 0) {
          const { clearTransactions, addTransaction } = useTransactionStore.getState();
          // Only update if server has more transactions
          if (data.transactions.length > transactions.length) {
            clearTransactions();
            data.transactions.forEach((t: Transaction) => addTransaction(t));
          }
        }

        // Update game history store if we have server data
        if (data.gameHistory && data.gameHistory.length > 0) {
          const { clearResults, addResult } = useGameStore.getState();
          // Only update if server has more history
          if (data.gameHistory.length > results.length) {
            clearResults();
            data.gameHistory.forEach((g: GameResult) => addResult(g));
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Failed to load from database:', error);
      return { success: false, error: 'Network error' };
    }
  }, [setBalance, transactions.length, results.length]);

  /**
   * Save user data to database
   */
  const saveToDatabase = useCallback(async (address: string) => {
    try {
      const { balance } = useUserStore.getState();

      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          balance,
        }),
      });
    } catch (error) {
      console.error('Failed to save to database:', error);
    }
  }, []);

  /**
   * Sync on user login/change
   */
  useEffect(() => {
    if (user?.address && user.address !== lastAddressRef.current) {
      lastAddressRef.current = user.address;

      // Load data from database
      loadFromDatabase(user.address).then((response) => {
        if (response.success) {
          syncedRef.current = true;
          console.log('Synced with database');
        }
      });
    }
  }, [user?.address, loadFromDatabase]);

  /**
   * Save to database periodically and on important changes
   */
  useEffect(() => {
    if (!user?.address || !syncedRef.current) return;

    // Save after a delay to batch changes
    const timeout = setTimeout(() => {
      saveToDatabase(user.address);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user?.address, saveToDatabase, transactions.length, results.length]);

  /**
   * Save on page unload
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user?.address) {
        // Use sendBeacon for reliable unload saving
        const data = JSON.stringify({
          address: user.address,
          balance: useUserStore.getState().balance,
        });
        navigator.sendBeacon('/api/user/sync', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user?.address]);

  return {
    loadFromDatabase,
    saveToDatabase,
    isSynced: syncedRef.current,
  };
}
