'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, Hand, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { useToast } from '@/components/ui/Toast';
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

  // Calculate blackjack value
  let value: number;
  if (rankIndex === 0) {
    value = 11; // Ace (can be 1 or 11)
  } else if (rankIndex >= 10) {
    value = 10; // Face cards
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

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return { value, soft: aces > 0 && value <= 21 };
}

interface CardComponentProps {
  card: PlayingCard;
  index: number;
  flipping?: boolean;
}

function CardComponent({ card, index, flipping }: CardComponentProps) {
  const isRed = card.suit === '♥' || card.suit === '♦';

  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180, x: -50 }}
      animate={{
        scale: 1,
        rotateY: card.hidden ? 180 : 0,
        x: 0,
      }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'w-16 h-24 rounded-lg flex flex-col items-center justify-center',
        'shadow-lg relative overflow-hidden',
        card.hidden
          ? 'bg-gradient-to-br from-primary-600 to-primary-800'
          : 'bg-white'
      )}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {card.hidden ? (
        <div className="absolute inset-2 border-2 border-primary-400/30 rounded-md flex items-center justify-center">
          <span className="text-2xl text-primary-300">?</span>
        </div>
      ) : (
        <>
          <span className={cn('text-lg font-bold', isRed ? 'text-red-500' : 'text-gray-900')}>
            {card.rank}
          </span>
          <span className={cn('text-2xl', isRed ? 'text-red-500' : 'text-gray-900')}>
            {card.suit}
          </span>
        </>
      )}
    </motion.div>
  );
}

const BET_AMOUNTS = [0.1, 0.5, 1, 5, 10];

type GameState = 'betting' | 'playing' | 'dealer' | 'finished';

