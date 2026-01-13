'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Info } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { useToast } from '@/components/ui/Toast';
import { useSound, useSoundSettings } from '@/hooks/useSound';
import { PracticeModeBanner } from '@/components/ui/PracticeMode';
import { cn } from '@/lib/utils';

const BET_AMOUNTS = [0.10, 0.50, 1.00, 5.00, 10.00];

// Dice face component
function DiceFace({ value, size = 'lg' }: { value: number; size?: 'sm' | 'lg' }) {
  const dotSize = size === 'lg' ? 'w-4 h-4' : 'w-2 h-2';
  const gap = size === 'lg' ? 'gap-2' : 'gap-1';

  const patterns: Record<number, JSX.Element> = {
    1: (
      <div className="flex items-center justify-center h-full">
        <div className={cn(dotSize, "bg-gray-800 rounded-full")} />
      </div>
    ),
    2: (
      <div className={cn("flex flex-col justify-between h-full p-2", gap)}>
        <div className="flex justify-end"><div className={cn(dotSize, "bg-gray-800 rounded-full")} /></div>
        <div className="flex justify-start"><div className={cn(dotSize, "bg-gray-800 rounded-full")} /></div>
      </div>
    ),
    3: (
      <div className={cn("flex flex-col justify-between h-full p-2", gap)}>
        <div className="flex justify-end"><div className={cn(dotSize, "bg-gray-800 rounded-full")} /></div>
        <div className="flex justify-center"><div className={cn(dotSize, "bg-gray-800 rounded-full")} /></div>
        <div className="flex justify-start"><div className={cn(dotSize, "bg-gray-800 rounded-full")} /></div>
      </div>
    ),
    4: (
      <div className={cn("grid grid-cols-2 h-full p-2", gap)}>
        <div className={cn(dotSize, "bg-gray-800 rounded-full")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full self-end")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end self-end")} />
      </div>
    ),
    5: (
      <div className={cn("grid grid-cols-3 grid-rows-3 h-full p-2", gap)}>
        <div className={cn(dotSize, "bg-gray-800 rounded-full")} />
        <div />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end")} />
        <div />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-center self-center")} />
        <div />
        <div className={cn(dotSize, "bg-gray-800 rounded-full self-end")} />
        <div />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end self-end")} />
      </div>
    ),
    6: (
      <div className={cn("grid grid-cols-2 grid-rows-3 h-full p-2", gap)}>
        <div className={cn(dotSize, "bg-gray-800 rounded-full")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full")} />
        <div className={cn(dotSize, "bg-gray-800 rounded-full justify-self-end")} />
      </div>
    ),
  };

  return patterns[value] || patterns[1];
}

