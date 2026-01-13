'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Spade, Plane, Coins, Dice1, CircleDot, Bomb, Star, Trophy, TrendingUp, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PracticeModeToggle, PracticeModeIndicator } from '@/components/ui/PracticeMode';
import { VIPHeroCard } from '@/components/ui/HeroCard';
import { GameCard, GameCardCompact } from '@/components/ui/GameCard';
import { CategoryPills, CASINO_CATEGORIES } from '@/components/ui/CategoryPills';
import { DailyRaceCountdown } from '@/components/ui/CountdownTimer';
import { LeaderboardMini } from '@/components/ui/Leaderboard';
import { GameIcon } from '@/components/ui/GameIcons';
import { cn } from '@/lib/utils';

// Game data with casino-style metadata and real cover images
const ORIGINALS = [
  {
    id: 'slots',
    name: 'Lucky Slots',
    provider: 'WorldVegas Originals',
    href: '/games/slots',
    isHot: true,
    emoji: '🎰',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop',
    gradient: 'from-purple-600 via-pink-600 to-red-500',
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    provider: 'WorldVegas Originals',
    href: '/games/blackjack',
    isNew: false,
    emoji: '🃏',
    thumbnail: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?w=400&h=300&fit=crop',
    gradient: 'from-green-700 via-emerald-600 to-teal-500',
  },
  {
    id: 'aviator',
    name: 'Aviator',
    provider: 'WorldVegas Originals',
    href: '/games/aviator',
    isHot: true,
    emoji: '✈️',
    thumbnail: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=400&h=300&fit=crop',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
  },
  {
    id: 'coinflip',
    name: 'Coin Flip',
    provider: 'WorldVegas Originals',
    href: '/games/coinflip',
    emoji: '🪙',
    thumbnail: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=300&fit=crop',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
  },
  {
    id: 'dice',
    name: 'Dice',
    provider: 'WorldVegas Originals',
    href: '/games/dice',
    emoji: '🎲',
    thumbnail: 'https://images.unsplash.com/photo-1522069213448-443a614da9b6?w=400&h=300&fit=crop',
    gradient: 'from-emerald-600 via-green-500 to-lime-500',
  },
  {
    id: 'roulette',
    name: 'Roulette',
    provider: 'WorldVegas Originals',
    href: '/games/roulette',
    isHot: true,
    emoji: '🎡',
    thumbnail: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=400&h=300&fit=crop',
    gradient: 'from-red-700 via-red-600 to-black',
  },
  {
    id: 'mines',
    name: 'Mines',
    provider: 'WorldVegas Originals',
    href: '/games/mines',
    isNew: true,
    emoji: '💎',
    thumbnail: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400&h=300&fit=crop',
    gradient: 'from-blue-600 via-purple-600 to-pink-600',
  },
];

