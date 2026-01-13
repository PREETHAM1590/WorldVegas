'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, Gamepad2, Wallet, User, Trophy, Gift } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'games', label: 'Casino', icon: Gamepad2, path: '/games' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'rewards', label: 'Rewards', icon: Gift, path: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = tabs.find((tab) => {
    if (tab.path === '/') return pathname === '/';
    return pathname.startsWith(tab.path);
  })?.id || 'home';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-area-bottom pointer-events-none">
      <nav
        className={cn(
          'flex items-center justify-around',
          'h-[72px] px-2',
          // Premium dark glass background
          'bg-[#0A0A0A]/95 backdrop-blur-2xl',
          // Gold accent border
          'border border-[#D4AF37]/20',
          'rounded-2xl',
          // Premium shadow with gold glow
          'shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.6),0_0_20px_-10px_rgba(212,175,55,0.15)]',
          'pointer-events-auto'
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'w-16 h-14 rounded-xl',
                'transition-all duration-300'
              )}
            >
              {/* Active Background with gold gradient */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={cn(
                      'absolute inset-1 rounded-xl',
                      'bg-gradient-to-b from-[#D4AF37]/15 to-[#D4AF37]/5',
                      'border border-[#D4AF37]/20'
                    )}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Active glow indicator */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37]"
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative z-10"
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive
                      ? 'text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                      : 'text-[#666666]'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.6,
                }}
                className={cn(
                  'text-[10px] font-semibold mt-1 transition-all duration-300 relative z-10',
                  isActive ? 'text-[#D4AF37]' : 'text-[#666666]'
                )}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
