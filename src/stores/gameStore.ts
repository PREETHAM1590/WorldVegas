import { create } from 'zustand';

export interface GameResult {
  id: string;
  game: 'slots' | 'blackjack' | 'prediction';
  betAmount: number;
  currency: 'wld' | 'usdc';
  outcome: 'win' | 'lose' | 'push';
  payout: number;
  timestamp: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
}

interface GameState {
  currentGame: 'slots' | 'blackjack' | 'prediction' | null;
  isPlaying: boolean;
  results: GameResult[];
  setCurrentGame: (game: 'slots' | 'blackjack' | 'prediction' | null) => void;
  setIsPlaying: (playing: boolean) => void;
  addResult: (result: GameResult) => void;
  clearResults: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentGame: null,
  isPlaying: false,
  results: [],

  setCurrentGame: (currentGame) => set({ currentGame }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  addResult: (result) =>
    set((state) => ({
      results: [result, ...state.results].slice(0, 50), // Keep last 50 results
    })),
  clearResults: () => set({ results: [] }),
}));
