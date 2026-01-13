'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Star, Trophy, TrendingUp, Sparkles, ChevronRight, Gift, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Button } from '@/components/ui/Button';
import { useUserStore, useHasHydrated } from '@/stores/userStore';
import { useWorldAuth } from '@/hooks/useWorldAuth';
import { WelcomeHeroCard, VIPHeroCard } from '@/components/ui/HeroCard';
import { DailyRaceCountdown } from '@/components/ui/CountdownTimer';
import { LeaderboardMini } from '@/components/ui/Leaderboard';
import { cn } from '@/lib/utils';

// Featured games for horizontal scroll
const FEATURED_GAMES = [
  { id: 'slots', name: 'Lucky Slots', emoji: '🎰', href: '/games/slots', isHot: true },
  { id: 'blackjack', name: 'Blackjack', emoji: '🃏', href: '/games/blackjack' },
  { id: 'aviator', name: 'Aviator', emoji: '✈️', href: '/games/aviator', isHot: true },
  { id: 'roulette', name: 'Roulette', emoji: '🎡', href: '/games/roulette' },
  { id: 'coinflip', name: 'Coin Flip', emoji: '🪙', href: '/games/coinflip' },
  { id: 'dice', name: 'Dice', emoji: '🎲', href: '/games/dice' },
  { id: 'mines', name: 'Mines', emoji: '💎', href: '/games/mines', isNew: true },
];

// Mock leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, username: 'CryptoKing', prize: 5000, wagered: 125000 },
  { rank: 2, username: 'LuckyAce', prize: 2500, wagered: 98000 },
  { rank: 3, username: 'DiamondHands', prize: 1000, wagered: 75000 },
  { rank: 4, username: 'MoonBet', prize: 500, wagered: 50000 },
  { rank: 5, username: 'GoldRush', prize: 250, wagered: 35000 },
];

// Features data
const FEATURES = [
  {
    icon: Shield,
    title: 'Provably Fair',
    description: 'Verify every outcome on-chain',
    gradient: 'from-emerald-500/20 to-emerald-700/10',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    description: 'Win and withdraw instantly',
    gradient: 'from-[#D4AF37]/20 to-[#B8860B]/10',
    iconColor: 'text-[#D4AF37]',
  },
  {
    icon: Crown,
    title: 'VIP Rewards',
    description: 'Exclusive bonuses & perks',
    gradient: 'from-purple-500/20 to-purple-700/10',
    iconColor: 'text-purple-400',
  },
  {
    icon: Gift,
    title: 'Daily Bonuses',
    description: 'Free spins & deposit matches',
    gradient: 'from-pink-500/20 to-pink-700/10',
    iconColor: 'text-pink-400',
  },
];

