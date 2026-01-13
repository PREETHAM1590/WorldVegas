import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameType = 'slots' | 'blackjack' | 'prediction' | 'aviator' | 'coinflip' | 'dice' | 'roulette' | 'mines';

export interface GameResult {
  id: string;
  game: GameType;
  betAmount: number;
  currency: 'wld' | 'usdc';
  outcome: 'win' | 'lose' | 'push';
  payout: number;
  timestamp: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

// Pending game for crash protection
export interface PendingGame {
  id: string;
  game: GameType;
  betAmount: number;
  currency: 'wld' | 'usdc';
  timestamp: number;
  clientSeed: string;
}

interface GameState {
  currentGame: GameType | null;
  isPlaying: boolean;
  results: GameResult[];
  pendingGame: PendingGame | null;
  setCurrentGame: (game: GameType | null) => void;
  setIsPlaying: (playing: boolean) => void;
  addResult: (result: GameResult) => void;
  clearResults: () => void;
  // Crash protection
  setPendingGame: (game: PendingGame | null) => void;
  recoverPendingGame: () => PendingGame | null;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      isPlaying: false,
      results: [],
      pendingGame: null,

      setCurrentGame: (currentGame) => set({ currentGame }),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      addResult: (result) =>
        set((state) => ({
          results: [result, ...state.results].slice(0, 100), // Keep last 100 results
          pendingGame: null, // Clear pending game on result
        })),
      clearResults: () => set({ results: [] }),

      // Crash protection methods
      setPendingGame: (pendingGame) => set({ pendingGame }),
      recoverPendingGame: () => {
        const pending = get().pendingGame;
        if (pending) {
          // Clear the pending game after recovery
          set({ pendingGame: null });
        }
        return pending;
      },
    }),
    {
      name: 'worldvegas-games',
      partialize: (state) => ({
        results: state.results,
        pendingGame: state.pendingGame,
      }),
    }
  )
);
