'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Premium 3D-style game icon wrapper
function IconWrapper({
  children,
  gradient,
  glow,
  size = 'md',
  className
}: {
  children: React.ReactNode;
  gradient: string;
  glow: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={cn(
      sizes[size],
      'relative rounded-2xl overflow-hidden',
      'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]',
      className
    )}>
      {/* Base gradient */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

      {/* Glow effect */}
      <div className={cn('absolute inset-0 opacity-40', glow)} />

      {/* Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        {children}
      </div>

      {/* Shine effect */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-2xl" />
    </div>
  );
}

// Slots Icon - Classic slot machine reels
export function SlotsIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const iconSize = size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : 'text-4xl';

  return (
    <IconWrapper
      gradient="from-purple-600 via-pink-600 to-red-500"
      glow="bg-gradient-to-br from-purple-400/30 to-pink-400/30"
      size={size}
    >
      <div className="flex flex-col items-center">
        {/* Mini slot reels */}
        <div className="flex gap-0.5">
          {['7', '7', '7'].map((symbol, i) => (
            <motion.div
              key={i}
              className={cn(
                'flex items-center justify-center rounded',
                'bg-gradient-to-b from-red-500 to-red-700',
                'border border-yellow-400/50',
                size === 'sm' ? 'w-3 h-4 text-[8px]' : size === 'md' ? 'w-4 h-5 text-[10px]' : 'w-6 h-7 text-xs'
              )}
              initial={{ y: -2 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ delay: i * 0.1, duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <span className="font-black text-yellow-400 drop-shadow-md">{symbol}</span>
            </motion.div>
          ))}
        </div>
        <div className={cn(
          'mt-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600',
          size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
        )} />
      </div>
    </IconWrapper>
  );
}

// Blackjack Icon - Playing cards
export function BlackjackIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <IconWrapper
      gradient="from-green-700 via-emerald-600 to-teal-500"
      glow="bg-gradient-to-br from-emerald-400/30 to-green-400/30"
      size={size}
    >
      <div className="relative">
        {/* Back card (Ace) */}
        <motion.div
          className={cn(
            'absolute bg-white rounded shadow-lg flex items-center justify-center',
            size === 'sm' ? 'w-5 h-7 -left-1 -top-1' : size === 'md' ? 'w-7 h-9 -left-2 -top-1' : 'w-10 h-14 -left-3 -top-2'
          )}
          style={{ transform: 'rotate(-15deg)' }}
        >
          <span className={cn('font-black text-red-600', size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg')}>A</span>
          <span className={cn('absolute text-red-600', size === 'sm' ? 'text-[8px] top-0.5 left-0.5' : 'text-xs top-1 left-1')}>♥</span>
        </motion.div>

        {/* Front card (King) */}
        <motion.div
          className={cn(
            'relative bg-white rounded shadow-lg flex items-center justify-center',
            size === 'sm' ? 'w-5 h-7' : size === 'md' ? 'w-7 h-9' : 'w-10 h-14'
          )}
          style={{ transform: 'rotate(10deg)' }}
          animate={{ rotate: [10, 12, 10] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className={cn('font-black text-gray-800', size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-lg')}>K</span>
          <span className={cn('absolute text-gray-800', size === 'sm' ? 'text-[8px] top-0.5 left-0.5' : 'text-xs top-1 left-1')}>♠</span>
        </motion.div>
      </div>
    </IconWrapper>
  );
}

// Aviator Icon - Airplane
export function AviatorIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <IconWrapper
      gradient="from-red-600 via-orange-500 to-yellow-500"
      glow="bg-gradient-to-br from-orange-400/30 to-red-400/30"
      size={size}
    >
      <motion.div
        className="relative"
        animate={{
          y: [0, -3, 0],
          rotate: [-5, 5, -5]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Plane body */}
        <div className={cn(
          'bg-gradient-to-r from-white via-gray-100 to-gray-200 rounded-full shadow-lg',
          size === 'sm' ? 'w-6 h-2' : size === 'md' ? 'w-8 h-3' : 'w-12 h-4'
        )} />

        {/* Wing */}
        <div className={cn(
          'absolute bg-gradient-to-b from-gray-300 to-gray-500 rounded',
          size === 'sm' ? 'w-4 h-1 -top-1 left-1' : size === 'md' ? 'w-5 h-1.5 -top-1 left-1.5' : 'w-8 h-2 -top-2 left-2'
        )}
          style={{ transform: 'skewX(-20deg)' }}
        />

        {/* Tail */}
        <div className={cn(
          'absolute bg-gradient-to-b from-red-400 to-red-600 rounded',
          size === 'sm' ? 'w-1 h-2 -top-1 -left-0.5' : size === 'md' ? 'w-1.5 h-3 -top-2 -left-0.5' : 'w-2 h-4 -top-3 -left-1'
        )} />

        {/* Trail effect */}
        <motion.div
          className={cn(
            'absolute bg-gradient-to-l from-white/60 to-transparent rounded-full',
            size === 'sm' ? 'w-4 h-0.5 top-1 -left-4' : size === 'md' ? 'w-6 h-1 top-1 -left-6' : 'w-10 h-1 top-1.5 -left-10'
          )}
          animate={{ opacity: [0.3, 0.6, 0.3], scaleX: [0.8, 1, 0.8] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </motion.div>
    </IconWrapper>
  );
}

// Coin Flip Icon - 3D Coin
export function CoinFlipIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <IconWrapper
      gradient="from-yellow-500 via-amber-500 to-orange-500"
      glow="bg-gradient-to-br from-yellow-400/30 to-amber-400/30"
      size={size}
    >
      <motion.div
        className="relative"
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Coin */}
        <div className={cn(
          'rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600',
          'border-2 border-yellow-300/50 shadow-lg',
          size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
        )}>
          {/* Inner ring */}
          <div className={cn(
            'absolute inset-1 rounded-full border border-yellow-500/40'
          )} />

          {/* Crown symbol */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'drop-shadow-md',
              size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-2xl'
            )}>👑</span>
          </div>

          {/* Shine */}
          <div className="absolute top-1 left-1 w-1/3 h-1/4 bg-white/40 rounded-full blur-sm" />
        </div>
      </motion.div>
    </IconWrapper>
  );
}

// Dice Icon - 3D Dice
export function DiceIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <IconWrapper
      gradient="from-emerald-600 via-green-500 to-lime-500"
      glow="bg-gradient-to-br from-green-400/30 to-emerald-400/30"
      size={size}
    >
      <motion.div
        className="relative"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Dice body */}
        <div className={cn(
          'bg-white rounded-lg shadow-lg relative',
          size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
        )}>
          {/* Dots pattern (showing 6) */}
          <div className={cn(
            'absolute inset-0 grid grid-cols-2 gap-0.5 p-1',
            size === 'lg' && 'p-2 gap-1'
          )}>
            {[1, 2, 3, 4, 5, 6].map((dot) => (
              <div
                key={dot}
                className={cn(
                  'rounded-full bg-gradient-to-br from-gray-700 to-gray-900',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2'
                )}
              />
            ))}
          </div>

          {/* 3D edge effect */}
          <div className="absolute -right-0.5 top-0.5 bottom-0.5 w-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-r" />
          <div className="absolute left-0.5 right-0.5 -bottom-0.5 h-1 bg-gradient-to-b from-gray-200 to-gray-300 rounded-b" />
        </div>
      </motion.div>
    </IconWrapper>
  );
}

// Roulette Icon - Spinning wheel
export function RouletteIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <IconWrapper
      gradient="from-red-700 via-red-600 to-black"
      glow="bg-gradient-to-br from-red-400/30 to-black/30"
      size={size}
    >
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        {/* Wheel */}
        <div className={cn(
          'rounded-full bg-gradient-to-br from-amber-800 via-yellow-900 to-amber-950 border-2 border-yellow-600/50 relative overflow-hidden',
          size === 'sm' ? 'w-7 h-7' : size === 'md' ? 'w-9 h-9' : 'w-14 h-14'
        )}>
          {/* Wheel segments */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'absolute top-1/2 left-1/2 h-1/2 w-0.5',
                i % 2 === 0 ? 'bg-red-600' : 'bg-black'
              )}
              style={{
                transformOrigin: 'center top',
                transform: `translateX(-50%) rotate(${i * 45}deg)`
              }}
            />
          ))}

          {/* Center hub */}
          <div className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border border-yellow-300',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </div>

        {/* Ball marker (static) */}
        <motion.div
          className={cn(
            'absolute bg-white rounded-full shadow-lg',
            size === 'sm' ? 'w-1 h-1 top-0.5 left-1/2 -translate-x-1/2' :
            size === 'md' ? 'w-1.5 h-1.5 top-0.5 left-1/2 -translate-x-1/2' :
            'w-2 h-2 top-1 left-1/2 -translate-x-1/2'
          )}
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </IconWrapper>
  );
}

