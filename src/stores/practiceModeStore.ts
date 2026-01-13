import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PracticeModeState {
  isPracticeMode: boolean;
  practiceGamesPlayed: number;
  practiceWins: number;
  practiceLosses: number;

  // Actions
  enablePracticeMode: () => void;
  disablePracticeMode: () => void;
  togglePracticeMode: () => void;
  recordPracticeResult: (won: boolean) => void;
  resetPracticeStats: () => void;
}

export const usePracticeModeStore = create<PracticeModeState>()(
  persist(
    (set) => ({
      isPracticeMode: false,
      practiceGamesPlayed: 0,
      practiceWins: 0,
      practiceLosses: 0,

      enablePracticeMode: () => set({ isPracticeMode: true }),

      disablePracticeMode: () => set({ isPracticeMode: false }),

      togglePracticeMode: () => set((state) => ({ isPracticeMode: !state.isPracticeMode })),

      recordPracticeResult: (won) =>
        set((state) => ({
          practiceGamesPlayed: state.practiceGamesPlayed + 1,
          practiceWins: state.practiceWins + (won ? 1 : 0),
          practiceLosses: state.practiceLosses + (won ? 0 : 1),
        })),

      resetPracticeStats: () =>
        set({
          practiceGamesPlayed: 0,
          practiceWins: 0,
          practiceLosses: 0,
        }),
    }),
    {
      name: 'worldvegas-practice-mode',
    }
  )
);
