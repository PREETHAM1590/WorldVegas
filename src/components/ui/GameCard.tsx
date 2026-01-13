'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GameCardProps {
  id: string;
  name: string;
  provider?: string;
  thumbnail?: string;
  href: string;
  isHot?: boolean;
  isNew?: boolean;
  isLive?: boolean;
  className?: string;
}

export function GameCard({
  id,
  name,
  provider,
  thumbnail,
  href,
  isHot,
  isNew,
  isLive,
  className,
}: GameCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative overflow-hidden rounded-2xl cursor-pointer',
          'bg-[#161616] border border-[#2A2A2A]',
          'hover:border-[#D4AF37]/30 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-10px_rgba(212,175,55,0.3)]',
          'transition-all duration-300',
          'group',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
              <span className="text-4xl">🎰</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
              className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.5)]"
            >
              <span className="text-black text-xl ml-1">▶</span>
            </motion.div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {isHot && (
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#FF6B6B] to-[#EE5A5A] text-white text-[10px] font-bold uppercase">
                🔥 Hot
              </span>
            )}
            {isNew && (
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#00E701] to-[#00C301] text-black text-[10px] font-bold uppercase">
                New
              </span>
            )}
            {isLive && (
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h4 className="font-semibold text-white text-sm truncate group-hover:text-[#D4AF37] transition-colors">
            {name}
          </h4>
          {provider && (
            <p className="text-[11px] text-[#666666] truncate mt-0.5">
              {provider}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// Compact Game Card for horizontal scrolling
export function GameCardCompact({
  id,
  name,
  thumbnail,
  href,
  isHot,
  className,
}: Omit<GameCardProps, 'provider' | 'isNew' | 'isLive'>) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative overflow-hidden rounded-xl cursor-pointer',
          'w-[140px] aspect-[3/4] flex-shrink-0',
          'bg-[#161616] border border-[#2A2A2A]',
          'hover:border-[#D4AF37]/30',
          'transition-all duration-200',
          'group',
          className
        )}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] flex items-center justify-center">
            <span className="text-4xl">🎰</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Hot Badge */}
        {isHot && (
          <div className="absolute top-2 right-2">
            <span className="text-lg">🔥</span>
          </div>
        )}

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h4 className="font-semibold text-white text-xs truncate">
            {name}
          </h4>
        </div>
      </motion.div>
    </Link>
  );
}