// Section header component
function SectionHeader({
  title,
  icon: Icon,
  showViewAll = true,
  onViewAll
}: {
  title: string;
  icon?: React.ElementType;
  showViewAll?: boolean;
  onViewAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-[#D4AF37]" />}
        <h2 className="text-lg font-bold text-white font-display">{title}</h2>
      </div>
      {showViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[#D4AF37] text-sm font-medium hover:underline"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Horizontal scroll container
function HorizontalScroll({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2',
      className
    )}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useUserStore();
  const { signInWithWorldID } = useWorldAuth();
  const hasHydrated = useHasHydrated();

  // Don't show auth section until hydration is complete
  const showAuthSection = hasHydrated && !user;

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <Header />

      <div className="flex-1 pb-28">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pt-6 pb-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <Image
              src="/logo.svg"
              alt="WorldVegas"
              width={80}
              height={80}
              className="drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]"
              priority
            />
          </motion.div>
          {/* Show different message based on login status */}
          {hasHydrated && user ? (
            <>
              <h1 className="text-3xl font-bold mb-2 font-display">
                Welcome back,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#D4AF37]">
                  Player
                </span>
              </h1>
              <p className="text-[#A3A3A3] text-sm">
                Ready to win big today?
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2 font-display">
                Welcome to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#D4AF37]">
                  WorldVegas
                </span>
              </h1>
              <p className="text-[#A3A3A3] text-sm">
                The first provably fair casino for World App
              </p>
            </>
          )}
        </motion.div>

        {/* Auth Section - Show when not logged in AND hydrated */}
        {showAuthSection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-4 mb-6"
          >
            <div className={cn(
              'relative overflow-hidden rounded-2xl p-6 text-center',
              'bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500]',
              'border border-[#D4AF37]/30',
              'shadow-[0_0_40px_-10px_rgba(212,175,55,0.3)]'
            )}>
              {/* Decorative glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15)_0%,transparent_60%)] pointer-events-none" />

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  <Shield className="w-10 h-10 text-black" />
                </motion.div>
                <h2 className="text-xl font-bold mb-2 text-white">Verify You&apos;re Human</h2>
                <p className="text-[#A3A3A3] text-sm mb-5">
                  Sign in with World ID to ensure fair play for everyone
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={signInWithWorldID}
                  isLoading={isLoading}
                  className={cn(
                    'w-full py-4 rounded-xl font-semibold',
                    'bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37]',
                    'text-black border-none',
                    'hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]',
                    'transition-all duration-300'
                  )}
                >
                  Sign in with World ID
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Welcome Bonus Card - Show when logged in */}
        {user && (
          <div className="px-4 mb-6">
            <WelcomeHeroCard />
          </div>
        )}

        {/* Featured Games Horizontal Scroll */}
        <section className="mb-6">
          <div className="px-4">
            <SectionHeader
              title="Featured Games"
              icon={Star}
              onViewAll={() => router.push('/games')}
            />
          </div>
          <HorizontalScroll>
            {FEATURED_GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(game.href)}
                className={cn(
                  'relative overflow-hidden rounded-xl cursor-pointer',
                  'w-[120px] aspect-square flex-shrink-0',
                  'bg-gradient-to-br from-[#1A1A1A] via-[#252525] to-[#1A1A1A]',
                  'border border-[#2A2A2A]',
                  'hover:border-[#D4AF37]/30 hover:scale-105',
                  'transition-all duration-200',
                  'group'
                )}
              >
                {/* Game Emoji */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-4xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {game.emoji}
                  </motion.span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badges */}
                {game.isHot && (
                  <div className="absolute top-2 right-2">
                    <span className="text-sm">🔥</span>
                  </div>
                )}
                {game.isNew && (
                  <div className="absolute top-2 left-2">
                    <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-[#00E701] to-[#00C301] text-black text-[8px] font-bold uppercase">
                      New
                    </span>
                  </div>
                )}

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                  <h4 className="font-semibold text-white text-xs truncate group-hover:text-[#D4AF37] transition-colors">
                    {game.name}
                  </h4>
                </div>
              </motion.div>
            ))}
          </HorizontalScroll>
        </section>

        {/* Daily Race Countdown */}
        <div className="px-4 mb-6">
          <DailyRaceCountdown />
        </div>

        {/* VIP Hero Card */}
        <div className="px-4 mb-6">
          <VIPHeroCard />
        </div>

        {/* Top Players Leaderboard */}
        <section className="px-4 mb-6">
          <SectionHeader
            title="Top Players"
            icon={Trophy}
            onViewAll={() => router.push('/leaderboard')}
          />
          <div className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A]">
            <LeaderboardMini players={LEADERBOARD_DATA} />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#1A1500] to-[#0A0A0A] border border-[#D4AF37]/20 text-center"
            >
              <TrendingUp className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">$25K</p>
              <p className="text-[10px] text-[#666666] uppercase">Daily Pool</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#1A1500] to-[#0A0A0A] border border-[#D4AF37]/20 text-center"
            >
              <Star className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">1.2K</p>
              <p className="text-[10px] text-[#666666] uppercase">Players</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#1A1500] to-[#0A0A0A] border border-[#D4AF37]/20 text-center"
            >
              <Zap className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">$89K</p>
              <p className="text-[10px] text-[#666666] uppercase">Won Today</p>
            </motion.div>
          </div>
        </section>

        {/* Why WorldVegas - Features Grid */}
        <section className="px-4 mb-6">
          <SectionHeader title="Why WorldVegas?" icon={Sparkles} showViewAll={false} />
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'p-4 rounded-xl',
                  'bg-[#161616] border border-[#2A2A2A]',
                  'hover:border-[#D4AF37]/30',
                  'transition-all duration-200'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                  `bg-gradient-to-br ${feature.gradient}`
                )}>
                  <feature.icon className={cn('w-5 h-5', feature.iconColor)} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-[#666666]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={cn(
              'relative overflow-hidden rounded-2xl p-6',
              'bg-gradient-to-br from-[#D4AF37]/20 via-[#1A1A1A] to-[#1A1A1A]',
              'border border-[#D4AF37]/30'
            )}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />

            <div className="relative z-10 text-center">
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                Ready to <span className="text-[#D4AF37]">Win Big</span>?
              </h3>
              <p className="text-[#A3A3A3] text-sm mb-4">
                Join thousands of players winning every day
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/games')}
                className={cn(
                  'inline-flex items-center gap-2 px-8 py-3 rounded-xl',
                  'bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37]',
                  'text-black font-semibold',
                  'shadow-[0_0_20px_rgba(212,175,55,0.3)]',
                  'hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]',
                  'transition-all duration-300'
                )}
              >
                Play Now
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
