'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Gamepad2, Wallet, User, Gift } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useReducedMotion, quickTransition } from '@/hooks/useAnimation';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'games', label: 'Casino', icon: Gamepad2, path: '/games' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'rewards', label: 'Rewards', icon: Gift, path: '/leaderboard' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

// Optimized transition for GPU acceleration
const tabTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.5,
};

const noMotionTransition = { duration: 0 };

// Memoized tab button for performance
const TabButton = memo(function TabButton({
  tab,
  isActive,
  onClick,
  prefersReducedMotion,
}: {
  tab: typeof tabs[0];
  isActive: boolean;
  onClick: () => void;
  prefersReducedMotion: boolean;
}) {
  const Icon = tab.icon;
  const transition = prefersReducedMotion ? noMotionTransition : tabTransition;

  return (
    <motion.button
      onClick={onClick}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'w-16 h-14 rounded-xl',
        'gpu-accelerated',
        'touch-manipulation' // Improves touch responsiveness
      )}
      style={{ willChange: 'transform' }}
    >
      {/* Active Background with gold gradient */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className={cn(
              'absolute inset-1 rounded-xl',
              'bg-gradient-to-b from-[#D4AF37]/15 to-[#D4AF37]/5',
              'border border-[#D4AF37]/20',
              'gpu-layer'
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={transition}
          />
        )}
      </AnimatePresence>

      {/* Active glow indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? noMotionTransition : { duration: 0.2 }}
          className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37]"
        />
      )}

      {/* Icon - CSS transitions for better performance */}
      <div
        className={cn(
          'relative z-10 smooth-transform',
          isActive && 'scale-110 -translate-y-0.5'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5 smooth-transition',
            isActive
              ? 'text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
              : 'text-[#666666]'
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />
      </div>

      {/* Label - CSS transitions for better performance */}
      <span
        className={cn(
          'text-[10px] font-semibold mt-1 relative z-10 smooth-opacity',
          isActive ? 'text-[#D4AF37] opacity-100' : 'text-[#666666] opacity-60'
        )}
      >
        {tab.label}
      </span>
    </motion.button>
  );
});

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const activeTab = tabs.find((tab) => {
    if (tab.path === '/') return pathname === '/';
    return pathname.startsWith(tab.path);
  })?.id || 'home';

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 safe-area-bottom pointer-events-none">
      <nav
        className={cn(
          'flex items-center justify-around',
          'h-[72px] px-2',
          // Premium dark glass background with GPU acceleration
          'bg-[#0A0A0A]/95 backdrop-blur-2xl',
          // Gold accent border
          'border border-[#D4AF37]/20',
          'rounded-2xl',
          // Premium shadow with gold glow
          'shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.6),0_0_20px_-10px_rgba(212,175,55,0.15)]',
          'pointer-events-auto',
          'gpu-layer contain-layout'
        )}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => handleNavigation(tab.path)}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </nav>
    </div>
  );
});
