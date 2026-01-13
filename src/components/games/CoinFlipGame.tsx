'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Info, Sparkles } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { useToast } from '@/components/ui/Toast';
import { useSound, useSoundSettings } from '@/hooks/useSound';
import { PracticeModeBanner } from '@/components/ui/PracticeMode';
import { cn } from '@/lib/utils';

const BET_AMOUNTS = [0.10, 0.50, 1.00, 5.00, 10.00];

// Realistic 3D Gold Coin Component
function RealisticCoin({
  side,
  isFlipping,
  showResult,
  flipCount
}: {
  side: 'heads' | 'tails' | null;
  isFlipping: boolean;
  showResult: boolean;
  flipCount: number;
}) {
  const isHeads = side === 'heads' || (!side && !showResult);

  return (
    <div className="relative w-52 h-52" style={{ perspective: '1000px' }}>
      {/* Coin shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/40 rounded-full blur-xl"
        animate={isFlipping ? {
          scale: [1, 0.6, 0.4, 0.6, 1],
          opacity: [0.4, 0.2, 0.1, 0.2, 0.4]
        } : {}}
        transition={{ duration: 2 }}
        key={`shadow-${flipCount}`}
      />

      {/* Main coin container with 3D flip */}
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={isFlipping ? {
          rotateY: [0, 1800],
          y: [0, -100, -150, -100, 0],
        } : {}}
        transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
        key={flipCount}
      >
        {/* Heads side */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backfaceVisibility: 'hidden',
            transform: isHeads || isFlipping ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          {/* Outer rim - thick metallic edge */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-700 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)]" />

          {/* Inner coin face */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-[inset_0_4px_8px_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3)]">
            {/* Metallic shine overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent" />

            {/* Ridge pattern (coin edge lines) */}
            <div className="absolute inset-3 rounded-full border-4 border-yellow-500/40" />
            <div className="absolute inset-5 rounded-full border-2 border-yellow-600/30" />

            {/* Center design area */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]">
              {/* Crown emblem for heads */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">👑</div>
                <span className="text-xs font-black text-yellow-900/80 tracking-widest mt-1">HEADS</span>
              </div>
            </div>

            {/* Highlight arc */}
            <div className="absolute top-2 left-4 right-4 h-16 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
          </div>

          {/* Edge notches simulation */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-3 bg-gradient-to-b from-yellow-300 to-yellow-600"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: '50% 104px',
                transform: `rotate(${i * 15}deg) translateX(-50%)`,
              }}
            />
          ))}
        </div>

        {/* Tails side */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            backfaceVisibility: 'hidden',
            transform: !isHeads && !isFlipping ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          {/* Outer rim - silver edge */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.4)]" />

          {/* Inner coin face */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500 shadow-[inset_0_4px_8px_rgba(255,255,255,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3)]">
            {/* Metallic shine overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent" />

            {/* Ridge pattern */}
            <div className="absolute inset-3 rounded-full border-4 border-gray-400/40" />
            <div className="absolute inset-5 rounded-full border-2 border-gray-500/30" />

            {/* Center design area */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)]">
              {/* Eagle emblem for tails */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">🦅</div>
                <span className="text-xs font-black text-gray-700/80 tracking-widest mt-1">TAILS</span>
              </div>
            </div>

            {/* Highlight arc */}
            <div className="absolute top-2 left-4 right-4 h-16 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
          </div>

          {/* Edge notches simulation */}
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-3 bg-gradient-to-b from-gray-200 to-gray-500"
              style={{
                left: '50%',
                top: '0',
                transformOrigin: '50% 104px',
                transform: `rotate(${i * 15}deg) translateX(-50%)`,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Sparkle effects when flipping */}
      {isFlipping && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-300 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 150],
                y: [0, (Math.random() - 0.5) * 150],
              }}
              transition={{
                duration: 0.8,
                delay: 0.3 + i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

// Premium coin selector button
function CoinSelector({
  selected,
  side,
  onClick,
  disabled
}: {
  selected: boolean;
  side: 'heads' | 'tails';
  onClick: () => void;
  disabled: boolean;
}) {
  const isHeads = side === 'heads';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex-1 max-w-[140px] py-5 rounded-2xl font-bold text-lg transition-all overflow-hidden",
        selected
          ? isHeads
            ? "bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-700 text-white shadow-[0_8px_24px_rgba(234,179,8,0.4)]"
            : "bg-gradient-to-b from-gray-300 via-gray-400 to-gray-600 text-white shadow-[0_8px_24px_rgba(107,114,128,0.4)]"
          : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
      )}
    >
      {/* Shine effect when selected */}
      {selected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        />
      )}

      <div className="relative z-10">
        {/* Mini coin icon */}
        <div className={cn(
          "w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center",
          "shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
          isHeads
            ? "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-2 border-yellow-300/50"
            : "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-500 border-2 border-gray-200/50"
        )}>
          <span className="text-2xl drop-shadow-md">{isHeads ? '👑' : '🦅'}</span>
        </div>
        <span className={cn(
          "font-black tracking-wide",
          selected ? "text-white" : "text-white/60"
        )}>
          {side.toUpperCase()}
        </span>
      </div>
    </motion.button>
  );
}