export function BlackjackGame() {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { addResult } = useGameStore();
  const { showToast } = useToast();

  const [gameState, setGameState] = useState<GameState>('betting');
  const [betAmount, setBetAmount] = useState(BET_AMOUNTS[0]);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('wld');
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [deck, setDeck] = useState<number[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [clientSeed, setClientSeed] = useState(generateClientSeed());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'push' | 'blackjack' | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand);

  // Initialize game session
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

  const drawCard = useCallback(
    (hidden = false): PlayingCard => {
      const cardNum = deck[deckIndex];
      setDeckIndex((prev) => prev + 1);
      return { ...cardFromNumber(cardNum), hidden };
    },
    [deck, deckIndex]
  );

  const startGame = async () => {
    if (balance[currency] < betAmount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (!subtractBalance(currency, betAmount)) {
      showToast('Insufficient balance', 'error');
      return;
    }

    try {
      // Get shuffled deck from server
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

        // Deal initial cards
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

        // Check for blackjack
        const pValue = calculateHandValue([pCard1, pCard2]);
        if (pValue.value === 21) {
          // Reveal dealer card and check
          setTimeout(() => handleBlackjack(dCard2, [dCard1, dCard2]), 1000);
        }
      }
    } catch (error) {
      console.error('Start game error:', error);
      addBalance(currency, betAmount);
      showToast('Failed to start game', 'error');
    }
  };

  const handleBlackjack = (hiddenCard: PlayingCard, currentDealerHand: PlayingCard[]) => {
    const revealedHand = currentDealerHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(revealedHand);

    const dValue = calculateHandValue(revealedHand);
    if (dValue.value === 21) {
      // Push
      addBalance(currency, betAmount);
      setResult('push');
      showToast('Push! Both have Blackjack', 'info');
    } else {
      // Player wins with blackjack (3:2 payout)
      const winAmount = betAmount * 2.5;
      addBalance(currency, winAmount);
      setResult('blackjack');
      showToast(`Blackjack! You won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
    }
    setGameState('finished');
  };

  const hit = () => {
    if (gameState !== 'playing' || deckIndex >= deck.length) return;

    const newCard = cardFromNumber(deck[deckIndex]);
    setDeckIndex((prev) => prev + 1);
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const value = calculateHandValue(newHand);
    if (value.value > 21) {
      // Bust
      setResult('lose');
      setGameState('finished');
      showToast('Bust! You lose', 'error');

      // Reveal dealer card
      setDealerHand((prev) => prev.map((c) => ({ ...c, hidden: false })));
    }
  };

  const stand = async () => {
    if (gameState !== 'playing') return;

    setGameState('dealer');

    // Reveal dealer's hidden card
    let currentDealerHand: PlayingCard[] = dealerHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(currentDealerHand);

    // Dealer draws until 17+
    let dValue = calculateHandValue(currentDealerHand);

    const dealerDraw = () => {
      return new Promise<void>((resolve) => {
        const draw = () => {
          if (dValue.value < 17 && deckIndex < deck.length) {
            const newCard = cardFromNumber(deck[deckIndex]);
            setDeckIndex((prev) => prev + 1);
            currentDealerHand = [...currentDealerHand, newCard];
            setDealerHand(currentDealerHand);
            dValue = calculateHandValue(currentDealerHand);

            setTimeout(draw, 500);
          } else {
            resolve();
          }
        };
        setTimeout(draw, 500);
      });
    };

    await dealerDraw();

    // Determine winner
    const pValue = calculateHandValue(playerHand);
    const finalDValue = calculateHandValue(currentDealerHand);

    setTimeout(() => {
      if (finalDValue.value > 21) {
        // Dealer busts
        const winAmount = betAmount * 2;
        addBalance(currency, winAmount);
        setResult('win');
        showToast(`Dealer busts! You won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
      } else if (pValue.value > finalDValue.value) {
        const winAmount = betAmount * 2;
        addBalance(currency, winAmount);
        setResult('win');
        showToast(`You won ${winAmount.toFixed(2)} ${currency.toUpperCase()}!`, 'success');
      } else if (pValue.value < finalDValue.value) {
        setResult('lose');
        showToast('Dealer wins', 'error');
      } else {
        addBalance(currency, betAmount);
        setResult('push');
        showToast('Push! Bet returned', 'info');
      }

      setGameState('finished');
      addResult({
        id: crypto.randomUUID(),
        game: 'blackjack',
        betAmount,
        currency,
        outcome: result === 'win' || result === 'blackjack' ? 'win' : result === 'push' ? 'push' : 'lose',
        payout: result === 'blackjack' ? betAmount * 2.5 : result === 'win' ? betAmount * 2 : result === 'push' ? betAmount : 0,
        timestamp: Date.now(),
        serverSeed: '',
        clientSeed,
        nonce: 0,
      });
    }, 500);
  };

  const newGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setResult(null);
    setGameState('betting');
    setClientSeed(generateClientSeed());
    initSession();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-teal-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-primary-500 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold neon-text-teal">Blackjack</h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Dealer Hand */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-white/60">Dealer</span>
              {gameState !== 'betting' && (
                <span className="text-sm font-bold text-white">
                  {dealerHand.some((c) => c.hidden) ? '?' : dealerValue.value}
                </span>
              )}
            </div>
            <div className="flex gap-2 min-h-[96px]">
              <AnimatePresence>
                {dealerHand.map((card, index) => (
                  <CardComponent key={`dealer-${index}`} card={card} index={index} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Player Hand */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-white/60">Your Hand</span>
              {gameState !== 'betting' && (
                <span className={cn(
                  'text-sm font-bold',
                  playerValue.value > 21 ? 'text-red-400' : 'text-white'
                )}>
                  {playerValue.value}
                  {playerValue.soft && playerValue.value <= 21 && ' (soft)'}
                </span>
              )}
            </div>
            <div className="flex gap-2 min-h-[96px]">
              <AnimatePresence>
                {playerHand.map((card, index) => (
                  <CardComponent key={`player-${index}`} card={card} index={index} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  'text-center py-3 px-6 rounded-xl mb-4',
                  result === 'win' || result === 'blackjack'
                    ? 'bg-gradient-to-r from-teal-500/20 to-teal-600/20 border border-teal-500/30'
                    : result === 'push'
                    ? 'bg-white/5 border border-white/10'
                    : 'bg-red-500/10 border border-red-500/30'
                )}
              >
                <p className={cn(
                  'text-xl font-bold',
                  result === 'win' || result === 'blackjack'
                    ? 'neon-text-teal'
                    : result === 'push'
                    ? 'text-white'
                    : 'text-red-400'
                )}>
                  {result === 'blackjack' && 'BLACKJACK!'}
                  {result === 'win' && 'YOU WIN!'}
                  {result === 'lose' && 'DEALER WINS'}
                  {result === 'push' && 'PUSH'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {gameState === 'betting' && (
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
                        ? 'bg-teal-600 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    )}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Bet Amount */}
              <div className="space-y-2">
                <div className="flex justify-center gap-2 flex-wrap">
                  {BET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg font-medium text-sm transition-all',
                        betAmount === amount
                          ? 'bg-teal-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                {/* Custom Bet Input */}
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={betAmount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0.1) setBetAmount(val);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm text-center placeholder-white/30 focus:outline-none focus:border-teal-500 transition-colors"
                      placeholder="Custom"
                    />
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="lg"
                onClick={startGame}
                disabled={balance[currency] < betAmount}
                className="w-full"
              >
                Deal ({betAmount} {currency.toUpperCase()})
              </Button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={hit}
                className="flex-1"
              >
                <Plus className="w-5 h-5" />
                Hit
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={stand}
                className="flex-1"
              >
                <Hand className="w-5 h-5" />
                Stand
              </Button>
            </div>
          )}

          {gameState === 'dealer' && (
            <div className="text-center py-4">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-white/60"
              >
                Dealer is playing...
              </motion.div>
            </div>
          )}

          {gameState === 'finished' && (
            <Button
              variant="primary"
              size="lg"
              onClick={newGame}
              className="w-full"
            >
              <RefreshCw className="w-5 h-5" />
              New Game
            </Button>
          )}
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
              <h3 className="font-bold mb-3">Rules</h3>
              <ul className="space-y-1 text-sm text-white/70">
                <li>• Get as close to 21 as possible without going over</li>
                <li>• Face cards (J, Q, K) are worth 10</li>
                <li>• Aces are worth 1 or 11</li>
                <li>• Dealer must hit on 16 and stand on 17</li>
                <li>• Blackjack pays 3:2</li>
                <li>• Regular win pays 2:1</li>
              </ul>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
