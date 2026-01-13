'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ArrowLeft,
  Filter,
  Shield,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Gamepad2,
  ChevronDown,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useGameStore, GameResult } from '@/stores/gameStore';
import { formatCurrency, cn } from '@/lib/utils';

type GameFilter = 'all' | 'slots' | 'blackjack' | 'aviator' | 'coinflip' | 'dice' | 'roulette' | 'mines';
type OutcomeFilter = 'all' | 'win' | 'lose' | 'push';

const GAME_EMOJIS: Record<string, string> = {
  slots: '🎰',
  blackjack: '🃏',
  aviator: '✈️',
  coinflip: '🪙',
  dice: '🎲',
  roulette: '🎡',
  mines: '💎',
  prediction: '📊',
};

const GAME_NAMES: Record<string, string> = {
  slots: 'Lucky Slots',
  blackjack: 'Blackjack',
  aviator: 'Aviator',
  coinflip: 'Coin Flip',
  dice: 'Dice',
  roulette: 'Roulette',
  mines: 'Mines',
  prediction: 'Prediction',
};

export default function HistoryPage() {
  const { results } = useGameStore();
  const [gameFilter, setGameFilter] = useState<GameFilter>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameResult | null>(null);

  // Filter results
  const filteredResults = results.filter((result) => {
    if (gameFilter !== 'all' && result.game !== gameFilter) return false;
    if (outcomeFilter !== 'all' && result.outcome !== outcomeFilter) return false;
    return true;
  });

  // Calculate stats
  const totalWins = results.filter(r => r.outcome === 'win').length;
  const totalLosses = results.filter(r => r.outcome === 'lose').length;
  const totalWagered = results.reduce((sum, r) => sum + r.betAmount, 0);
  const totalPayout = results.reduce((sum, r) => sum + (r.outcome === 'win' ? r.payout : 0), 0);
  const netProfit = totalPayout - totalWagered;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 text-[#A3A3A3]" />
              </motion.div>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Game History</h1>
              <p className="text-xs text-[#666666]">{results.length} total games</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              showFilters
                ? "bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-black"
                : "bg-[#161616] border border-[#2A2A2A] text-[#A3A3A3]"
            )}
          >
            <Filter className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00C853]/10 to-[#00C853]/5 border border-[#00C853]/20 text-center">
            <TrendingUp className="w-4 h-4 text-[#00C853] mx-auto mb-1" />
            <p className="text-sm font-bold text-[#00C853]">{totalWins}</p>
            <p className="text-[9px] text-[#666666] uppercase">Wins</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 border border-[#FF6B6B]/20 text-center">
            <TrendingDown className="w-4 h-4 text-[#FF6B6B] mx-auto mb-1" />
            <p className="text-sm font-bold text-[#FF6B6B]">{totalLosses}</p>
            <p className="text-[9px] text-[#666666] uppercase">Losses</p>
          </div>
          <div className={cn(
            "p-3 rounded-xl text-center border",
            netProfit >= 0
              ? "bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/20"
              : "bg-gradient-to-br from-[#FF6B6B]/10 to-[#FF6B6B]/5 border-[#FF6B6B]/20"
          )}>
            {netProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#FF6B6B] mx-auto mb-1" />
            )}
            <p className={cn(
              "text-sm font-bold",
              netProfit >= 0 ? "text-[#D4AF37]" : "text-[#FF6B6B]"
            )}>
              {netProfit >= 0 ? '+' : ''}{formatCurrency(netProfit)}
            </p>
            <p className="text-[9px] text-[#666666] uppercase">Net P/L</p>
          </div>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A]">
                {/* Game Filter */}
                <p className="text-xs text-[#666666] uppercase tracking-wider mb-2">Game Type</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['all', 'slots', 'blackjack', 'aviator', 'coinflip', 'dice', 'roulette', 'mines'] as const).map((game) => (
                    <button
                      key={game}
                      onClick={() => setGameFilter(game)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        gameFilter === game
                          ? "bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black"
                          : "bg-[#2A2A2A] text-[#A3A3A3] hover:bg-[#333333]"
                      )}
                    >
                      {game === 'all' ? 'All Games' : (
                        <span className="flex items-center gap-1">
                          <span>{GAME_EMOJIS[game]}</span>
                          <span className="capitalize">{game}</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Outcome Filter */}
                <p className="text-xs text-[#666666] uppercase tracking-wider mb-2">Outcome</p>
                <div className="flex gap-2">
                  {(['all', 'win', 'lose', 'push'] as const).map((outcome) => (
                    <button
                      key={outcome}
                      onClick={() => setOutcomeFilter(outcome)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-medium transition-all capitalize",
                        outcomeFilter === outcome
                          ? outcome === 'win'
                            ? "bg-[#00C853]/20 text-[#00C853] border border-[#00C853]/30"
                            : outcome === 'lose'
                            ? "bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30"
                            : "bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black border-none"
                          : "bg-[#2A2A2A] text-[#A3A3A3] border border-transparent hover:bg-[#333333]"
                      )}
                    >
                      {outcome === 'all' ? 'All' : outcome}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History List */}
        <div className="space-y-2">
          {filteredResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="w-8 h-8 text-[#666666]" />
              </div>
              <p className="text-white font-medium mb-1">No games found</p>
              <p className="text-sm text-[#666666]">
                {results.length === 0
                  ? "Play some games to see your history here"
                  : "Try adjusting your filters"}
              </p>
              <Link href="/games">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-semibold text-sm"
                >
                  Play Now
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            filteredResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedGame(result)}
                className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#D4AF37]/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
                        result.outcome === 'win'
                          ? 'bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5'
                          : result.outcome === 'push'
                          ? 'bg-[#2A2A2A]'
                          : 'bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5'
                      )}
                    >
                      {GAME_EMOJIS[result.game] || '🎮'}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{GAME_NAMES[result.game] || result.game}</p>
                      <div className="flex items-center gap-2 text-xs text-[#666666]">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(result.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        'font-bold text-lg',
                        result.outcome === 'win'
                          ? 'text-[#00C853]'
                          : result.outcome === 'push'
                          ? 'text-[#A3A3A3]'
                          : 'text-[#FF6B6B]'
                      )}
                    >
                      {result.outcome === 'win'
                        ? `+${formatCurrency(result.payout)}`
                        : result.outcome === 'push'
                        ? '0'
                        : `-${formatCurrency(result.betAmount)}`}
                    </p>
                    <p className="text-xs text-[#666666]">
                      Bet: {result.betAmount} {result.currency.toUpperCase()}
                    </p>
                  </div>
                </div>
                {result.serverSeed && (
                  <div className="mt-3 flex items-center gap-2 p-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[10px] text-[#D4AF37] font-semibold uppercase">Provably Fair</span>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Game Detail Modal */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0A0A0A] border-t border-[#2A2A2A] rounded-t-3xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="p-6 pb-0">
                <div className="w-12 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                        selectedGame.outcome === 'win'
                          ? 'bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5'
                          : selectedGame.outcome === 'push'
                          ? 'bg-[#2A2A2A]'
                          : 'bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5'
                      )}
                    >
                      {GAME_EMOJIS[selectedGame.game] || '🎮'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{GAME_NAMES[selectedGame.game]}</h2>
                      <p className="text-sm text-[#666666]">{formatFullDate(selectedGame.timestamp)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="p-2 rounded-lg bg-[#161616] border border-[#2A2A2A] hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-[#A3A3A3]" />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-24">
                {/* Result */}
                <div className={cn(
                  "p-5 rounded-xl mb-4 text-center",
                  selectedGame.outcome === 'win'
                    ? 'bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5 border border-[#00C853]/30'
                    : selectedGame.outcome === 'push'
                    ? 'bg-[#2A2A2A] border border-[#444444]'
                    : 'bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5 border border-[#FF6B6B]/30'
                )}>
                  <p className="text-sm text-[#A3A3A3] uppercase tracking-wider mb-1">
                    {selectedGame.outcome === 'win' ? 'You Won' : selectedGame.outcome === 'push' ? 'Push' : 'You Lost'}
                  </p>
                  <p className={cn(
                    "text-3xl font-bold",
                    selectedGame.outcome === 'win'
                      ? 'text-[#00C853]'
                      : selectedGame.outcome === 'push'
                      ? 'text-[#A3A3A3]'
                      : 'text-[#FF6B6B]'
                  )}>
                    {selectedGame.outcome === 'win'
                      ? `+${formatCurrency(selectedGame.payout)} ${selectedGame.currency.toUpperCase()}`
                      : selectedGame.outcome === 'push'
                      ? `0 ${selectedGame.currency.toUpperCase()}`
                      : `-${formatCurrency(selectedGame.betAmount)} ${selectedGame.currency.toUpperCase()}`}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 bg-[#161616] border border-[#2A2A2A] rounded-xl">
                    <span className="text-[#666666]">Bet Amount</span>
                    <span className="text-white font-medium">{selectedGame.betAmount} {selectedGame.currency.toUpperCase()}</span>
                  </div>
                  {selectedGame.outcome === 'win' && (
                    <div className="flex justify-between p-3 bg-[#161616] border border-[#2A2A2A] rounded-xl">
                      <span className="text-[#666666]">Payout</span>
                      <span className="text-[#00C853] font-medium">{formatCurrency(selectedGame.payout)} {selectedGame.currency.toUpperCase()}</span>
                    </div>
                  )}
                </div>

                {/* Provably Fair Verification */}
                {selectedGame.serverSeed && (
                  <div className="p-4 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-[#D4AF37]" />
                      <span className="font-semibold text-[#D4AF37]">Provably Fair Verification</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-[#666666] uppercase tracking-wider mb-1">Server Seed</p>
                        <p className="text-xs text-[#A3A3A3] font-mono break-all bg-[#0A0A0A] p-2 rounded-lg">
                          {selectedGame.serverSeed}
                        </p>
                      </div>
                      {selectedGame.clientSeed && (
                        <div>
                          <p className="text-[10px] text-[#666666] uppercase tracking-wider mb-1">Client Seed</p>
                          <p className="text-xs text-[#A3A3A3] font-mono break-all bg-[#0A0A0A] p-2 rounded-lg">
                            {selectedGame.clientSeed}
                          </p>
                        </div>
                      )}
                      {selectedGame.nonce !== undefined && (
                        <div>
                          <p className="text-[10px] text-[#666666] uppercase tracking-wider mb-1">Nonce</p>
                          <p className="text-xs text-[#A3A3A3] font-mono bg-[#0A0A0A] p-2 rounded-lg">
                            {selectedGame.nonce}
                          </p>
                        </div>
                      )}
                    </div>
                    <Link href="/legal/provably-fair">
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="mt-4 w-full py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] text-sm font-medium flex items-center justify-center gap-2"
                      >
                        Learn How to Verify
                        <ExternalLink className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
