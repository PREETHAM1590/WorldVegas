'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, VolumeX, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { useToast } from '@/components/ui/Toast';
import { generateClientSeed } from '@/lib/provablyFair';
import { cn } from '@/lib/utils';

// Slot symbols with their colors and values
const SYMBOLS = [
  { id: 0, emoji: '🍒', name: 'Cherry', color: '#ef4444' },
  { id: 1, emoji: '🍋', name: 'Lemon', color: '#eab308' },
  { id: 2, emoji: '🍊', name: 'Orange', color: '#f97316' },
  { id: 3, emoji: '🍇', name: 'Grape', color: '#8b5cf6' },
  { id: 4, emoji: '🍉', name: 'Melon', color: '#22c55e' },
  { id: 5, emoji: '⭐', name: 'Star', color: '#fbbf24' },
  { id: 6, emoji: '💎', name: 'Diamond', color: '#06b6d4' },
  { id: 7, emoji: '7️⃣', name: 'Seven', color: '#ec4899' },
  { id: 8, emoji: '🎰', name: 'Jackpot', color: '#a855f7' },
  { id: 9, emoji: '💰', name: 'Money', color: '#10b981' },
];

const BET_AMOUNTS = [0.1, 0.5, 1, 5, 10];

interface SlotReelProps {
  spinning: boolean;
  finalValue: number;
  delay: number;
  onComplete?: () => void;
}

function SlotReel({ spinning, finalValue, delay, onComplete }: SlotReelProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (spinning) {
      setIsSpinning(true);
      const spinDuration = 2000 + delay;
      const intervalTime = 50;
      let elapsed = 0;

      const interval = setInterval(() => {
        elapsed += intervalTime;
        setDisplayValue(Math.floor(Math.random() * SYMBOLS.length));

        if (elapsed >= spinDuration) {
          clearInterval(interval);
          setDisplayValue(finalValue);
          setIsSpinning(false);
          onComplete?.();
        }
      }, intervalTime);

      return () => clearInterval(interval);
    }
  }, [spinning, finalValue, delay, onComplete]);

  const symbol = SYMBOLS[displayValue];

  return (
    <motion.div
      className={cn(
        'w-20 h-24 rounded-xl flex items-center justify-center',
        'bg-casino-dark border-2',
        isSpinning ? 'border-primary-500/50' : 'border-white/20'
      )}
      animate={isSpinning ? { y: [0, -5, 0] } : {}}
      transition={{ duration: 0.1, repeat: isSpinning ? Infinity : 0 }}
    >
      <motion.span
        key={displayValue}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-4xl"
        style={{ filter: isSpinning ? 'blur(2px)' : 'none' }}
      >
        {symbol.emoji}
      </motion.span>
    </motion.div>
  );
}

