'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, Gamepad2, Wallet, User, TrendingUp } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'games', label: 'Games', icon: Gamepad2, path: '/games' },
  { id: 'markets', label: 'Markets', icon: TrendingUp, path: '/markets' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
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
          'h-16 px-2',
          'bg-dark-card/90 backdrop-blur-2xl',
          'border border-white/[0.06]',
          'rounded-2xl',
          'shadow-soft-xl',
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
                'w-14 h-12 rounded-xl',
                'transition-colors duration-200'
              )}
            >
              {/* Active Background */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-1 bg-primary-500/10 rounded-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? -1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative z-10"
              >
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    isActive ? 'text-primary-400' : 'text-white/40'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.5,
                }}
                className={cn(
                  'text-2xs font-medium mt-1 transition-colors duration-200 relative z-10',
                  isActive ? 'text-primary-400' : 'text-white/40'
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
