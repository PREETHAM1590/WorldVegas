'use client';

import { motion } from 'framer-motion';
import { Gamepad2, TrendingUp, Sparkles, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { GameCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { useWorldAuth } from '@/hooks/useWorldAuth';

const games = [
  {
    id: 'slots',
    title: 'Lucky Slots',
    description: 'Spin to win up to 100x',
    icon: <Sparkles className="w-7 h-7 text-gold-400" />,
    gradient: 'bg-gradient-to-br from-gold-500/30 to-gold-700/20',
    path: '/games/slots',
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Beat the dealer to 21',
    icon: <Gamepad2 className="w-7 h-7 text-teal-400" />,
    gradient: 'bg-gradient-to-br from-teal-500/30 to-teal-700/20',
    path: '/games/blackjack',
  },
  {
    id: 'markets',
    title: 'Predictions',
    description: 'Bet on real-world events',
    icon: <TrendingUp className="w-7 h-7 text-primary-400" />,
    gradient: 'bg-gradient-to-br from-primary-500/30 to-primary-700/20',
    path: '/markets',
  },
];

const features = [
  {
    icon: <Shield className="w-5 h-5 text-teal-400" />,
    title: 'Provably Fair',
    description: 'Verify every outcome on-chain',
  },
  {
    icon: <Zap className="w-5 h-5 text-gold-400" />,
    title: 'Instant Payouts',
    description: 'Win and withdraw instantly',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useUserStore();
  const { signInWithWorldID } = useWorldAuth();

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary-400 via-gold-400 to-teal-400 bg-clip-text text-transparent">
              WorldVegas
            </span>
          </h1>
          <p className="text-white/60 text-sm">
            The first provably fair casino for World App
          </p>
        </motion.div>

        {/* Auth Section */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Verify You&apos;re Human</h2>
              <p className="text-white/60 text-sm mb-4">
                Sign in with World ID to ensure fair play for everyone
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={signInWithWorldID}
                isLoading={isLoading}
                className="w-full"
              >
                Sign in with World ID
              </Button>
            </div>
          </motion.div>
        )}

        {/* Games Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold mb-4">Popular Games</h2>
          <div className="grid gap-4">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
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
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-bold mb-4">Why WorldVegas?</h2>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4"
              >
                <div className="mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-white/50">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
