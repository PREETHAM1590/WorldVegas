'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Users, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/components/ui/Toast';
import { cn, formatCurrency } from '@/lib/utils';

interface Market {
  id: string;
  question: string;
  category: string;
  endTime: number;
  yesPrice: number; // 0-100
  noPrice: number;
  totalVolume: number;
  participants: number;
  resolved?: boolean;
  outcome?: 'yes' | 'no';
}

// Mock markets data
const MOCK_MARKETS: Market[] = [
  {
    id: '1',
    question: 'Will BTC reach $100k by end of 2025?',
    category: 'Crypto',
    endTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    yesPrice: 67,
    noPrice: 33,
    totalVolume: 125000,
    participants: 1247,
  },
  {
    id: '2',
    question: 'Will World App reach 10M users this month?',
    category: 'Tech',
    endTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    yesPrice: 82,
    noPrice: 18,
    totalVolume: 45000,
    participants: 523,
  },
  {
    id: '3',
    question: 'Will ETH flip BTC market cap in 2025?',
    category: 'Crypto',
    endTime: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
    yesPrice: 15,
    noPrice: 85,
    totalVolume: 89000,
    participants: 892,
  },
  {
    id: '4',
    question: 'Will there be a major DeFi hack (>$100M) this week?',
    category: 'DeFi',
    endTime: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days
    yesPrice: 23,
    noPrice: 77,
    totalVolume: 12000,
    participants: 156,
  },
];

interface MarketCardProps {
  market: Market;
  onSelect: (market: Market) => void;
}

function MarketCard({ market, onSelect }: MarketCardProps) {
  const timeLeft = market.endTime - Date.now();
  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return (
    <Card
      onClick={() => onSelect(market)}
      className="p-4 cursor-pointer hover:border-primary-500/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/20 text-primary-300">
          {market.category}
        </span>
        <div className="flex items-center gap-1 text-xs text-white/50">
          <Clock className="w-3 h-3" />
          <span>
            {days > 0 ? `${days}d` : ''} {hours}h
          </span>
        </div>
      </div>

      <h3 className="font-semibold text-white mb-4 line-clamp-2">{market.question}</h3>

      {/* Price Bars */}
      <div className="relative h-8 bg-casino-dark rounded-lg overflow-hidden mb-3">
        <motion.div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-teal-600 to-teal-500"
          initial={{ width: 0 }}
          animate={{ width: `${market.yesPrice}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-sm font-bold text-white flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Yes {market.yesPrice}%
          </span>
          <span className="text-sm font-bold text-white flex items-center gap-1">
            No {market.noPrice}%
            <TrendingDown className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-white/50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            ${formatCurrency(market.totalVolume, 0)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {market.participants}
          </span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Card>
  );
}

interface BettingModalProps {
  market: Market | null;
  onClose: () => void;
}

function BettingModal({ market, onClose }: BettingModalProps) {
  const { balance, subtractBalance, addBalance } = useUserStore();
  const { showToast } = useToast();

  const [position, setPosition] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState(10);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('usdc');
  const [isPlacing, setIsPlacing] = useState(false);

  if (!market) return null;

  const price = position === 'yes' ? market.yesPrice : market.noPrice;
  const potentialPayout = (amount / price) * 100;

  const placeBet = async () => {
    if (balance[currency] < amount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    if (!subtractBalance(currency, amount)) {
      showToast('Insufficient balance', 'error');
      return;
    }

    setIsPlacing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    showToast(
      `Placed ${position.toUpperCase()} position for ${amount} ${currency.toUpperCase()}`,
      'success'
    );

    setIsPlacing(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-lg bg-casino-card rounded-t-3xl p-6 safe-area-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-bold mb-2">{market.question}</h2>

        <div className="flex items-center gap-2 mb-6 text-sm text-white/50">
          <Clock className="w-4 h-4" />
          <span>Ends in {Math.ceil((market.endTime - Date.now()) / (24 * 60 * 60 * 1000))} days</span>
        </div>

        {/* Position Selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPosition('yes')}
            className={cn(
              'flex-1 py-4 rounded-xl font-bold transition-all',
              position === 'yes'
                ? 'bg-teal-600 text-white shadow-neon-teal'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Yes {market.yesPrice}¢</span>
            </div>
          </button>
          <button
            onClick={() => setPosition('no')}
            className={cn(
              'flex-1 py-4 rounded-xl font-bold transition-all',
              position === 'no'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span>No {market.noPrice}¢</span>
            </div>
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm text-white/60 mb-2">Amount</label>
          <div className="flex gap-2 mb-3">
            {[5, 10, 25, 50, 100].map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  amount === a
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['wld', 'usdc'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  currency === c
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                )}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Potential Payout */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Potential payout</span>
            <span className="text-xl font-bold text-teal-400">
              ${formatCurrency(potentialPayout)}
            </span>
          </div>
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-white/40">If {position.toUpperCase()} wins</span>
            <span className="text-white/40">{((potentialPayout / amount - 1) * 100).toFixed(0)}% return</span>
          </div>
        </div>

        {/* Place Bet Button */}
        <Button
          variant={position === 'yes' ? 'secondary' : 'danger'}
          size="lg"
          onClick={placeBet}
          isLoading={isPlacing}
          disabled={balance[currency] < amount}
          className="w-full"
        >
          Place {position.toUpperCase()} for {amount} {currency.toUpperCase()}
        </Button>
      </motion.div>
    </motion.div>
  );
}

export function PredictionMarket() {
  const [markets, setMarkets] = useState<Market[]>(MOCK_MARKETS);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...new Set(markets.map((m) => m.category))];

  const filteredMarkets =
    filter === 'all' ? markets : markets.filter((m) => m.category === filter);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold neon-text-purple">Prediction Markets</h2>
        <div className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-sm font-medium">
          {markets.length} Active
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              filter === cat
                ? 'bg-primary-600 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            )}
          >
            {cat === 'all' ? 'All Markets' : cat}
          </button>
        ))}
      </div>

      {/* Markets List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredMarkets.map((market, index) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <MarketCard market={market} onSelect={setSelectedMarket} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Betting Modal */}
      <AnimatePresence>
        {selectedMarket && (
          <BettingModal market={selectedMarket} onClose={() => setSelectedMarket(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
