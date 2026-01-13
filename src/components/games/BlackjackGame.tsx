'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, Hand, Info, Volume2, VolumeX } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { usePracticeModeStore } from '@/stores/practiceModeStore';
import { useToast } from '@/components/ui/Toast';
import { useSound, useSoundSettings } from '@/hooks/useSound';
import { PracticeModeBanner } from '@/components/ui/PracticeMode';
import { generateClientSeed } from '@/lib/provablyFair';
import { cn } from '@/lib/utils';

// Card utilities
const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

interface PlayingCard {
  suit: (typeof SUITS)[number];
  rank: (typeof RANKS)[number];
  value: number;
  hidden?: boolean;
}

function cardFromNumber(num: number): PlayingCard {
  const suitIndex = Math.floor(num / 13);
  const rankIndex = num % 13;
  const suit = SUITS[suitIndex];
  const rank = RANKS[rankIndex];

  let value: number;
  if (rankIndex === 0) {
    value = 11;
  } else if (rankIndex >= 10) {
    value = 10;
  } else {
    value = rankIndex + 1;
  }

  return { suit, rank, value };
}

function calculateHandValue(cards: PlayingCard[]): { value: number; soft: boolean } {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.hidden) continue;
    value += card.value;
    if (card.rank === 'A') aces++;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return { value, soft: aces > 0 && value <= 21 };
}

