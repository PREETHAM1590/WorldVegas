'use client';

import { useState, useRef } from 'react';
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

// Roulette numbers in wheel order
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

type BetType = 'red' | 'black' | 'green' | 'odd' | 'even' | 'high' | 'low' | number;

const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
};

export function RouletteGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [betAmount, setBetAmount] = useState(1.00);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [selectedBet, setSelectedBet] = useState<BetType>('red');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [history, setHistory] = useState<number[]>([7, 22, 0, 15, 32, 8, 19]);

  const getMultiplier = (bet: BetType): number => {
    if (typeof bet === 'number') return 35; // Single number
    if (bet === 'green') return 35;
    return 2; // Red/Black/Odd/Even/High/Low
  };

  const checkWin = (bet: BetType, num: number): boolean => {
    if (typeof bet === 'number') return bet === num;
    if (bet === 'green') return num === 0;
    if (bet === 'red') return RED_NUMBERS.includes(num);
    if (bet === 'black') return num !== 0 && !RED_NUMBERS.includes(num);
    if (bet === 'odd') return num !== 0 && num % 2 === 1;
    if (bet === 'even') return num !== 0 && num % 2 === 0;
    if (bet === 'high') return num >= 19 && num <= 36;
    if (bet === 'low') return num >= 1 && num <= 18;
    return false;
  };

  const spin = async () => {
    if (isSpinning) return;

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
        game: 'roulette',
        betAmount,
        currency,
        timestamp: Date.now(),
        clientSeed: '',
      });
    }

    setIsSpinning(true);
    setResult(null);
    setShowWin(false);
    playSound('rouletteSpin');

    // Generate random result
    const resultNum = Math.floor(Math.random() * 37); // 0-36
    const resultIndex = WHEEL_NUMBERS.indexOf(resultNum);
    const degreePerNumber = 360 / 37;
    const targetRotation = 360 * 5 + (resultIndex * degreePerNumber) + (degreePerNumber / 2);

    setWheelRotation(prev => prev + targetRotation);

    // Wait for animation
    setTimeout(() => {
      setResult(resultNum);
      setIsSpinning(false);
      setHistory(prev => [resultNum, ...prev.slice(0, 9)]);
      playSound('rouletteStop');

      const won = checkWin(selectedBet, resultNum);
      const multiplier = getMultiplier(selectedBet);

      if (isPracticeMode) {
        // Practice mode - just record stats
        recordPracticeResult(won);
        if (won) {
          setShowWin(true);
          if (multiplier >= 35) {
            playSound('jackpot');
          } else {
            playSound('win');
          }
          showToast(`${resultNum} ${getNumberColor(resultNum).toUpperCase()}! You won! (Practice)`, 'success');
          setTimeout(() => setShowWin(false), 2000);
        } else {
          playSound('lose');
          showToast(`${resultNum} ${getNumberColor(resultNum).toUpperCase()}. Better luck next time! (Practice)`, 'error');
        }
      } else {
        // Real mode - update balance
        setPendingGame(null);

        if (won) {
          const winAmount = betAmount * multiplier;
          addBalance(currency, winAmount);
          setShowWin(true);

          if (multiplier >= 35) {
            playSound('jackpot');
          } else {
            playSound('win');
          }

          showToast(`${resultNum} ${getNumberColor(resultNum).toUpperCase()}! Won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
          setTimeout(() => setShowWin(false), 2000);

          addResult({
            id: crypto.randomUUID(),
            game: 'roulette',
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
          showToast(`${resultNum} ${getNumberColor(resultNum).toUpperCase()}. Better luck next time!`, 'error');

          addResult({
            id: crypto.randomUUID(),
            game: 'roulette',
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
    }, 4000);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Game Container */}
      <div className="flex-1 relative bg-gradient-to-b from-green-900 via-green-800 to-green-950 rounded-3xl overflow-hidden">
        {/* Felt texture */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-black flex items-center justify-center">
                <span className="text-2xl">🎰</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">ROULETTE</h1>
                <p className="text-xs text-white/50">European Style</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSound} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white/50" />}
              </button>
              <button onClick={() => setShowRules(!showRules)} className={cn("p-2 rounded-lg", showRules ? "bg-green-500/30" : "bg-white/10 hover:bg-white/20")}>
                <Info className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* History */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {history.map((num, i) => (
              <div
                key={i}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                  getNumberColor(num) === 'red' ? "bg-red-600" :
                  getNumberColor(num) === 'green' ? "bg-green-600" : "bg-gray-900"
                )}
              >
                {num}
              </div>
            ))}
          </div>

          {/* Roulette Wheel */}
          <div className="relative flex justify-center mb-6">
            <div className="relative w-56 h-56">
              {/* Wheel shadow */}
              <div className="absolute inset-0 rounded-full bg-black/50 blur-xl transform translate-y-4" />

              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-700 via-amber-900 to-amber-950 p-2">
                {/* Wheel */}
                <motion.div
                  className="relative w-full h-full rounded-full bg-gradient-to-b from-amber-800 to-amber-950 overflow-hidden"
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {/* Numbers around wheel */}
                  {WHEEL_NUMBERS.map((num, i) => {
                    const angle = (i * 360 / 37) - 90;
                    const color = getNumberColor(num);
                    return (
                      <div
                        key={num}
                        className="absolute w-full h-full"
                        style={{ transform: `rotate(${angle}deg)` }}
                      >
                        <div
                          className={cn(
                            "absolute top-0 left-1/2 -translate-x-1/2 w-6 h-12 flex items-start justify-center pt-1",
                            color === 'red' ? "bg-red-600" :
                            color === 'green' ? "bg-green-600" : "bg-gray-900"
                          )}
                          style={{
                            clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)'
                          }}
                        >
                          <span className="text-[8px] font-bold text-white" style={{ transform: 'rotate(180deg)' }}>
                            {num}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Center hub */}
                  <div className="absolute inset-1/4 rounded-full bg-gradient-to-b from-amber-600 to-amber-900 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-b from-amber-500 to-amber-700 flex items-center justify-center">
                      <div className="w-1/2 h-1/2 rounded-full bg-amber-400" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Ball pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
            </div>
          </div>

          {/* Result Display */}
          {result !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-4"
            >
              <div className={cn(
                "inline-block w-20 h-20 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-xl",
                getNumberColor(result) === 'red' ? "bg-red-600" :
                getNumberColor(result) === 'green' ? "bg-green-600" : "bg-gray-900"
              )}>
                {result}
              </div>
              <p className={cn(
                "mt-2 font-bold",
                showWin ? "text-green-400" : "text-red-400"
              )}>
                {showWin ? 'YOU WIN!' : 'YOU LOSE'}
              </p>
            </motion.div>
          )}

          {/* Betting Options */}
          <div className="mb-4 space-y-3">
            {/* Color bets */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setSelectedBet('red')}
                disabled={isSpinning}
                className={cn(
                  "flex-1 max-w-[100px] py-3 rounded-xl font-bold transition-all",
                  selectedBet === 'red' ? "bg-red-600 text-white ring-2 ring-white" : "bg-red-600/50 text-white/70"
                )}
              >
                RED
              </button>
              <button
                onClick={() => setSelectedBet('green')}
                disabled={isSpinning}
                className={cn(
                  "px-4 py-3 rounded-xl font-bold transition-all",
                  selectedBet === 'green' ? "bg-green-600 text-white ring-2 ring-white" : "bg-green-600/50 text-white/70"
                )}
              >
                0
              </button>
              <button
                onClick={() => setSelectedBet('black')}
                disabled={isSpinning}
                className={cn(
                  "flex-1 max-w-[100px] py-3 rounded-xl font-bold transition-all",
                  selectedBet === 'black' ? "bg-gray-900 text-white ring-2 ring-white" : "bg-gray-900/50 text-white/70"
                )}
              >
                BLACK
              </button>
            </div>

            {/* Other bets */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'odd' as const, label: 'ODD', mult: '2x' },
                { type: 'even' as const, label: 'EVEN', mult: '2x' },
                { type: 'low' as const, label: '1-18', mult: '2x' },
                { type: 'high' as const, label: '19-36', mult: '2x' },
              ].map(({ type, label, mult }) => (
                <button
                  key={type}
                  onClick={() => setSelectedBet(type)}
                  disabled={isSpinning}
                  className={cn(
                    "py-2 rounded-lg font-bold text-sm transition-all",
                    selectedBet === type ? "bg-white text-black" : "bg-white/20 text-white"
                  )}
                >
                  {label}
                  <span className="block text-xs opacity-60">{mult}</span>
                </button>
              ))}
            </div>

            {/* Multiplier display */}
            <div className="text-center bg-black/20 rounded-xl py-2">
              <p className="text-green-200/60 text-xs">
                Bet on {typeof selectedBet === 'number' ? `#${selectedBet}` : selectedBet.toUpperCase()} ({getMultiplier(selectedBet)}x)
              </p>
              <p className="text-xl font-bold text-green-400">
                Potential Win: {(betAmount * getMultiplier(selectedBet)).toFixed(2)} {currency.toUpperCase()}
              </p>
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
                  disabled={isSpinning}
                  className={cn(
                    'px-6 py-2 rounded-full font-bold transition-all',
                    currency === c ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Balance */}
            <div className="text-center">
              <p className="text-green-200/60 text-sm">Balance</p>
              <p className="text-2xl font-bold text-green-400">{balance[currency].toFixed(2)} {currency.toUpperCase()}</p>
            </div>

            {/* Bet amount */}
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isSpinning}
                  className={cn(
                    'px-4 py-2 rounded-lg font-bold transition-all',
                    betAmount === amount ? 'bg-green-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Spin button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={spin}
              disabled={isSpinning || (!isPracticeMode && balance[currency] < betAmount)}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xl transition-all border-4",
                "bg-gradient-to-b from-red-500 to-red-700 border-red-400 text-white",
                "hover:from-red-400 hover:to-red-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSpinning ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                  >
                    🎰
                  </motion.span>
                  SPINNING...
                </span>
              ) : (
                <span>SPIN ({betAmount} {currency.toUpperCase()})</span>
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
            <div className="bg-gray-800 rounded-2xl p-4 border-2 border-green-500/50">
              <h3 className="text-lg font-bold text-green-400 mb-3 text-center">HOW TO PLAY</h3>
              <div className="space-y-2">
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-green-400 font-bold">1.</span> Choose your bet type and amount
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-green-400 font-bold">2.</span> Click SPIN to start the wheel
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-green-400 font-bold">3.</span> Win if ball lands on your bet!
                </div>
              </div>

              <h4 className="text-sm font-bold text-green-400 mt-4 mb-2">PAYOUTS</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-black/30 rounded p-2 text-white">
                  <span className="text-red-400">Red</span> / <span className="text-gray-400">Black</span>: 2x
                </div>
                <div className="bg-black/30 rounded p-2 text-white">
                  <span className="text-green-400">Green (0)</span>: 35x
                </div>
                <div className="bg-black/30 rounded p-2 text-white">
                  Odd / Even: 2x
                </div>
                <div className="bg-black/30 rounded p-2 text-white">
                  High / Low: 2x
                </div>
              </div>

              <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-center text-green-400">🔒 Provably Fair - European single-zero wheel</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
