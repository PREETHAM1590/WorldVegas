'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Info, TrendingUp } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { useToast } from '@/components/ui/Toast';
import { useSound, useSoundSettings } from '@/hooks/useSound';
import { PracticeModeBanner } from '@/components/ui/PracticeMode';
import { cn } from '@/lib/utils';

const BET_AMOUNTS = [0.10, 0.50, 1.00, 5.00, 10.00, 25.00];

export function AviatorGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [betAmount, setBetAmount] = useState(1.00);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed' | 'cashed_out'>('waiting');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOutAt, setCashedOutAt] = useState(0);
  const [showRules, setShowRules] = useState(false);
  const [history, setHistory] = useState<number[]>([2.34, 1.12, 5.67, 1.45, 3.21, 1.08, 12.5, 2.1]);
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 });

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Generate crash point using provably fair method
  const generateCrashPoint = useCallback(() => {
    // House edge of 3%
    const houseEdge = 0.97;
    const random = Math.random();
    const crash = Math.max(1, Math.floor((houseEdge / random) * 100) / 100);
    return Math.min(crash, 100); // Cap at 100x
  }, []);

  const startGame = async () => {
    // In practice mode, skip balance checks
    if (!isPracticeMode) {
      if (balance[currency] < betAmount) {
        showToast('Insufficient balance', 'error');
        return;
      }

      if (!subtractBalance(currency, betAmount)) {
        showToast('Insufficient balance', 'error');
        return;
      }

      setPendingGame({
        id: crypto.randomUUID(),
        game: 'aviator',
        betAmount,
        currency,
        timestamp: Date.now(),
        clientSeed: '',
      });
    }

    const crash = generateCrashPoint();
    setCrashPoint(crash);
    setMultiplier(1.00);
    setGameState('flying');
    setCashedOutAt(0);
    setPlanePosition({ x: 0, y: 0 });
    startTimeRef.current = Date.now();

    playSound('aviatorTakeoff');

    // Animate multiplier
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newMultiplier = 1 + (elapsed / 1000) * 0.5; // Increase by 0.5x per second

      if (newMultiplier >= crash) {
        // Crashed!
        setMultiplier(crash);
        setGameState('crashed');
        setHistory(prev => [crash, ...prev.slice(0, 9)]);
        playSound('aviatorCrash');

        if (isPracticeMode) {
          recordPracticeResult(false);
          showToast(`Crashed at ${crash.toFixed(2)}x! (Practice)`, 'error');
        } else {
          setPendingGame(null);
          showToast(`Crashed at ${crash.toFixed(2)}x!`, 'error');

          addResult({
            id: crypto.randomUUID(),
            game: 'aviator',
            betAmount,
            currency,
            outcome: 'lose',
            payout: 0,
            timestamp: Date.now(),
            serverSeed: '',
            clientSeed: '',
            nonce: 0,
          });
        }
      } else {
        setMultiplier(Math.floor(newMultiplier * 100) / 100);
        // Update plane position
        const progress = (newMultiplier - 1) / (crash - 1);
        setPlanePosition({
          x: Math.min(progress * 80, 80),
          y: Math.min(progress * 60, 60)
        });
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const cashOut = () => {
    if (gameState !== 'flying') return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const winAmount = betAmount * multiplier;
    setCashedOutAt(multiplier);
    setGameState('cashed_out');
    setHistory(prev => [crashPoint, ...prev.slice(0, 9)]);
    playSound('aviatorCashout');

    if (multiplier >= 5) {
      playSound('jackpot');
    } else if (multiplier >= 2) {
      playSound('bigWin');
    } else {
      playSound('win');
    }

    if (isPracticeMode) {
      recordPracticeResult(true);
      showToast(`Cashed out at ${multiplier.toFixed(2)}x! (Practice)`, 'success');
    } else {
      addBalance(currency, winAmount);
      setPendingGame(null);
      showToast(`Cashed out at ${multiplier.toFixed(2)}x! Won ${winAmount.toFixed(2)} ${currency.toUpperCase()}`, 'success');

      addResult({
        id: crypto.randomUUID(),
        game: 'aviator',
        betAmount,
        currency,
        outcome: 'win',
        payout: winAmount,
        timestamp: Date.now(),
        serverSeed: '',
        clientSeed: '',
        nonce: 0,
      });
    }
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getMultiplierColor = (mult: number) => {
    if (mult >= 10) return 'text-purple-400';
    if (mult >= 5) return 'text-pink-400';
    if (mult >= 2) return 'text-green-400';
    return 'text-blue-400';
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Game Container */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden">
        {/* Sky Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/50 via-purple-900/30 to-gray-900" />
          {/* Stars */}
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <span className="text-2xl">✈️</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">AVIATOR</h1>
                <p className="text-xs text-white/50">Cash out before crash!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSound} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white/50" />}
              </button>
              <button onClick={() => setShowRules(!showRules)} className={cn("p-2 rounded-lg", showRules ? "bg-red-500/30" : "bg-white/10 hover:bg-white/20")}>
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* History */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {history.map((mult, i) => (
              <div
                key={i}
                className={cn(
                  "flex-shrink-0 px-3 py-1 rounded-full text-sm font-bold",
                  mult >= 2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}
              >
                {mult.toFixed(2)}x
              </div>
            ))}
          </div>

          {/* Game Display */}
          <div className="relative h-[250px] bg-black/30 rounded-2xl mb-4 overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${20 + i * 20}%` }} />
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="absolute h-full w-px bg-white" style={{ left: `${20 + i * 20}%` }} />
              ))}
            </div>

            {/* Flight path */}
            {gameState !== 'waiting' && (
              <motion.div
                className="absolute bottom-10 left-10 w-2 h-2 bg-red-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{
                  x: `${planePosition.x * 2}%`,
                  y: `-${planePosition.y * 2}%`,
                  scale: 1
                }}
              >
                {/* Trail */}
                <motion.div
                  className="absolute right-full top-1/2 -translate-y-1/2 h-1 bg-gradient-to-l from-red-500 to-transparent"
                  style={{ width: `${planePosition.x * 3}px` }}
                />
              </motion.div>
            )}

            {/* Plane */}
            {gameState === 'flying' && (
              <motion.div
                className="absolute text-4xl"
                style={{
                  left: `${10 + planePosition.x}%`,
                  bottom: `${10 + planePosition.y}%`,
                }}
                animate={{ rotate: -30 }}
              >
                ✈️
              </motion.div>
            )}

            {/* Crash explosion */}
            {gameState === 'crashed' && (
              <motion.div
                className="absolute text-6xl"
                style={{
                  left: `${10 + planePosition.x}%`,
                  bottom: `${10 + planePosition.y}%`,
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2, 1.5], opacity: [1, 1, 0] }}
                transition={{ duration: 0.5 }}
              >
                💥
              </motion.div>
            )}

            {/* Center Multiplier Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              {gameState === 'waiting' && (
                <div className="text-center">
                  <p className="text-white/60 text-lg">Place your bet</p>
                  <p className="text-4xl font-black text-white">READY</p>
                </div>
              )}

              {gameState === 'flying' && (
                <motion.div
                  className="text-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <p className={cn("text-6xl font-black", getMultiplierColor(multiplier))}>
                    {multiplier.toFixed(2)}x
                  </p>
                </motion.div>
              )}

              {gameState === 'crashed' && (
                <div className="text-center">
                  <p className="text-red-500 text-2xl font-bold mb-2">CRASHED!</p>
                  <p className="text-5xl font-black text-red-400">{crashPoint.toFixed(2)}x</p>
                </div>
              )}

              {gameState === 'cashed_out' && (
                <div className="text-center">
                  <p className="text-green-400 text-2xl font-bold mb-2">CASHED OUT!</p>
                  <p className="text-5xl font-black text-green-400">{cashedOutAt.toFixed(2)}x</p>
                  <p className="text-white mt-2">Won {(betAmount * cashedOutAt).toFixed(2)} {currency.toUpperCase()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Currency toggle */}
            <div className="flex justify-center gap-2">
              {(['wld', 'usdc'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  disabled={gameState === 'flying'}
                  className={cn(
                    'px-6 py-2 rounded-full font-bold transition-all',
                    currency === c ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Balance */}
            <div className="text-center">
              <p className="text-white/60 text-sm">Balance</p>
              <p className="text-2xl font-bold text-red-400">{balance[currency].toFixed(2)} {currency.toUpperCase()}</p>
            </div>

            {/* Bet amount */}
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={gameState === 'flying'}
                  className={cn(
                    'px-4 py-2 rounded-lg font-bold transition-all',
                    betAmount === amount ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Action button */}
            {gameState === 'waiting' || gameState === 'crashed' || gameState === 'cashed_out' ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                disabled={!isPracticeMode && balance[currency] < betAmount}
                className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-b from-green-500 to-green-700 text-white border-4 border-green-400 disabled:opacity-50"
              >
                BET {betAmount} {currency.toUpperCase()}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={cashOut}
                className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-b from-red-500 to-red-700 text-white border-4 border-red-400"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                CASH OUT {(betAmount * multiplier).toFixed(2)} {currency.toUpperCase()}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Rules */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="bg-gray-800 rounded-2xl p-4 border-2 border-red-500/50">
              <h3 className="text-lg font-bold text-red-400 mb-3 text-center">HOW TO PLAY</h3>
              <div className="space-y-2">
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-red-400 font-bold">1.</span> Place your bet before the plane takes off
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-red-400 font-bold">2.</span> Watch the multiplier increase as the plane flies
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-red-400 font-bold">3.</span> Cash out anytime to win (bet × multiplier)
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-red-400 font-bold">4.</span> If you don't cash out before crash, you lose!
                </div>
              </div>
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-center text-green-400">🔒 Provably Fair - Crash point is predetermined</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
