import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  currency: 'wld' | 'usdc';
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  timestamp: number;
  errorMessage?: string;
}

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  clearTransactions: () => void;
}

// World Chain Explorer URL (WorldScan)
export const WORLD_CHAIN_EXPLORER = 'https://worldscan.org/tx/';

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions].slice(0, 100), // Keep last 100
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      getTransactionById: (id) => get().transactions.find((t) => t.id === id),

      clearTransactions: () => set({ transactions: [] }),
    }),
    {
      name: 'worldvegas-transactions',
    }
  )
);
