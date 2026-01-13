'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Sparkles, Spade } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { GameCard } from '@/components/ui/Card';

const games = [
  {
    id: 'slots',
    title: 'Lucky Slots',
    description: 'Spin the reels for up to 100x multiplier',
    icon: <Sparkles className="w-7 h-7 text-gold-400" />,
    gradient: 'bg-gradient-to-br from-gold-500/30 to-gold-700/20',
    path: '/games/slots',
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Classic 21 - Beat the dealer',
    icon: <Spade className="w-7 h-7 text-teal-400" />,
    gradient: 'bg-gradient-to-br from-teal-500/30 to-teal-700/20',
    path: '/games/blackjack',
  },
];

export default function GamesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-1">Games</h1>
          <p className="text-white/60 text-sm">Choose your game and start winning</p>
        </motion.div>

        <div className="grid gap-4">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GameCard
                title={game.title}
                description={game.description}
                icon={game.icon}
                gradient={game.gradient}
                onClick={() => router.push(game.path)}
              />
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold mb-4 text-white/50">Coming Soon</h2>
          <div className="glass-card rounded-xl p-4 opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white/30" />
              </div>
              <div>
                <h3 className="font-semibold text-white/60">Poker</h3>
                <p className="text-sm text-white/40">Texas Hold&apos;em coming soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