// Realistic playing card component
function PlayingCardComponent({
  card,
  index,
  isWinning,
  total
}: {
  card: PlayingCard;
  index: number;
  isWinning?: boolean;
  total: number;
}) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const offset = Math.min(index * 25, 100);

  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180, x: 50, opacity: 0 }}
      animate={{
        scale: 1,
        rotateY: card.hidden ? 180 : 0,
        x: 0,
        opacity: 1,
      }}
      transition={{
        delay: index * 0.2,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      className="absolute"
      style={{
        left: `${offset}px`,
        zIndex: index,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Win glow */}
      {isWinning && !card.hidden && (
        <motion.div
          className="absolute -inset-2 bg-green-400 rounded-xl blur-lg"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <div
        className={cn(
          'relative w-[70px] h-[100px] sm:w-[80px] sm:h-[115px] rounded-xl shadow-2xl',
          'transition-transform duration-300 hover:translate-y-[-5px]',
          card.hidden
            ? 'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950'
            : 'bg-white'
        )}
        style={{
          boxShadow: isWinning
            ? '0 10px 30px rgba(34, 197, 94, 0.5)'
            : '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        {card.hidden ? (
          <>
            {/* Card back design */}
            <div className="absolute inset-2 rounded-lg border-2 border-blue-400/30 bg-gradient-to-br from-blue-700/50 to-blue-900/50">
              {/* Diamond pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rotate-45 bg-blue-400/30" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl opacity-50">🎴</span>
            </div>
          </>
        ) : (
          <>
            {/* Top left corner */}
            <div className="absolute top-2 left-2">
              <p className={cn(
                'text-lg sm:text-xl font-bold leading-none',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.rank}
              </p>
              <p className={cn(
                'text-base sm:text-lg leading-none -mt-0.5',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.suit}
              </p>
            </div>

            {/* Center suit - larger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                'text-4xl sm:text-5xl',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.suit}
              </span>
            </div>

            {/* Bottom right corner (inverted) */}
            <div className="absolute bottom-2 right-2 rotate-180">
              <p className={cn(
                'text-lg sm:text-xl font-bold leading-none',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.rank}
              </p>
              <p className={cn(
                'text-base sm:text-lg leading-none -mt-0.5',
                isRed ? 'text-red-600' : 'text-gray-900'
              )}>
                {card.suit}
              </p>
            </div>

            {/* Card shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-xl pointer-events-none" />
          </>
        )}
      </div>
    </motion.div>
  );
}

// Casino chip component
function CasinoChip({
  value,
  selected,
  onClick,
  disabled
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const chipColors: Record<number, { bg: string; border: string; text: string }> = {
    0.5: { bg: 'from-gray-500 to-gray-700', border: 'border-gray-400', text: 'text-white' },
    1: { bg: 'from-blue-500 to-blue-700', border: 'border-blue-400', text: 'text-white' },
    5: { bg: 'from-red-500 to-red-700', border: 'border-red-400', text: 'text-white' },
    10: { bg: 'from-green-500 to-green-700', border: 'border-green-400', text: 'text-white' },
    25: { bg: 'from-purple-500 to-purple-700', border: 'border-purple-400', text: 'text-white' },
  };

  const colors = chipColors[value] || chipColors[1];

  return (
    <motion.button
      whileHover={{ scale: 1.1, y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative w-14 h-14 sm:w-16 sm:h-16 rounded-full',
        `bg-gradient-to-b ${colors.bg}`,
        'shadow-lg transition-all',
        selected && 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-green-900',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Chip edge decorations */}
      <div className={cn('absolute inset-1 rounded-full border-2 border-dashed', colors.border)} />
      <div className="absolute inset-3 rounded-full border border-white/30" />

      {/* Value */}
      <span className={cn('relative font-bold text-sm sm:text-base', colors.text)}>
        {value}
      </span>
    </motion.button>
  );
}

// Big win overlay
function BigWinOverlay({ amount, isBlackjack, currency }: { amount: number; isBlackjack: boolean; currency: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl"
          initial={{ x: '50%', y: '50%', scale: 0 }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: [0, 1.5, 0],
            rotate: Math.random() * 720
          }}
          transition={{ duration: 2, delay: i * 0.04 }}
        >
          {['🃏', '💰', '🎉', '✨', '💎', '🏆'][Math.floor(Math.random() * 6)]}
        </motion.div>
      ))}

      <motion.div
        className="relative z-10 text-center"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
      >
        {isBlackjack && (
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 1, repeat: 2 }}
          >
            🃏
          </motion.div>
        )}

        <div className="bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-3xl p-8 shadow-2xl">
          <motion.h2
            className="text-4xl sm:text-6xl font-black text-white mb-2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {isBlackjack ? 'BLACKJACK!' : 'YOU WIN!'}
          </motion.h2>
          <p className="text-3xl sm:text-5xl font-black text-white">
            +{amount.toFixed(2)} {currency.toUpperCase()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

const BET_AMOUNTS = [0.5, 1, 5, 10, 25];
type GameState = 'betting' | 'playing' | 'dealer' | 'finished';

export function BlackjackGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult, setPendingGame } = useGameStore();
  const { isPracticeMode, recordPracticeResult } = usePracticeModeStore();
  const { showToast } = useToast();
  const { play: playSound } = useSound();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();

  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState(BET_AMOUNTS[1]);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [deck, setDeck] = useState<number[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [clientSeed, setClientSeed] = useState(generateClientSeed());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'push' | 'blackjack' | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showBigWin, setShowBigWin] = useState(false);
  const [winAmount, setWinAmount] = useState(0);

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  // Initialize session
  const initSession = useCallback(async () => {
    try {
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user',
          gameType: 'blackjack',
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

  const startGame = async () => {
    // In practice mode, skip balance checks and simulate locally
    if (isPracticeMode) {
      // Create a shuffled deck locally
      const shuffledDeck: number[] = [];
      for (let i = 0; i < 52; i++) {
        shuffledDeck.push(i);
      }
      // Shuffle
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }

      setDeck(shuffledDeck);
      setDeckIndex(0);

      const pCard1 = cardFromNumber(shuffledDeck[0]);
      const dCard1 = cardFromNumber(shuffledDeck[1]);
      const pCard2 = cardFromNumber(shuffledDeck[2]);
      const dCard2 = { ...cardFromNumber(shuffledDeck[3]), hidden: true };

      setPlayerHand([pCard1, pCard2]);
      setDealerHand([dCard1, dCard2]);
      setDeckIndex(4);
      setGameState('playing');
      setResult(null);
      setShowBigWin(false);

      playSound('chipStack');
      playSound('cardDeal');
      setTimeout(() => playSound('cardDeal'), 200);
      setTimeout(() => playSound('cardDeal'), 400);
      setTimeout(() => playSound('cardDeal'), 600);

      // Check for blackjack
      const pValue = calculateHandValue([pCard1, pCard2]);
      if (pValue.value === 21) {
        setTimeout(() => handleBlackjack(dCard2, [dCard1, dCard2]), 1200);
      }
      return;
    }

    if (balance[currency] < betAmount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    const pendingId = crypto.randomUUID();
    setPendingGame({
      id: pendingId,
      game: 'blackjack',
      betAmount,
      currency,
      timestamp: Date.now(),
      clientSeed,
    });

    if (!subtractBalance(currency, betAmount)) {
      showToast('Insufficient balance', 'error');
      setPendingGame(null);
      return;
    }

    playSound('chipStack');

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

      if (result.success && result.outcome?.deck) {
        setDeck(result.outcome.deck);
        setDeckIndex(0);

        const newDeck = result.outcome.deck;
        const pCard1 = cardFromNumber(newDeck[0]);
        const dCard1 = cardFromNumber(newDeck[1]);
        const pCard2 = cardFromNumber(newDeck[2]);
        const dCard2 = { ...cardFromNumber(newDeck[3]), hidden: true };

        setPlayerHand([pCard1, pCard2]);
        setDealerHand([dCard1, dCard2]);
        setDeckIndex(4);
        setGameState('playing');
        setResult(null);
        setShowBigWin(false);

        // Deal sounds with delays
        playSound('cardDeal');
        setTimeout(() => playSound('cardDeal'), 200);
        setTimeout(() => playSound('cardDeal'), 400);
        setTimeout(() => playSound('cardDeal'), 600);

        // Check for blackjack
        const pValue = calculateHandValue([pCard1, pCard2]);
        if (pValue.value === 21) {
          setTimeout(() => handleBlackjack(dCard2, [dCard1, dCard2]), 1200);
        }
      } else {
        // API returned error - refund bet
        throw new Error(result.error || 'Failed to deal cards');
      }
    } catch (error) {
      console.error('Start game error:', error);
      // ALWAYS refund the bet on any error
      addBalance(currency, betAmount);
      setPendingGame(null);
      setGameState('betting');
      showToast('Connection error. Bet refunded.', 'error');
    }
  };

  const handleBlackjack = (hiddenCard: PlayingCard, currentDealerHand: PlayingCard[]) => {
    playSound('cardFlip');
    const revealedHand = currentDealerHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(revealedHand);

    const dValue = calculateHandValue(revealedHand);
    if (dValue.value === 21) {
      if (!isPracticeMode) {
        addBalance(currency, betAmount);
      }
      recordPracticeResult(false); // Push counts as not a win for practice
      setResult('push');
      showToast(isPracticeMode ? 'Push! Both have Blackjack (Practice)' : 'Push! Both have Blackjack', 'info');
    } else {
      const win = betAmount * 2.5;
      if (!isPracticeMode) {
        addBalance(currency, win);
      }
      recordPracticeResult(true);
      setResult('blackjack');
      setWinAmount(win);
      setShowBigWin(true);
      playSound('jackpot');
      setTimeout(() => setShowBigWin(false), 3000);
      showToast(isPracticeMode ? `Blackjack! (Practice)` : `Blackjack! Won ${win.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
    }
    setGameState('finished');
    if (!isPracticeMode) {
      setPendingGame(null);
    }
  };

  const hit = () => {
    if (gameState !== 'playing' || deckIndex >= deck.length) return;

    playSound('cardDeal');
    const newCard = cardFromNumber(deck[deckIndex]);
    setDeckIndex((prev) => prev + 1);
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const value = calculateHandValue(newHand);
    if (value.value > 21) {
      setResult('lose');
      setGameState('finished');
      if (!isPracticeMode) {
        setPendingGame(null);
      }
      recordPracticeResult(false);
      playSound('lose');
      showToast(isPracticeMode ? 'Bust! You lose (Practice)' : 'Bust! You lose', 'error');
      setDealerHand((prev) => prev.map((c) => ({ ...c, hidden: false })));
    }
  };

  const stand = async () => {
    if (gameState !== 'playing') return;

    setGameState('dealer');
    playSound('cardFlip');

    let currentDealerHand: PlayingCard[] = dealerHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(currentDealerHand);

    let dValue = calculateHandValue(currentDealerHand);

    const dealerDraw = () => {
      return new Promise<void>((resolve) => {
        const draw = () => {
          if (dValue.value < 17 && deckIndex < deck.length) {
            playSound('cardDeal');
            const newCard = cardFromNumber(deck[deckIndex]);
            setDeckIndex((prev) => prev + 1);
            currentDealerHand = [...currentDealerHand, newCard];
            setDealerHand(currentDealerHand);
            dValue = calculateHandValue(currentDealerHand);
            setTimeout(draw, 700);
          } else {
            resolve();
          }
        };
        setTimeout(draw, 700);
      });
    };

    await dealerDraw();

    const pValue = calculateHandValue(playerHand);
    const finalDValue = calculateHandValue(currentDealerHand);

    setTimeout(() => {
      let gameResult: 'win' | 'lose' | 'push' = 'lose';
      let payout = 0;

      if (finalDValue.value > 21) {
        const win = betAmount * 2;
        if (!isPracticeMode) {
          addBalance(currency, win);
        }
        gameResult = 'win';
        payout = win;
        setWinAmount(win);
        setShowBigWin(true);
        playSound('bigWin');
        setTimeout(() => setShowBigWin(false), 2500);
        showToast(isPracticeMode ? `Dealer busts! You win! (Practice)` : `Dealer busts! Won ${win.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
      } else if (pValue.value > finalDValue.value) {
        const win = betAmount * 2;
        if (!isPracticeMode) {
          addBalance(currency, win);
        }
        gameResult = 'win';
        payout = win;
        setWinAmount(win);
        setShowBigWin(true);
        playSound('win');
        setTimeout(() => setShowBigWin(false), 2500);
        showToast(isPracticeMode ? `You win! (Practice)` : `You win ${win.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
      } else if (pValue.value < finalDValue.value) {
        gameResult = 'lose';
        playSound('lose');
        showToast(isPracticeMode ? 'Dealer wins (Practice)' : 'Dealer wins', 'error');
      } else {
        if (!isPracticeMode) {
          addBalance(currency, betAmount);
        }
        gameResult = 'push';
        payout = betAmount;
        playSound('chip');
        showToast(isPracticeMode ? 'Push! (Practice)' : 'Push! Bet returned', 'info');
      }

      // Record practice result
      if (isPracticeMode) {
        recordPracticeResult(gameResult === 'win');
      }

      setResult(gameResult);
      setGameState('finished');

      if (!isPracticeMode) {
        setPendingGame(null);

        addResult({
          id: crypto.randomUUID(),
          game: 'blackjack',
          betAmount,
          currency,
          outcome: gameResult,
          payout,
          timestamp: Date.now(),
          serverSeed: '',
          clientSeed,
          nonce: 0,
        });
      }
    }, 600);
  };

  const newGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    setGameState('betting');
    setShowBigWin(false);
    setClientSeed(generateClientSeed());
    initSession();
  };

  const isWin = result === 'win' || result === 'blackjack';

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      {/* Practice Mode Banner */}
      <PracticeModeBanner className="mb-4" />

      {/* Big Win Overlay */}
      <AnimatePresence>
        {showBigWin && (
          <BigWinOverlay
            amount={winAmount}
            isBlackjack={result === 'blackjack'}
            currency={currency}
          />
        )}
      </AnimatePresence>

      {/* Casino Table */}
      <div className="flex-1 relative">
        {/* Green felt background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-800 via-green-700 to-green-800 rounded-3xl" />

        {/* Table texture overlay */}
        <div className="absolute inset-0 opacity-20 rounded-3xl"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.3) 100%)'
          }}
        />

        {/* Table border */}
        <div className="absolute inset-0 rounded-3xl border-8 border-yellow-900/60" />
        <div className="absolute inset-2 rounded-2xl border-2 border-yellow-600/30" />

        <div className="relative z-10 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-wide drop-shadow-lg">
              BLACKJACK
            </h1>
            <div className="flex gap-2">
              <button
                onClick={toggleSound}
                className="p-2 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-yellow-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-yellow-400/50" />
                )}
              </button>
              <button
                onClick={() => setShowRules(!showRules)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showRules ? "bg-yellow-500/30" : "bg-black/20 hover:bg-black/30"
                )}
              >
                <Info className="w-5 h-5 text-yellow-400" />
              </button>
            </div>
          </div>

          {/* Dealer Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Dealer</span>
              {gameState !== 'betting' && (
                <div className={cn(
                  'px-3 py-1 rounded-full text-sm font-bold',
                  dealerValue.value > 21 ? 'bg-red-500 text-white' :
                    dealerValue.value === 21 ? 'bg-yellow-500 text-black' :
                      'bg-black/30 text-white'
                )}>
                  {dealerHand.some((c) => c.hidden) ? '?' : dealerValue.value}
                  {dealerValue.value > 21 && ' BUST'}
                </div>
              )}
            </div>

            {/* Dealer cards area */}
            <div className="relative h-[120px] sm:h-[130px]">
              {dealerHand.length > 0 ? (
                dealerHand.map((card, index) => (
                  <PlayingCardComponent
                    key={`dealer-${index}`}
                    card={card}
                    index={index}
                    total={dealerHand.length}
                    isWinning={result === 'lose' && gameState === 'finished'}
                  />
                ))
              ) : (
                <div className="absolute left-0 w-[70px] h-[100px] sm:w-[80px] sm:h-[115px] rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/30">
                  ?
                </div>
              )}
            </div>
          </div>

          {/* Center divider with bet display */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
            {gameState !== 'betting' && (
              <div className="px-4 py-2 bg-black/30 rounded-full border border-yellow-600/30">
                <span className="text-yellow-400 font-bold">
                  BET: {betAmount} {currency.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/50 to-transparent" />
          </div>

          {/* Player Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-bold text-white/80 uppercase tracking-wider">Your Hand</span>
              {gameState !== 'betting' && (
                <div className={cn(
                  'px-3 py-1 rounded-full text-sm font-bold',
                  playerValue.value > 21 ? 'bg-red-500 text-white' :
                    playerValue.value === 21 ? 'bg-yellow-500 text-black' :
                      'bg-black/30 text-white'
                )}>
                  {playerValue.value}
                  {playerValue.soft && playerValue.value <= 21 && ' soft'}
                  {playerValue.value > 21 && ' BUST'}
                  {playerValue.value === 21 && playerHand.length === 2 && ' BJ!'}
                </div>
              )}
            </div>

            {/* Player cards area */}
            <div className="relative h-[120px] sm:h-[130px]">
              {playerHand.length > 0 ? (
                playerHand.map((card, index) => (
                  <PlayingCardComponent
                    key={`player-${index}`}
                    card={card}
                    index={index}
                    total={playerHand.length}
                    isWinning={isWin && gameState === 'finished'}
                  />
                ))
              ) : (
                <div className="absolute left-0 w-[70px] h-[100px] sm:w-[80px] sm:h-[115px] rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-white/30">
                  ?
                </div>
              )}
            </div>
          </div>

          {/* Result Display */}
          <AnimatePresence>
            {result && !showBigWin && (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                className={cn(
                  'text-center py-3 px-6 rounded-2xl mb-4 font-black text-xl',
                  isWin ? 'bg-green-500 text-white' :
                    result === 'push' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                )}
              >
                {result === 'blackjack' && 'BLACKJACK! 🎉'}
                {result === 'win' && 'YOU WIN! 🎉'}
                {result === 'lose' && 'DEALER WINS'}
                {result === 'push' && 'PUSH - BET RETURNED'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {gameState === 'betting' && (
            <div className="space-y-4">
              {/* Currency toggle */}
              <div className="flex justify-center gap-2">
                {(['wld', 'usdc'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={cn(
                      'px-6 py-2 rounded-full font-bold transition-all',
                      currency === c
                        ? 'bg-yellow-500 text-black'
                        : 'bg-black/30 text-white hover:bg-black/40'
                    )}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Balance */}
              <div className="text-center">
                <p className="text-white/60 text-sm">Balance</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {balance[currency].toFixed(2)} {currency.toUpperCase()}
                </p>
              </div>

              {/* Chip selection */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                {BET_AMOUNTS.map((amount) => (
                  <CasinoChip
                    key={amount}
                    value={amount}
                    selected={betAmount === amount}
                    onClick={() => {
                      setBetAmount(amount);
                      playSound('chip');
                    }}
                  />
                ))}
              </div>

              {/* Deal button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                disabled={!isPracticeMode && balance[currency] < betAmount}
                className={cn(
                  'w-full py-4 rounded-2xl font-black text-xl transition-all',
                  'bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-700',
                  'border-4 border-yellow-400 shadow-lg',
                  'hover:from-yellow-400 hover:via-yellow-500 hover:to-yellow-600',
                  'disabled:from-gray-600 disabled:to-gray-700 disabled:border-gray-500 disabled:opacity-50'
                )}
              >
                <span className="flex items-center justify-center gap-2 text-white drop-shadow-lg">
                  🃏 DEAL ({betAmount} {currency.toUpperCase()})
                </span>
              </motion.button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={hit}
                className="flex-1 py-4 rounded-2xl font-black text-lg bg-gradient-to-b from-blue-500 to-blue-700 border-4 border-blue-400 text-white shadow-lg hover:from-blue-400 hover:to-blue-600"
              >
                <span className="flex items-center justify-center gap-2">
                  <Plus className="w-6 h-6" /> HIT
                </span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={stand}
                className="flex-1 py-4 rounded-2xl font-black text-lg bg-gradient-to-b from-red-500 to-red-700 border-4 border-red-400 text-white shadow-lg hover:from-red-400 hover:to-red-600"
              >
                <span className="flex items-center justify-center gap-2">
                  <Hand className="w-6 h-6" /> STAND
                </span>
              </motion.button>
            </div>
          )}

          {gameState === 'dealer' && (
            <div className="text-center py-6">
              <motion.div
                className="flex items-center justify-center gap-2 text-yellow-400 text-lg font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <motion.span
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-2xl"
                >
                  🃏
                </motion.span>
                Dealer is playing...
              </motion.div>
            </div>
          )}

          {gameState === 'finished' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={newGame}
              className="w-full py-4 rounded-2xl font-black text-xl bg-gradient-to-b from-green-500 to-green-700 border-4 border-green-400 text-white shadow-lg hover:from-green-400 hover:to-green-600"
            >
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-6 h-6" /> NEW GAME
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Rules Panel */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-4 border-2 border-yellow-600/50">
              {/* How to Play */}
              <h3 className="text-lg font-bold text-yellow-400 mb-3 text-center">HOW TO PLAY</h3>
              <div className="space-y-2 mb-4">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-white text-sm">
                    <span className="text-yellow-400 font-bold">1.</span> Select a chip to set your bet amount
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-white text-sm">
                    <span className="text-yellow-400 font-bold">2.</span> Press DEAL to receive your cards
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-white text-sm">
                    <span className="text-yellow-400 font-bold">3.</span> Choose HIT to get another card or STAND to keep your hand
                  </p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="text-white text-sm">
                    <span className="text-yellow-400 font-bold">4.</span> Beat the dealer by getting closer to 21 without going over!
                  </p>
                </div>
              </div>

              {/* Card Values */}
              <h4 className="text-center text-sm font-bold text-yellow-400 mb-2">CARD VALUES</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-2xl">2-10</p>
                  <p className="text-white/60 text-xs">Face Value</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-2xl">J Q K</p>
                  <p className="text-white/60 text-xs">Worth 10</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-2xl">A</p>
                  <p className="text-white/60 text-xs">1 or 11</p>
                </div>
              </div>

              {/* Rules */}
              <h4 className="text-center text-sm font-bold text-yellow-400 mb-2">GAME RULES</h4>
              <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                <div className="bg-black/20 rounded-lg p-2">
                  <span className="text-yellow-400">•</span> Dealer must hit on 16 and stand on 17
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <span className="text-yellow-400">•</span> Going over 21 is a BUST - you lose automatically
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <span className="text-yellow-400">•</span> Blackjack = Ace + 10-value card on first deal
                </div>
                <div className="bg-black/20 rounded-lg p-2">
                  <span className="text-yellow-400">•</span> Push (tie) returns your bet
                </div>
              </div>

              {/* Payouts */}
              <h4 className="text-center text-sm font-bold text-yellow-400 mb-2">PAYOUTS</h4>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-green-400 font-bold text-lg">3:2</p>
                  <p className="text-white/60 text-xs">Blackjack</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-green-400 font-bold text-lg">2:1</p>
                  <p className="text-white/60 text-xs">Win</p>
                </div>
                <div className="bg-black/30 rounded-lg p-2 text-center">
                  <p className="text-yellow-400 font-bold text-lg">1:1</p>
                  <p className="text-white/60 text-xs">Push</p>
                </div>
              </div>

              {/* Provably Fair */}
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <h4 className="text-green-400 font-bold text-sm mb-1">🔒 Provably Fair</h4>
                <p className="text-xs text-white/70">
                  Cards are dealt from a cryptographically shuffled deck. Each game uses verifiable random number generation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
