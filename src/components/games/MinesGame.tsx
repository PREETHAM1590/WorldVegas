'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Info, Bomb, Diamond } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { useToast } from '@/components/ui/Toast';
import { useSound, useSoundSettings } from '@/hooks/useSound';
import { PracticeModeBanner } from '@/components/ui/PracticeMode';
import { cn } from '@/lib/utils';

const BET_AMOUNTS = [0.10, 0.50, 1.00, 5.00, 10.00];
const MINE_COUNTS = [1, 3, 5, 10, 15, 20];
const GRID_SIZE = 25; // 5x5 grid

export function MinesGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [betAmount, setBetAmount] = useState(1.00);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [showRules, setShowRules] = useState(false);

  // Calculate multiplier based on revealed gems
  const calculateMultiplier = useCallback((revealed: number, mines: number): number => {
    if (revealed === 0) return 1;
    const safeTiles = GRID_SIZE - mines;
    let multiplier = 1;
    for (let i = 0; i < revealed; i++) {
      multiplier *= (safeTiles - i) / (GRID_SIZE - mines - i);
      multiplier = 1 / multiplier;
    }
    // Apply house edge (3%)
    return Math.floor(multiplier * 0.97 * 100) / 100;
  }, []);

  // Get next multiplier if player reveals another gem
  const getNextMultiplier = useCallback((): number => {
    return calculateMultiplier(revealedTiles.length + 1, mineCount);
  }, [revealedTiles.length, mineCount, calculateMultiplier]);

  const startGame = () => {
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
        game: 'mines',
        betAmount,
        currency,
        timestamp: Date.now(),
        clientSeed: '',
      });
    }

    // Generate random mine positions
    const mines: number[] = [];
    while (mines.length < mineCount) {
      const pos = Math.floor(Math.random() * GRID_SIZE);
      if (!mines.includes(pos)) {
        mines.push(pos);
      }
    }

    setMinePositions(mines);
    setRevealedTiles([]);
    setGameState('playing');
    setCurrentMultiplier(1);
    playSound('mineSweep');
  };

  const revealTile = (index: number) => {
    if (gameState !== 'playing') return;
    if (revealedTiles.includes(index)) return;

    if (minePositions.includes(index)) {
      // Hit a mine!
      setRevealedTiles([...revealedTiles, index]);
      setGameState('lost');
      playSound('mineExplosion');

      if (isPracticeMode) {
        recordPracticeResult(false);
        showToast('BOOM! You hit a mine! (Practice)', 'error');
      } else {
        setPendingGame(null);
        showToast('BOOM! You hit a mine!', 'error');

        addResult({
          id: crypto.randomUUID(),
          game: 'mines',
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
      // Safe tile - gem!
      const newRevealed = [...revealedTiles, index];
      setRevealedTiles(newRevealed);
      const newMultiplier = calculateMultiplier(newRevealed.length, mineCount);
      setCurrentMultiplier(newMultiplier);
      playSound('mineGem');

      // Check if all gems are revealed
      if (newRevealed.length === GRID_SIZE - mineCount) {
        cashOut();
      }
    }
  };

  const cashOut = () => {
    if (gameState !== 'playing' || revealedTiles.length === 0) return;

    const winAmount = betAmount * currentMultiplier;
    setGameState('won');

    if (currentMultiplier >= 10) {
      playSound('jackpot');
    } else if (currentMultiplier >= 3) {
      playSound('bigWin');
    } else {
      playSound('win');
    }

    if (isPracticeMode) {
      recordPracticeResult(true);
      showToast(`Cashed out! (Practice) - ${currentMultiplier.toFixed(2)}x`, 'success');
    } else {
      addBalance(currency, winAmount);
      setPendingGame(null);
      showToast(`Cashed out ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');

      addResult({
        id: crypto.randomUUID(),
        game: 'mines',
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

  const resetGame = () => {
    setGameState('idle');
    setMinePositions([]);
    setRevealedTiles([]);
    setCurrentMultiplier(1);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Game Container */}
      <div className="flex-1 relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 rounded-3xl overflow-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bomb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">MINES</h1>
                <p className="text-xs text-white/50">Reveal gems, avoid mines!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSound} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white/50" />}
              </button>
              <button onClick={() => setShowRules(!showRules)} className={cn("p-2 rounded-lg", showRules ? "bg-blue-500/30" : "bg-white/10 hover:bg-white/20")}>
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Multiplier Display */}
          {gameState === 'playing' && (
            <div className="text-center mb-4">
              <div className="inline-block bg-black/40 rounded-xl px-6 py-3">
                <p className="text-white/60 text-xs">Current Multiplier</p>
                <p className="text-3xl font-black text-green-400">{currentMultiplier.toFixed(2)}x</p>
                {revealedTiles.length > 0 && (
                  <p className="text-xs text-white/40 mt-1">
                    Next: {getNextMultiplier().toFixed(2)}x
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mine Grid */}
          <div className="grid grid-cols-5 gap-2 mb-4 max-w-[320px] mx-auto">
            {Array.from({ length: GRID_SIZE }).map((_, index) => {
              const isRevealed = revealedTiles.includes(index);
              const isMine = minePositions.includes(index);
              const showContent = isRevealed || gameState === 'lost' || gameState === 'won';

              return (
                <motion.button
                  key={index}
                  whileHover={gameState === 'playing' && !isRevealed ? { scale: 1.05 } : {}}
                  whileTap={gameState === 'playing' && !isRevealed ? { scale: 0.95 } : {}}
                  onClick={() => revealTile(index)}
                  disabled={gameState !== 'playing' || isRevealed}
                  className={cn(
                    "aspect-square rounded-xl font-bold text-lg transition-all",
                    "flex items-center justify-center",
                    !showContent && gameState === 'playing' && "bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 cursor-pointer border-2 border-slate-500",
                    !showContent && gameState === 'idle' && "bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600",
                    showContent && isMine && "bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-500",
                    showContent && !isMine && "bg-gradient-to-br from-green-600 to-green-800 border-2 border-green-500",
                    isRevealed && isMine && gameState === 'lost' && "animate-pulse"
                  )}
                >
                  {showContent ? (
                    isMine ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Bomb className="w-6 h-6 text-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Diamond className="w-6 h-6 text-white" />
                      </motion.div>
                    )
                  ) : (
                    <span className="text-slate-400">?</span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Game Result */}
          {(gameState === 'won' || gameState === 'lost') && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-4"
            >
              <div className={cn(
                "inline-block px-8 py-4 rounded-2xl",
                gameState === 'won' ? "bg-green-500" : "bg-red-500"
              )}>
                <p className="text-2xl font-black text-white">
                  {gameState === 'won' ? `WON ${(betAmount * currentMultiplier).toFixed(2)} ${currency.toUpperCase()}!` : 'BOOM!'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <div className="space-y-4">
            {gameState === 'idle' && (
              <>
                {/* Mine count selection */}
                <div>
                  <p className="text-center text-white/60 text-sm mb-2">Number of Mines</p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {MINE_COUNTS.map((count) => (
                      <button
                        key={count}
                        onClick={() => setMineCount(count)}
                        className={cn(
                          'px-4 py-2 rounded-lg font-bold transition-all',
                          mineCount === count ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                        )}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency toggle */}
                <div className="flex justify-center gap-2">
                  {(['wld', 'usdc'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'px-6 py-2 rounded-full font-bold transition-all',
                        currency === c ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Balance */}
                <div className="text-center">
                  <p className="text-white/60 text-sm">Balance</p>
                  <p className="text-2xl font-bold text-blue-400">{balance[currency].toFixed(2)} {currency.toUpperCase()}</p>
                </div>

                {/* Bet amount */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {BET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className={cn(
                        'px-4 py-2 rounded-lg font-bold transition-all',
                        betAmount === amount ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                {/* Start button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  disabled={!isPracticeMode && balance[currency] < betAmount}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xl transition-all border-4",
                    "bg-gradient-to-b from-green-500 to-green-700 border-green-400 text-white",
                    "hover:from-green-400 hover:to-green-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  START GAME ({betAmount} {currency.toUpperCase()})
                </motion.button>
              </>
            )}

            {gameState === 'playing' && (
              <>
                <div className="text-center text-white/60 text-sm">
                  Gems found: {revealedTiles.length} / {GRID_SIZE - mineCount}
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={cashOut}
                  disabled={revealedTiles.length === 0}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-xl transition-all border-4",
                    revealedTiles.length > 0
                      ? "bg-gradient-to-b from-yellow-500 to-yellow-700 border-yellow-400 text-black"
                      : "bg-gray-600 border-gray-500 text-gray-400"
                  )}
                  animate={revealedTiles.length > 0 ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {revealedTiles.length > 0
                    ? `CASH OUT ${(betAmount * currentMultiplier).toFixed(2)} ${currency.toUpperCase()}`
                    : 'CLICK A TILE TO START'}
                </motion.button>
              </>
            )}

            {(gameState === 'won' || gameState === 'lost') && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetGame}
                className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-b from-blue-500 to-blue-700 border-4 border-blue-400 text-white"
              >
                PLAY AGAIN
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
            <div className="bg-gray-800 rounded-2xl p-4 border-2 border-blue-500/50">
              <h3 className="text-lg font-bold text-blue-400 mb-3 text-center">HOW TO PLAY</h3>
              <div className="space-y-2">
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-blue-400 font-bold">1.</span> Choose number of mines (more mines = higher rewards)
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-blue-400 font-bold">2.</span> Click tiles to reveal gems 💎
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-blue-400 font-bold">3.</span> Each gem increases your multiplier
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-blue-400 font-bold">4.</span> Cash out anytime or keep going for more!
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-red-400 font-bold">⚠️</span> Hit a mine and lose everything!
                </div>
              </div>
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-center text-green-400">🔒 Provably Fair - Mine positions are pre-determined</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