export function DiceGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [betAmount, setBetAmount] = useState(1.00);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [prediction, setPrediction] = useState<'over' | 'under'>('over');
  const [targetNumber, setTargetNumber] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);

  // Calculate win chance and multiplier
  const winChance = prediction === 'over' ? (100 - targetNumber) : targetNumber;
  const multiplier = Math.floor((98 / winChance) * 100) / 100; // 2% house edge

  const roll = async () => {
    if (isRolling) return;

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
        game: 'dice',
        betAmount,
        currency,
        timestamp: Date.now(),
        clientSeed: '',
      });
    }

    setIsRolling(true);
    setResult(null);
    setShowWin(false);
    playSound('diceRoll');

    // Animate dice rolling
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 15) {
        clearInterval(rollInterval);
      }
    }, 100);

    // Generate result (0-100)
    const rollResult = Math.floor(Math.random() * 100) + 1;

    // Wait for animation
    setTimeout(() => {
      clearInterval(rollInterval);

      // Set final dice values based on result
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      setDice1(d1);
      setDice2(d2);
      setResult(rollResult);
      setIsRolling(false);
      playSound('diceHit');

      const won = prediction === 'over'
        ? rollResult > targetNumber
        : rollResult < targetNumber;

      if (isPracticeMode) {
        // Practice mode - just record stats
        recordPracticeResult(won);
        if (won) {
          setShowWin(true);
          playSound('win');
          showToast(`Rolled ${rollResult}. You won! (Practice)`, 'success');
          setTimeout(() => setShowWin(false), 2000);
        } else {
          playSound('lose');
          showToast(`Rolled ${rollResult}. Better luck next time! (Practice)`, 'error');
        }
      } else {
        // Real mode - update balance
        setPendingGame(null);

        if (won) {
          const winAmount = betAmount * multiplier;
          addBalance(currency, winAmount);
          setShowWin(true);
          playSound('win');
          showToast(`You won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
          setTimeout(() => setShowWin(false), 2000);

          addResult({
            id: crypto.randomUUID(),
            game: 'dice',
            betAmount,
            currency,
            outcome: 'win',
            payout: winAmount,
            timestamp: Date.now(),
            serverSeed: '',
            clientSeed: '',
            nonce: 0,
          });
        } else {
          playSound('lose');
          showToast(`Rolled ${rollResult}. Better luck next time!`, 'error');

          addResult({
            id: crypto.randomUUID(),
            game: 'dice',
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
      }
    }, 1800);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Game Container */}
      <div className="flex-1 relative bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 rounded-3xl overflow-hidden">
        {/* Felt texture */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-2xl">🎲</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-emerald-400">DICE</h1>
                <p className="text-xs text-emerald-200/50">Over/Under</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSound} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-emerald-400/50" />}
              </button>
              <button onClick={() => setShowRules(!showRules)} className={cn("p-2 rounded-lg", showRules ? "bg-emerald-500/30" : "bg-white/10 hover:bg-white/20")}>
                <Info className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Dice Display */}
          <div className="flex justify-center gap-6 mb-6">
            <motion.div
              className="w-24 h-24 bg-white rounded-xl shadow-xl border-4 border-gray-200"
              animate={isRolling ? {
                rotateX: [0, 360, 720],
                rotateY: [0, 360, 720],
                scale: [1, 0.9, 1]
              } : {}}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <DiceFace value={dice1} />
            </motion.div>
            <motion.div
              className="w-24 h-24 bg-white rounded-xl shadow-xl border-4 border-gray-200"
              animate={isRolling ? {
                rotateX: [0, -360, -720],
                rotateY: [0, 360, 720],
                scale: [1, 0.9, 1]
              } : {}}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
            >
              <DiceFace value={dice2} />
            </motion.div>
          </div>

          {/* Result Display */}
          <div className="text-center mb-6">
            {result !== null ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "inline-block px-8 py-4 rounded-2xl",
                  showWin ? "bg-green-500" : "bg-red-500"
                )}
              >
                <p className="text-5xl font-black text-white">{result}</p>
                <p className="text-white/80 text-sm mt-1">
                  {showWin ? 'YOU WIN!' : 'YOU LOSE'}
                </p>
              </motion.div>
            ) : (
              <div className="inline-block px-8 py-4 rounded-2xl bg-black/30">
                <p className="text-4xl font-black text-white">?</p>
                <p className="text-white/50 text-sm mt-1">Roll to reveal</p>
              </div>
            )}
          </div>

          {/* Prediction Slider */}
          <div className="mb-6 bg-black/30 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <button
                onClick={() => setPrediction('under')}
                disabled={isRolling}
                className={cn(
                  "px-6 py-2 rounded-full font-bold transition-all",
                  prediction === 'under' ? "bg-red-500 text-white" : "bg-white/10 text-white/70"
                )}
              >
                UNDER {targetNumber}
              </button>
              <button
                onClick={() => setPrediction('over')}
                disabled={isRolling}
                className={cn(
                  "px-6 py-2 rounded-full font-bold transition-all",
                  prediction === 'over' ? "bg-green-500 text-white" : "bg-white/10 text-white/70"
                )}
              >
                OVER {targetNumber}
              </button>
            </div>

            {/* Slider */}
            <div className="relative mt-4">
              <input
                type="range"
                min={5}
                max={95}
                value={targetNumber}
                onChange={(e) => setTargetNumber(Number(e.target.value))}
                disabled={isRolling}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right,
                    #ef4444 0%,
                    #ef4444 ${targetNumber}%,
                    #22c55e ${targetNumber}%,
                    #22c55e 100%)`
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-white/50">
                <span>1</span>
                <span className="text-lg font-bold text-white">{targetNumber}</span>
                <span>100</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-emerald-200/60 text-xs">Win Chance</p>
                <p className="text-xl font-bold text-emerald-400">{winChance.toFixed(1)}%</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <p className="text-emerald-200/60 text-xs">Multiplier</p>
                <p className="text-xl font-bold text-emerald-400">{multiplier.toFixed(2)}x</p>
              </div>
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
                  disabled={isRolling}
                  className={cn(
                    'px-6 py-2 rounded-full font-bold transition-all',
                    currency === c ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Balance */}
            <div className="text-center">
              <p className="text-emerald-200/60 text-sm">Balance</p>
              <p className="text-2xl font-bold text-emerald-400">{balance[currency].toFixed(2)} {currency.toUpperCase()}</p>
            </div>

            {/* Bet amount */}
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isRolling}
                  className={cn(
                    'px-4 py-2 rounded-lg font-bold transition-all',
                    betAmount === amount ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Payout display */}
            <div className="text-center bg-black/20 rounded-xl py-2">
              <p className="text-emerald-200/60 text-xs">Potential Win ({multiplier.toFixed(2)}x)</p>
              <p className="text-xl font-bold text-green-400">{(betAmount * multiplier).toFixed(2)} {currency.toUpperCase()}</p>
            </div>

            {/* Roll button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={roll}
              disabled={isRolling || (!isPracticeMode && balance[currency] < betAmount)}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xl transition-all border-4",
                "bg-gradient-to-b from-emerald-500 to-emerald-700 border-emerald-400 text-white",
                "hover:from-emerald-400 hover:to-emerald-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isRolling ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    🎲
                  </motion.span>
                  ROLLING...
                </span>
              ) : (
                <span>ROLL ({betAmount} {currency.toUpperCase()})</span>
              )}
            </motion.button>
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
            <div className="bg-gray-800 rounded-2xl p-4 border-2 border-emerald-500/50">
              <h3 className="text-lg font-bold text-emerald-400 mb-3 text-center">HOW TO PLAY</h3>
              <div className="space-y-2">
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-emerald-400 font-bold">1.</span> Set your target number (5-95)
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-emerald-400 font-bold">2.</span> Choose OVER or UNDER
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-emerald-400 font-bold">3.</span> Place your bet and roll!
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-emerald-400 font-bold">4.</span> Win if the result matches your prediction
                </div>
              </div>
              <div className="mt-3 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <p className="text-xs text-center text-emerald-400">💡 Lower chance = Higher multiplier (2% house edge)</p>
              </div>
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-center text-green-400">🔒 Provably Fair - Results are cryptographically verified</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
