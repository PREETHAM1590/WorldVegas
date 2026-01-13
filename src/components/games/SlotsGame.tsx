'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Info, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { useToast } from '@/components/ui/Toast';
import { useSound, useSoundSettings } from '@/hooks/useSound';
import { PracticeModeBanner } from '@/components/ui/PracticeMode';
import { generateClientSeed } from '@/lib/provablyFair';
import { cn } from '@/lib/utils';

// Premium slot symbols - casino style
const SYMBOLS = [
  { id: 0, emoji: '🍒', name: 'Cherry', multiplier: 2 },
  { id: 1, emoji: '🍋', name: 'Lemon', multiplier: 3 },
  { id: 2, emoji: '🍊', name: 'Orange', multiplier: 4 },
  { id: 3, emoji: '🍇', name: 'Grape', multiplier: 5 },
  { id: 4, emoji: '🍉', name: 'Watermelon', multiplier: 6 },
  { id: 5, emoji: '⭐', name: 'Star', multiplier: 8 },
  { id: 6, emoji: '💎', name: 'Diamond', multiplier: 15 },
  { id: 7, emoji: '7️⃣', name: 'Seven', multiplier: 25 },
  { id: 8, emoji: '🎰', name: 'Jackpot', multiplier: 50 },
  { id: 9, emoji: '👑', name: 'Crown', multiplier: 100 },
];

const BET_AMOUNTS = [0.10, 0.25, 0.50, 1.00, 2.50, 5.00, 10.00, 25.00];