// Mock leaderboard data
const LEADERBOARD_DATA = [
  { rank: 1, username: 'CryptoKing', prize: 5000, wagered: 125000 },
  { rank: 2, username: 'LuckyAce', prize: 2500, wagered: 98000 },
  { rank: 3, username: 'DiamondHands', prize: 1000, wagered: 75000 },
  { rank: 4, username: 'MoonBet', prize: 500, wagered: 50000 },
  { rank: 5, username: 'GoldRush', prize: 250, wagered: 35000 },
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
          className="text-[#D4AF37] text-sm font-medium hover:underline"
        >
          View All
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

export default function GamesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter games based on category and search
  const filteredGames = ORIGINALS.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' ||
      (activeCategory === 'originals') ||
      (activeCategory === 'slots' && game.id === 'slots') ||
      (activeCategory === 'crash' && game.id === 'aviator') ||
      (activeCategory === 'table' && ['blackjack', 'roulette'].includes(game.id));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
      <PracticeModeIndicator />
      <Header />

      {/* Main Content */}
      <div className="flex-1 pb-28">
        {/* Search Bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-12 pr-4 py-3.5 rounded-xl',
                'bg-[#161616] border border-[#2A2A2A]',
                'text-white placeholder-[#666666]',
                'focus:outline-none focus:border-[#D4AF37]/50',
                'transition-colors duration-200'
              )}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-3">
          <CategoryPills
            categories={CASINO_CATEGORIES}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* Practice Mode Toggle */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-white">Practice Mode</span>
            </div>
            <PracticeModeToggle />
          </div>
        </div>

        {/* VIP Hero Card */}
        <div className="px-4 mb-6">
          <VIPHeroCard />
        </div>

        {/* Originals Section - Horizontal Scroll */}
        <section className="mb-6">
          <div className="px-4">
            <SectionHeader title="WorldVegas Originals" icon={Star} />
          </div>
          <HorizontalScroll>
            {ORIGINALS.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0"
              >
                <div
                  onClick={() => router.push(game.href)}
                  className={cn(
                    'relative overflow-hidden rounded-xl cursor-pointer',
                    'w-[140px] aspect-[3/4] flex-shrink-0',
                    'bg-[#161616] border border-[#2A2A2A]',
                    'hover:border-[#D4AF37]/30',
                    'transition-all duration-200',
                    'group'
                  )}
                >
                  {/* Game Cover Image with Gradient Fallback */}
                  <div className="absolute inset-0">
                    {game.thumbnail ? (
                      <>
                        <Image
                          src={game.thumbnail}
                          alt={game.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* Color overlay matching game theme */}
                        <div className={cn(
                          'absolute inset-0 bg-gradient-to-br opacity-60',
                          game.gradient
                        )} />
                      </>
                    ) : (
                      <div className={cn(
                        'w-full h-full bg-gradient-to-br',
                        game.gradient || 'from-[#1A1A1A] via-[#252525] to-[#1A1A1A]'
                      )} />
                    )}
                    {/* Premium Game Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <GameIcon gameId={game.id} size="md" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Hot Badge */}
                  {game.isHot && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase shadow-lg">
                        HOT
                      </span>
                    </div>
                  )}

                  {/* New Badge */}
                  {game.isNew && (
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#00E701] to-[#00C301] text-black text-[10px] font-bold uppercase">
                        New
                      </span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <h4 className="font-semibold text-white text-xs truncate group-hover:text-[#D4AF37] transition-colors">
                      {game.name}
                    </h4>
                  </div>

                  {/* Hover Glow */}
                  <motion.div
                    className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/5 transition-colors duration-300"
                  />
                </div>
              </motion.div>
            ))}
          </HorizontalScroll>
        </section>

        {/* Daily Race Countdown */}
        <div className="px-4 mb-6">
          <DailyRaceCountdown />
        </div>

        {/* All Games Grid */}
        <section className="px-4 mb-6">
          <SectionHeader title="All Games" icon={Sparkles} showViewAll={false} />
          <div className="grid grid-cols-2 gap-3">
            {filteredGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(game.href)}
                className={cn(
                  'relative overflow-hidden rounded-2xl cursor-pointer',
                  'bg-[#161616] border border-[#2A2A2A]',
                  'hover:border-[#D4AF37]/30 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-10px_rgba(212,175,55,0.3)]',
                  'transition-all duration-300',
                  'group'
                )}
              >
                {/* Game Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {game.thumbnail ? (
                    <>
                      <Image
                        src={game.thumbnail}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        unoptimized
                      />
                      {/* Color overlay matching game theme */}
                      <div className={cn(
                        'absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-30 transition-opacity',
                        game.gradient
                      )} />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
                      <GameIcon gameId={game.id} size="lg" />
                    </div>
                  )}

                  {/* Premium Game Icon overlay on image */}
                  {game.thumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <GameIcon gameId={game.id} size="lg" />
                      </motion.div>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                      className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.5)]"
                    >
                      <span className="text-black text-lg ml-0.5">▶</span>
                    </motion.div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {game.isHot && (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase shadow-lg">
                        HOT
                      </span>
                    )}
                    {game.isNew && (
                      <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#00E701] to-[#00C301] text-black text-[10px] font-bold uppercase">
                        New
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h4 className="font-semibold text-white text-sm truncate group-hover:text-[#D4AF37] transition-colors">
                    {game.name}
                  </h4>
                  <p className="text-[11px] text-[#666666] truncate mt-0.5">
                    {game.provider}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section className="px-4 mb-6">
          <SectionHeader title="Top Players" icon={Trophy} />
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
              <p className="text-lg font-bold text-white">7</p>
              <p className="text-[10px] text-[#666666] uppercase">Games</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl bg-gradient-to-br from-[#1A1500] to-[#0A0A0A] border border-[#D4AF37]/20 text-center"
            >
              <Zap className="w-5 h-5 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">100x</p>
              <p className="text-[10px] text-[#666666] uppercase">Max Win</p>
            </motion.div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="px-4 mb-6">
          <SectionHeader title="Coming Soon" icon={Sparkles} showViewAll={false} />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] opacity-60"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#2A2A2A] flex items-center justify-center">
                <span className="text-3xl">🎲</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Poker</h3>
                <p className="text-sm text-[#666666]">Texas Hold&apos;em coming soon</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 rounded-full bg-[#2A2A2A] text-[#666666] text-xs font-medium">
                  Soon
                </span>
              </div>
            </div>
          </motion.div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