export function SlotsGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { setIsPlaying, addResult } = useGameStore();
  const { showToast } = useToast();

  const [betAmount, setBetAmount] = useState(BET_AMOUNTS[0]);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<[number, number, number]>([0, 0, 0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientSeed, setClientSeed] = useState(generateClientSeed());
  const [lastResult, setLastResult] = useState<{ isWin: boolean; multiplier: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  const completedReels = useRef(0);

  // Initialize game session
  const initSession = useCallback(async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user', // Replace with actual user ID
          gameType: 'slots',
          clientSeed,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setSessionId(result.sessionId);
      }
    } catch (error) {
      console.error('Failed to init session:', error);
    }
  }, [clientSeed]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const spin = async () => {
    if (isSpinning) return;
    if (balance[currency] < betAmount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    // Deduct bet
    if (!subtractBalance(currency, betAmount)) {
      showToast('Insufficient balance', 'error');
      return;
    }

    setIsSpinning(true);
    setIsPlaying(true);
    setLastResult(null);
    completedReels.current = 0;

    try {
      // Get result from server
      const response = await fetch('/api/game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          clientSeed,
          betAmount,
        }),
      });

      const result = await response.json();

      if (result.success && result.outcome) {
        const { reels: newReels, isWin, multiplier } = result.outcome as {
          reels: [number, number, number];
          isWin: boolean;
          multiplier: number;
        };

        setReels(newReels);

        // Wait for animation to complete
        setTimeout(() => {
          setIsSpinning(false);
          setIsPlaying(false);
          setLastResult({ isWin, multiplier });

          if (isWin) {
            const winAmount = betAmount * multiplier;
            addBalance(currency, winAmount);
            showToast(`You won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');

            addResult({
              id: crypto.randomUUID(),
              game: 'slots',
              betAmount,
              currency,
              outcome: 'win',
              payout: winAmount,
              timestamp: Date.now(),
              serverSeed: result.serverSeed,
              clientSeed,
              nonce: result.nonce,
            });
          } else {
            addResult({
              id: crypto.randomUUID(),
              game: 'slots',
              betAmount,
              currency,
              outcome: 'lose',
              payout: 0,
              timestamp: Date.now(),
              serverSeed: result.serverSeed,
              clientSeed,
              nonce: result.nonce,
            });
          }

          // Generate new client seed for next spin
          setClientSeed(generateClientSeed());
        }, 2500);
      }
    } catch (error) {
      console.error('Spin error:', error);
      setIsSpinning(false);
      setIsPlaying(false);
      addBalance(currency, betAmount); // Refund on error
      showToast('Something went wrong. Bet refunded.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Slot Machine */}
      <Card className="p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-gold-500 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold neon-text-gold">Lucky Slots</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5 text-white/50" />
                )}
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Reels */}
          <div className="flex justify-center gap-3 mb-6">
            {reels.map((value, index) => (
              <SlotReel
                key={index}
                spinning={isSpinning}
                finalValue={value}
                delay={index * 300}
              />
            ))}
          </div>

          {/* Win Display */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  'text-center py-3 px-6 rounded-xl mb-4',
                  lastResult.isWin
                    ? 'bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30'
                    : 'bg-white/5 border border-white/10'
                )}
              >
                {lastResult.isWin ? (
                  <p className="text-xl font-bold neon-text-gold">
                    {lastResult.multiplier}x WIN!
                  </p>
                ) : (
                  <p className="text-white/60">Try again!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bet Controls */}
          <div className="space-y-4">
            {/* Currency Toggle */}
            <div className="flex justify-center gap-2">
              {(['wld', 'usdc'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'px-4 py-2 rounded-xl font-medium transition-all',
                    currency === c
                      ? 'bg-primary-600 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  )}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Bet Amount */}
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isSpinning}
                  className={cn(
                    'px-3 py-1.5 rounded-lg font-medium text-sm transition-all',
                    betAmount === amount
                      ? 'bg-gold-500 text-casino-dark'
                      : 'bg-white/5 text-white/60 hover:bg-white/10',
                    'disabled:opacity-50'
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Spin Button */}
            <Button
              variant="gold"
              size="lg"
              onClick={spin}
              disabled={isSpinning || balance[currency] < betAmount}
              isLoading={isSpinning}
              className="w-full"
            >
              {isSpinning ? (
                'Spinning...'
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Spin ({betAmount} {currency.toUpperCase()})
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Card className="p-4">
              <h3 className="font-bold mb-3">Paytable</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>3 matching symbols</span>
                  <span className="text-gold-400">10x</span>
                </div>
                <div className="flex justify-between">
                  <span>3x 7️⃣ (Jackpot!)</span>
                  <span className="text-gold-400">100x</span>
                </div>
                <div className="flex justify-between">
                  <span>3x 💰 (Money)</span>
                  <span className="text-gold-400">50x</span>
                </div>
                <div className="flex justify-between">
                  <span>2 matching symbols</span>
                  <span className="text-gold-400">2x</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/50">
                All outcomes are provably fair. Verify your results using the server seed revealed after each spin.
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