export function CoinFlipGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, togglePracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [betAmount, setBetAmount] = useState(1.00);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [flipCount, setFlipCount] = useState(0);

  const flip = async () => {
    if (isFlipping) return;

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
        game: 'coinflip',
        betAmount,
        currency,
        timestamp: Date.now(),
        clientSeed: '',
      });
    }

    setIsFlipping(true);
    setResult(null);
    setShowWin(false);
    setFlipCount(prev => prev + 1);
    playSound('coinFlip');

    // Simulate coin flip (50/50)
    const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';

    // Wait for animation
    setTimeout(() => {
      setResult(flipResult);
      setIsFlipping(false);
      playSound('coinLand');

      const won = flipResult === selectedSide;

      if (isPracticeMode) {
        // Practice mode - just record stats
        recordPracticeResult(won);
        if (won) {
          setShowWin(true);
          playSound('win');
          showToast('You won! (Practice)', 'success');
          setTimeout(() => setShowWin(false), 2000);
        } else {
          playSound('lose');
          showToast('Better luck next time! (Practice)', 'error');
        }
      } else {
        // Real mode - update balance
        setPendingGame(null);

        if (won) {
          const winAmount = betAmount * 1.95;
          addBalance(currency, winAmount);
          setShowWin(true);
          playSound('win');
          showToast(`You won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
          setTimeout(() => setShowWin(false), 2000);

          addResult({
            id: crypto.randomUUID(),
            game: 'coinflip',
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
          showToast('Better luck next time!', 'error');

          addResult({
            id: crypto.randomUUID(),
            game: 'coinflip',
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
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Game Container */}
      <div className="flex-1 relative bg-gradient-to-b from-amber-900 via-yellow-900 to-amber-950 rounded-3xl overflow-hidden">
        {/* Gold particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <span className="text-2xl">🪙</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-yellow-400">COIN FLIP</h1>
                <p className="text-xs text-yellow-200/50">50/50 Chance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleSound} className="p-2 rounded-lg bg-white/10 hover:bg-white/20">
                {soundEnabled ? <Volume2 className="w-5 h-5 text-yellow-400" /> : <VolumeX className="w-5 h-5 text-yellow-400/50" />}
              </button>
              <button onClick={() => setShowRules(!showRules)} className={cn("p-2 rounded-lg", showRules ? "bg-yellow-500/30" : "bg-white/10 hover:bg-white/20")}>
                <Info className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
          </div>

          {/* Coin Display */}
          <div className="flex justify-center mb-8">
            {/* Win glow effect */}
            {showWin && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-64 h-64 bg-green-400/30 rounded-full blur-3xl" />
              </motion.div>
            )}

            {/* Realistic 3D Coin */}
            <RealisticCoin
              side={result}
              isFlipping={isFlipping}
              showResult={!!result}
              flipCount={flipCount}
            />
          </div>

          {/* Side Selection */}
          <div className="mb-6">
            <p className="text-center text-yellow-200/60 text-sm mb-3">Pick a side</p>
            <div className="flex justify-center gap-4">
              <CoinSelector
                side="heads"
                selected={selectedSide === 'heads'}
                onClick={() => setSelectedSide('heads')}
                disabled={isFlipping}
              />
              <CoinSelector
                side="tails"
                selected={selectedSide === 'tails'}
                onClick={() => setSelectedSide('tails')}
                disabled={isFlipping}
              />
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
                  disabled={isFlipping}
                  className={cn(
                    'px-6 py-2 rounded-full font-bold transition-all',
                    currency === c ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Balance */}
            <div className="text-center">
              <p className="text-yellow-200/60 text-sm">Balance</p>
              <p className="text-2xl font-bold text-yellow-400">{balance[currency].toFixed(2)} {currency.toUpperCase()}</p>
            </div>

            {/* Bet amount */}
            <div className="flex justify-center gap-2 flex-wrap">
              {BET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isFlipping}
                  className={cn(
                    'px-4 py-2 rounded-lg font-bold transition-all',
                    betAmount === amount ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Payout display */}
            <div className="text-center bg-black/20 rounded-xl py-2">
              <p className="text-yellow-200/60 text-xs">Potential Win (1.95x)</p>
              <p className="text-xl font-bold text-green-400">{(betAmount * 1.95).toFixed(2)} {currency.toUpperCase()}</p>
            </div>

            {/* Flip button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={flip}
              disabled={isFlipping || (!isPracticeMode && balance[currency] < betAmount)}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xl transition-all border-4",
                "bg-gradient-to-b from-yellow-500 to-yellow-700 border-yellow-400 text-white",
                "hover:from-yellow-400 hover:to-yellow-600",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isFlipping ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    🪙
                  </motion.span>
                  FLIPPING...
                </span>
              ) : (
                <span>FLIP ({betAmount} {currency.toUpperCase()})</span>
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
            <div className="bg-gray-800 rounded-2xl p-4 border-2 border-yellow-500/50">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">HOW TO PLAY</h3>
              <div className="space-y-2">
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-yellow-400 font-bold">1.</span> Choose your bet amount
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-yellow-400 font-bold">2.</span> Pick HEADS (👑) or TAILS (🦅)
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-yellow-400 font-bold">3.</span> Click FLIP to toss the coin
                </div>
                <div className="bg-black/30 rounded-lg p-3 text-white text-sm">
                  <span className="text-yellow-400 font-bold">4.</span> Win 1.95x your bet if you guess correctly!
                </div>
              </div>
              <div className="mt-3 p-2 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-center text-green-400">🔒 Provably Fair - 50/50 odds</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
