'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gift,
  ArrowLeft,
  Crown,
  Star,
  Zap,
  Clock,
  CheckCircle,
  Lock,
  Sparkles,
  Trophy,
  Calendar,
  ChevronRight,
  Coins
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  amount: string;
  currency: 'wld' | 'usdc';
  type: 'daily' | 'weekly' | 'achievement' | 'vip';
  claimed: boolean;
  available: boolean;
  expiresAt?: number;
  requirement?: string;
}

const MOCK_REWARDS: Reward[] = [
  {
    id: 'daily-1',
    title: 'Daily Login Bonus',
    description: 'Login every day to claim',
    icon: <Calendar className="w-6 h-6" />,
    amount: '0.10',
    currency: 'usdc',
    type: 'daily',
    claimed: false,
    available: true,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  },
  {
    id: 'daily-spin',
    title: 'Free Spin',
    description: 'One free slot spin daily',
    icon: <span className="text-2xl">🎰</span>,
    amount: '1 Free Spin',
    currency: 'usdc',
    type: 'daily',
    claimed: false,
    available: true,
  },
  {
    id: 'weekly-1',
    title: 'Weekly Cashback',
    description: '5% of your weekly losses returned',
    icon: <Coins className="w-6 h-6" />,
    amount: '5%',
    currency: 'usdc',
    type: 'weekly',
    claimed: false,
    available: true,
    requirement: 'Wager $100+ this week',
  },
  {
    id: 'achievement-1',
    title: 'First Win',
    description: 'Win your first game',
    icon: <Trophy className="w-6 h-6" />,
    amount: '0.50',
    currency: 'usdc',
    type: 'achievement',
    claimed: true,
    available: true,
  },
  {
    id: 'achievement-2',
    title: 'High Roller',
    description: 'Place a bet of $100 or more',
    icon: <Star className="w-6 h-6" />,
    amount: '5.00',
    currency: 'usdc',
    type: 'achievement',
    claimed: false,
    available: false,
    requirement: 'Place a $100+ bet',
  },
  {
    id: 'vip-1',
    title: 'VIP Weekly Bonus',
    description: 'Exclusive VIP reward',
    icon: <Crown className="w-6 h-6" />,
    amount: '10.00',
    currency: 'usdc',
    type: 'vip',
    claimed: false,
    available: false,
    requirement: 'Reach Gold VIP tier',
  },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  daily: { label: 'Daily', color: 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/30' },
  weekly: { label: 'Weekly', color: 'text-[#2196F3] bg-[#2196F3]/10 border-[#2196F3]/30' },
  achievement: { label: 'Achievement', color: 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/30' },
  vip: { label: 'VIP', color: 'text-[#9C27B0] bg-[#9C27B0]/10 border-[#9C27B0]/30' },
};

export default function RewardsPage() {
  const { user, addBalance } = useUserStore();
  const { showToast } = useToast();
  const [rewards, setRewards] = useState(MOCK_REWARDS);
  const [claiming, setClaiming] = useState<string | null>(null);

  const handleClaim = async (reward: Reward) => {
    if (!user) {
      showToast('Please login to claim rewards', 'error');
      return;
    }

    if (reward.claimed || !reward.available) return;

    setClaiming(reward.id);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update reward state
    setRewards(prev => prev.map(r =>
      r.id === reward.id ? { ...r, claimed: true } : r
    ));

    // Add balance if it's a currency reward
    if (reward.amount.includes('.')) {
      const amount = parseFloat(reward.amount);
      addBalance(reward.currency, amount);
      showToast(`Claimed ${reward.amount} ${reward.currency.toUpperCase()}!`, 'success');
    } else {
      showToast(`Claimed: ${reward.title}!`, 'success');
    }

    setClaiming(null);
  };

  const formatTimeLeft = (expiresAt: number) => {
    const diff = expiresAt - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  const dailyRewards = rewards.filter(r => r.type === 'daily');
  const weeklyRewards = rewards.filter(r => r.type === 'weekly');
  const achievementRewards = rewards.filter(r => r.type === 'achievement');
  const vipRewards = rewards.filter(r => r.type === 'vip');

  const availableCount = rewards.filter(r => r.available && !r.claimed).length;

  const RewardCard = ({ reward }: { reward: Reward }) => (
    <motion.div
      whileHover={{ scale: reward.available && !reward.claimed ? 1.01 : 1 }}
      className={cn(
        "p-4 rounded-xl border transition-all",
        reward.claimed
          ? "bg-[#161616] border-[#2A2A2A] opacity-60"
          : reward.available
          ? "bg-gradient-to-br from-[#1A1500] to-[#161616] border-[#D4AF37]/30 hover:border-[#D4AF37]/50"
          : "bg-[#161616] border-[#2A2A2A]"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          reward.claimed
            ? "bg-[#2A2A2A] text-[#666666]"
            : reward.available
            ? "bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 text-[#D4AF37]"
            : "bg-[#2A2A2A] text-[#666666]"
        )}>
          {reward.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={cn(
              "font-semibold",
              reward.claimed ? "text-[#666666]" : "text-white"
            )}>
              {reward.title}
            </p>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium border",
              TYPE_LABELS[reward.type].color
            )}>
              {TYPE_LABELS[reward.type].label}
            </span>
          </div>
          <p className="text-xs text-[#666666] mb-2">{reward.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn(
                "text-lg font-bold",
                reward.claimed
                  ? "text-[#666666]"
                  : reward.available
                  ? "text-[#D4AF37]"
                  : "text-[#666666]"
              )}>
                {reward.amount.includes('.') ? `${reward.amount} ${reward.currency.toUpperCase()}` : reward.amount}
              </p>
              {reward.expiresAt && !reward.claimed && (
                <p className="text-[10px] text-[#A3A3A3] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeLeft(reward.expiresAt)}
                </p>
              )}
              {reward.requirement && !reward.claimed && !reward.available && (
                <p className="text-[10px] text-[#A3A3A3] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {reward.requirement}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClaim(reward)}
              disabled={reward.claimed || !reward.available || claiming === reward.id}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5",
                reward.claimed
                  ? "bg-[#2A2A2A] text-[#666666] cursor-not-allowed"
                  : reward.available
                  ? "bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black"
                  : "bg-[#2A2A2A] text-[#666666] cursor-not-allowed"
              )}
            >
              {claiming === reward.id ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : reward.claimed ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Claimed
                </>
              ) : reward.available ? (
                <>
                  <Gift className="w-4 h-4" />
                  Claim
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Locked
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-[#A3A3A3]" />
            </motion.div>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white font-display">Rewards & Bonuses</h1>
            <p className="text-xs text-[#666666]">{availableCount} rewards available</p>
          </div>
        </div>

        {/* Available Rewards Banner */}
        {availableCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500] p-5 mb-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.15)_0%,transparent_60%)] pointer-events-none" />
            <div className="absolute -right-4 -top-4 opacity-40">
              <span className="text-5xl animate-float">🎁</span>
            </div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-[0_0_20px_-5px_rgba(212,175,55,0.5)]">
                <Gift className="w-7 h-7 text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]">
                  {availableCount} Rewards
                </p>
                <p className="text-sm text-[#A3A3A3]">Ready to claim!</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Daily Rewards */}
        {dailyRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00C853]" />
              Daily Rewards
            </h3>
            <div className="space-y-3">
              {dailyRewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Weekly Rewards */}
        {weeklyRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#2196F3]" />
              Weekly Rewards
            </h3>
            <div className="space-y-3">
              {weeklyRewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        {achievementRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              Achievements
            </h3>
            <div className="space-y-3">
              {achievementRewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </motion.div>
        )}

        {/* VIP Rewards */}
        {vipRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#9C27B0]" />
              VIP Exclusive
            </h3>
            <div className="space-y-3">
              {vipRewards.map(reward => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