// Mines Icon - Diamond grid
export function MinesIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <IconWrapper
      gradient="from-blue-600 via-purple-600 to-pink-600"
      glow="bg-gradient-to-br from-blue-400/30 to-purple-400/30"
      size={size}
    >
      <div className={cn(
        'grid gap-0.5',
        size === 'sm' ? 'grid-cols-2' : 'grid-cols-3'
      )}>
        {Array.from({ length: size === 'sm' ? 4 : 9 }).map((_, i) => {
          const isDiamond = [0, 4, 8].includes(i);
          const isMine = i === 6;

          return (
            <motion.div
              key={i}
              className={cn(
                'rounded flex items-center justify-center',
                isDiamond
                  ? 'bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600'
                  : isMine
                    ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-700'
                    : 'bg-gray-600/50',
                size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3 h-3'
              )}
              animate={isDiamond ? {
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            >
              {isDiamond && (
                <span className={cn(
                  size === 'sm' ? 'text-[6px]' : size === 'md' ? 'text-[8px]' : 'text-xs'
                )}>💎</span>
              )}
              {isMine && (
                <span className={cn(
                  size === 'sm' ? 'text-[6px]' : size === 'md' ? 'text-[8px]' : 'text-xs'
                )}>💣</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </IconWrapper>
  );
}

// Export a map for easy access
export const GameIconMap: Record<string, React.FC<{ size?: 'sm' | 'md' | 'lg' }>> = {
  slots: SlotsIcon,
  blackjack: BlackjackIcon,
  aviator: AviatorIcon,
  coinflip: CoinFlipIcon,
  dice: DiceIcon,
  roulette: RouletteIcon,
  mines: MinesIcon
};

// Helper component to get icon by game ID
export function GameIcon({ gameId, size = 'md' }: { gameId: string; size?: 'sm' | 'md' | 'lg' }) {
  const IconComponent = GameIconMap[gameId];
  if (!IconComponent) {
    return (
      <IconWrapper
        gradient="from-gray-600 to-gray-800"
        glow="bg-gray-400/20"
        size={size}
      >
        <span className="text-2xl">🎮</span>
      </IconWrapper>
    );
  }
  return <IconComponent size={size} />;
}