// Realistic slot reel component
function SlotReel({
  spinning,
  finalValue,
  delay,
  isWinning,
  onStop
}: {
  spinning: boolean;
  finalValue: number;
  delay: number;
  isWinning: boolean;
  onStop?: () => void;
}) {
  const [symbols, setSymbols] = useState<number[]>([0, 1, 2]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [stopped, setStopped] = useState(true);

  useEffect(() => {
    if (spinning) {
      setIsAnimating(true);
      setStopped(false);

      // Fast spinning animation
      const spinInterval = setInterval(() => {
        setSymbols([
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length),
          Math.floor(Math.random() * SYMBOLS.length)
        ]);
      }, 80);

      // Stop after delay
      const stopTimer = setTimeout(() => {
        clearInterval(spinInterval);
        // Set final position with the winning symbol in the middle
        const prev = (finalValue - 1 + SYMBOLS.length) % SYMBOLS.length;
        const next = (finalValue + 1) % SYMBOLS.length;
        setSymbols([prev, finalValue, next]);
        setIsAnimating(false);
        setStopped(true);
        onStop?.();
      }, 1500 + delay);

      return () => {
        clearInterval(spinInterval);
        clearTimeout(stopTimer);
      };
    }
  }, [spinning, finalValue, delay, onStop]);

  return (
    <div className="relative">
      {/* Reel frame */}
      <div className={cn(
        "relative w-[90px] sm:w-[100px] h-[200px] sm:h-[220px] rounded-lg overflow-hidden",
        "bg-gradient-to-b from-gray-900 via-black to-gray-900",
        "border-2 transition-all duration-300",
        isWinning && stopped ? "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]" : "border-gray-700"
      )}>
        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none z-10" />

        {/* Top shadow */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />

        {/* Bottom shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />

        {/* Symbols container */}
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center",
          isAnimating && "blur-[2px]"
        )}>
          {symbols.map((symbolId, idx) => (
            <motion.div
              key={`${idx}-${symbolId}`}
              className={cn(
                "flex items-center justify-center w-full h-1/3 text-5xl sm:text-6xl",
                idx === 1 && !isAnimating && "scale-110"
              )}
              initial={isAnimating ? { y: -20 } : { scale: 1 }}
              animate={isAnimating ? { y: 20 } : { scale: idx === 1 ? 1.1 : 1 }}
              transition={{ duration: 0.08 }}
            >
              <span className={cn(
                "drop-shadow-lg transition-all duration-300",
                idx === 1 && isWinning && stopped && "animate-pulse"
              )}>
                {SYMBOLS[symbolId].emoji}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Win line - center horizontal */}
        <div className={cn(
          "absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] z-20 transition-all duration-300",
          isWinning && stopped
            ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            : "bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
        )} />
      </div>

      {/* Win glow effect */}
      {isWinning && stopped && (
        <motion.div
          className="absolute -inset-2 rounded-xl bg-yellow-400/20 -z-10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Win celebration overlay
function WinCelebration({ amount, multiplier, currency }: { amount: number; multiplier: number; currency: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Coin particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl sm:text-3xl"
          initial={{
            x: '50%',
            y: '50%',
            scale: 0
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1.5, 0],
            rotate: Math.random() * 720
          }}
          transition={{
            duration: 2,
            delay: i * 0.05,
            ease: "easeOut"
          }}
        >
          {['🪙', '💰', '✨', '⭐', '💎'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}

      {/* Win display */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <motion.div
          className="text-6xl sm:text-8xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          🎉
        </motion.div>
        <div className="bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <motion.p
            className="text-3xl sm:text-5xl font-black text-white mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            {multiplier >= 25 ? 'JACKPOT!' : multiplier >= 10 ? 'BIG WIN!' : 'YOU WIN!'}
          </motion.p>
          <p className="text-4xl sm:text-6xl font-black text-white drop-shadow-lg">
            +{amount.toFixed(2)} {currency.toUpperCase()}
          </p>
          <p className="text-xl sm:text-2xl text-white/80 mt-2">
            {multiplier}x Multiplier
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SlotsGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { setIsPlaying, addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [betAmount, setBetAmount] = useState(BET_AMOUNTS[2]); // 0.50 default
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<[number, number, number]>([0, 1, 2]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientSeed, setClientSeed] = useState(generateClientSeed());
  const [lastResult, setLastResult] = useState<{ isWin: boolean; multiplier: number; amount: number } | null>(null);
  const [showWinCelebration, setShowWinCelebration] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [stoppedReels, setStoppedReels] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [autoplayCount, setAutoplayCount] = useState(0);

  // Initialize game session
  const initSession = useCallback(async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user',
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

  // Handle autoplay
  useEffect(() => {
    if (autoplay && autoplayCount > 0 && !isSpinning) {
      const timer = setTimeout(() => {
        spin();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (autoplayCount === 0) {
      setAutoplay(false);
    }
  }, [autoplay, autoplayCount, isSpinning]);

  const adjustBet = (direction: 'up' | 'down') => {
    const currentIndex = BET_AMOUNTS.indexOf(betAmount);
    if (direction === 'up' && currentIndex < BET_AMOUNTS.length - 1) {
      setBetAmount(BET_AMOUNTS[currentIndex + 1]);
      playSound('chip');
    } else if (direction === 'down' && currentIndex > 0) {
      setBetAmount(BET_AMOUNTS[currentIndex - 1]);
      playSound('chip');
    }
  };

  const spin = async () => {
    if (isSpinning) return;

    // In practice mode, skip balance checks
    if (!isPracticeMode) {
      if (balance[currency] < betAmount) {
        showToast('Insufficient balance', 'error');
        setAutoplay(false);
        return;
      }

      // Save pending game for crash protection
      const pendingId = crypto.randomUUID();
      setPendingGame({
        id: pendingId,
        game: 'slots',
        betAmount,
        currency,
        timestamp: Date.now(),
        clientSeed,
      });

      // Deduct bet
      if (!subtractBalance(currency, betAmount)) {
        showToast('Insufficient balance', 'error');
        setPendingGame(null);
        setAutoplay(false);
        return;
      }
    }

    setIsSpinning(true);
    setIsPlaying(true);
    setLastResult(null);
    setShowWinCelebration(false);
    setStoppedReels(0);

    if (autoplay) {
      setAutoplayCount(prev => prev - 1);
    }

    // Play spin sound
    playSound('spin');

    // Practice mode - simulate locally
    if (isPracticeMode) {
      const newReels: [number, number, number] = [
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length),
        Math.floor(Math.random() * SYMBOLS.length)
      ];

      const allThreeSame = newReels[0] === newReels[1] && newReels[1] === newReels[2];
      const twoMatch = newReels[0] === newReels[1] || newReels[1] === newReels[2] || newReels[0] === newReels[2];
      const isWin = allThreeSame || twoMatch;
      const multiplier = allThreeSame ? SYMBOLS[newReels[0]].multiplier : (twoMatch ? 2 : 0);

      setReels(newReels);

      setTimeout(() => {
        setIsSpinning(false);
        setIsPlaying(false);

        const winAmount = isWin ? betAmount * multiplier : 0;
        setLastResult({ isWin, multiplier, amount: winAmount });

        recordPracticeResult(isWin);

        if (isWin) {
          if (multiplier >= 25) {
            playSound('jackpot');
            setShowWinCelebration(true);
            setTimeout(() => setShowWinCelebration(false), 3000);
          } else if (multiplier >= 10) {
            playSound('bigWin');
            setShowWinCelebration(true);
            setTimeout(() => setShowWinCelebration(false), 2500);
          } else {
            playSound('win');
          }
          showToast(`Won! ${multiplier}x (Practice)`, 'success');
        } else {
          playSound('lose');
        }

        setClientSeed(generateClientSeed());
      }, 2200);
      return;
    }

    try {
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

        // Wait for reels to stop
        setTimeout(() => {
          setIsSpinning(false);
          setIsPlaying(false);

          const winAmount = isWin ? betAmount * multiplier : 0;
          setLastResult({ isWin, multiplier, amount: winAmount });

          if (isWin) {
            addBalance(currency, winAmount);

            // Play appropriate win sound
            if (multiplier >= 25) {
              playSound('jackpot');
              setShowWinCelebration(true);
              setTimeout(() => setShowWinCelebration(false), 3000);
            } else if (multiplier >= 10) {
              playSound('bigWin');
              setShowWinCelebration(true);
              setTimeout(() => setShowWinCelebration(false), 2500);
            } else {
              playSound('win');
            }

            showToast(`Won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');

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
            playSound('lose');
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

          // Clear pending game
          setPendingGame(null);
          setClientSeed(generateClientSeed());
        }, 2200);
      } else {
        // API returned error - refund bet
        throw new Error(result.error || 'Game failed');
      }
    } catch (error) {
      console.error('Spin error:', error);
      setIsSpinning(false);
      setIsPlaying(false);
      // ALWAYS refund the bet on any error
      addBalance(currency, betAmount);
      setPendingGame(null);
      setAutoplay(false);
      showToast('Connection error. Bet refunded.', 'error');
    }
  };

  const handleReelStop = useCallback(() => {
    setStoppedReels(prev => {
      const newCount = prev + 1;
      if (newCount <= 3) {
        playSound('reelStop');
      }
      return newCount;
    });
  }, [playSound]);

  const isWinResult = lastResult?.isWin && !isSpinning;
  const allReelsSame = reels[0] === reels[1] && reels[1] === reels[2];
  const twoReelsSame = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];
  const hasWinningCombination = isWinResult && (allReelsSame || twoReelsSame);

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)]">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Win Celebration Overlay */}
      <AnimatePresence>
        {showWinCelebration && lastResult && (
          <WinCelebration
            amount={lastResult.amount}
            multiplier={lastResult.multiplier}
            currency={currency}
          />
        )}
      </AnimatePresence>

      {/* Main Slot Machine */}
      <div className="flex-1 flex flex-col">
        {/* Machine Header */}
        <div className="text-center py-4">
          <div className="inline-block px-8 py-2 bg-gradient-to-r from-red-800 via-red-600 to-red-800 rounded-t-xl border-t-4 border-x-4 border-yellow-500">
            <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-wider drop-shadow-lg">
              LUCKY VEGAS
            </h1>
          </div>
        </div>

        {/* Slot Machine Body */}
        <div className="relative mx-auto max-w-md w-full">
          {/* Machine Frame */}
          <div className="relative bg-gradient-to-b from-red-900 via-red-800 to-red-900 rounded-3xl p-4 sm:p-6 shadow-2xl border-4 border-yellow-600">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg" />
            <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg" />
            <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg" />
            <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-yellow-500 rounded-br-lg" />

            {/* Top Display - Balance & Win */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="text-center">
                <p className="text-[10px] text-yellow-500/80 uppercase tracking-wider">Balance</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-400 font-mono">
                  {balance[currency].toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleSound}
                  className="p-2 rounded-lg bg-black/30 hover:bg-black/50 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-yellow-400/50" />
                  )}
                </button>
                <button
                  onClick={() => setShowPaytable(!showPaytable)}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    showPaytable ? "bg-yellow-500/30" : "bg-black/30 hover:bg-black/50"
                  )}
                >
                  <Info className="w-5 h-5 text-yellow-400" />
                </button>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-yellow-500/80 uppercase tracking-wider">Win</p>
                <p className={cn(
                  "text-lg sm:text-xl font-bold font-mono transition-colors",
                  lastResult?.isWin ? "text-green-400" : "text-yellow-400"
                )}>
                  {lastResult?.isWin ? `+${lastResult.amount.toFixed(2)}` : '0.00'}
                </p>
              </div>
            </div>

            {/* Reels Container */}
            <div className="bg-black/50 rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex justify-center gap-2 sm:gap-3">
                {reels.map((value, index) => (
                  <SlotReel
                    key={index}
                    spinning={isSpinning}
                    finalValue={value}
                    delay={index * 250}
                    isWinning={!!hasWinningCombination}
                    onStop={handleReelStop}
                  />
                ))}
              </div>
            </div>

            {/* Currency Toggle */}
            <div className="flex justify-center gap-2 mb-4">
              {(['wld', 'usdc'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  disabled={isSpinning}
                  className={cn(
                    "px-6 py-2 rounded-full font-bold text-sm transition-all",
                    currency === c
                      ? "bg-yellow-500 text-black shadow-lg"
                      : "bg-black/30 text-yellow-500 hover:bg-black/50"
                  )}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Bet Controls */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button
                onClick={() => adjustBet('down')}
                disabled={isSpinning || betAmount === BET_AMOUNTS[0]}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform border-2 border-gray-500"
              >
                <Minus className="w-6 h-6 text-white" />
              </button>

              <div className="bg-black/60 rounded-xl px-6 py-3 min-w-[140px] text-center border-2 border-yellow-600">
                <p className="text-[10px] text-yellow-500/80 uppercase tracking-wider">Bet</p>
                <p className="text-2xl font-bold text-yellow-400 font-mono">
                  {betAmount.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => adjustBet('up')}
                disabled={isSpinning || betAmount === BET_AMOUNTS[BET_AMOUNTS.length - 1]}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-gray-600 to-gray-800 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform border-2 border-gray-500"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Spin Button */}
            <motion.button
              onClick={spin}
              disabled={isSpinning || (!isPracticeMode && balance[currency] < betAmount)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-2xl transition-all relative overflow-hidden",
                "bg-gradient-to-b from-green-500 via-green-600 to-green-700",
                "border-4 border-green-400 shadow-lg",
                "disabled:from-gray-600 disabled:via-gray-700 disabled:to-gray-800 disabled:border-gray-500",
                "hover:from-green-400 hover:via-green-500 hover:to-green-600"
              )}
            >
              {/* Shine effect */}
              {!isSpinning && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              )}

              <span className="relative flex items-center justify-center gap-3 text-white drop-shadow-lg">
                {isSpinning ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                      className="text-3xl"
                    >
                      🎰
                    </motion.span>
                    SPINNING...
                  </>
                ) : (
                  <>
                    <span className="text-3xl">🎰</span>
                    SPIN
                  </>
                )}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Paytable & Rules */}
        <AnimatePresence>
          {showPaytable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mx-auto max-w-md w-full mt-4 overflow-hidden"
            >
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 border-2 border-yellow-600">
                {/* How to Play */}
                <h3 className="text-center text-lg font-bold text-yellow-400 mb-3">HOW TO PLAY</h3>
                <div className="space-y-2 mb-4">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white text-sm">
                      <span className="text-yellow-400 font-bold">1.</span> Select your bet amount using the +/- buttons
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white text-sm">
                      <span className="text-yellow-400 font-bold">2.</span> Choose your currency (WLD or USDC)
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white text-sm">
                      <span className="text-yellow-400 font-bold">3.</span> Press SPIN to start the reels
                    </p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-white text-sm">
                      <span className="text-yellow-400 font-bold">4.</span> Match symbols on the center payline to win!
                    </p>
                  </div>
                </div>

                {/* Win Conditions */}
                <h4 className="text-center text-sm font-bold text-yellow-400 mb-2">WINNING COMBINATIONS</h4>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-black/30 rounded-lg p-2 text-center">
                    <p className="text-white/60 text-xs">3 Matching</p>
                    <p className="text-green-400 font-bold">Symbol Multiplier</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2 text-center">
                    <p className="text-white/60 text-xs">2 Matching</p>
                    <p className="text-green-400 font-bold">2x Bet</p>
                  </div>
                </div>

                {/* Paytable */}
                <h4 className="text-center text-sm font-bold text-yellow-400 mb-2">PAYTABLE (3 MATCHING)</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SYMBOLS.slice().reverse().map((symbol) => (
                    <div
                      key={symbol.id}
                      className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{symbol.emoji}</span>
                        <span className="text-xs text-white/60">{symbol.name}</span>
                      </span>
                      <span className="text-yellow-400 font-bold">{symbol.multiplier}x</span>
                    </div>
                  ))}
                </div>

                {/* Provably Fair */}
                <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <h4 className="text-green-400 font-bold text-sm mb-1">🔒 Provably Fair</h4>
                  <p className="text-xs text-white/70">
                    All results are cryptographically verified. Each spin uses a combination of server and client seeds to generate random, verifiable outcomes.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
