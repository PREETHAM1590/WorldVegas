'use client';

import { motion } from 'framer-motion';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { cn } from '@/lib/utils';

interface PracticeModeBannerProps {
  className?: string;
}

export function PracticeModeBanner({ className }: PracticeModeBannerProps) {
  const { isPracticeMode, practiceGamesPlayed, practiceWins, practiceLosses, resetPracticeStats } = usePracticeModeStore();

  if (!isPracticeMode) return null;

  const winRate = practiceGamesPlayed > 0 ? Math.round((practiceWins / practiceGamesPlayed) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div>
            <p className="font-bold text-purple-300 text-sm">Practice Mode</p>
            <p className="text-xs text-purple-200/70">Free play - No real money</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-purple-200/70">Stats</p>
            <p className="text-sm font-bold text-purple-300">
              {practiceWins}W / {practiceLosses}L ({winRate}%)
            </p>
          </div>
          <button
            onClick={resetPracticeStats}
            className="p-2 rounded-lg bg-purple-500/30 hover:bg-purple-500/50 transition-colors"
            title="Reset stats"
          >
            <RotateCcw className="w-4 h-4 text-purple-300" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface PracticeModeToggleProps {
  className?: string;
}

export function PracticeModeToggle({ className }: PracticeModeToggleProps) {
  const { isPracticeMode, togglePracticeMode } = usePracticeModeStore();

  return (
    <button
      onClick={togglePracticeMode}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all',
        isPracticeMode
          ? 'bg-purple-500 text-white'
          : 'bg-white/10 text-white/70 hover:bg-white/20',
        className
      )}
    >
      {isPracticeMode ? (
        <>
          <Sparkles className="w-4 h-4" />
          Practice Mode
        </>
      ) : (
        <>
          <Trophy className="w-4 h-4" />
          Real Mode
        </>
      )}
    </button>
  );
}

// Small indicator to show practice mode status
export function PracticeModeIndicator() {
  const { isPracticeMode } = usePracticeModeStore();

  if (!isPracticeMode) return null;

  return (
    <div className="fixed top-2 right-2 z-50 px-3 py-1 rounded-full bg-purple-500/90 text-white text-xs font-bold flex items-center gap-1 shadow-lg">
      <Sparkles className="w-3 h-3" />
      PRACTICE
    </div>
  );
}
