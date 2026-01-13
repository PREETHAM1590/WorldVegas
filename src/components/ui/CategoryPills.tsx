'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CategoryPill {
  id: string;
  label: string;
  icon?: LucideIcon | string;
  count?: number;
}

interface CategoryPillsProps {
  categories: CategoryPill[];
  activeCategory: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function CategoryPills({
  categories,
  activeCategory,
  onSelect,
  className,
}: CategoryPillsProps) {
  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4',
        className
      )}
    >
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        const IconComponent = typeof category.icon === 'function' ? category.icon : null;

        return (
          <motion.button
            key={category.id}
            onClick={() => onSelect(category.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-full',
              'font-medium text-sm whitespace-nowrap',
              'border transition-all duration-200',
              'flex-shrink-0',
              isActive
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] text-black border-transparent shadow-[0_0_15px_-3px_rgba(212,175,55,0.4)]'
                : 'bg-[#161616] text-[#A3A3A3] border-[#2A2A2A] hover:text-white hover:border-[#D4AF37]/30'
            )}
          >
            {/* Icon */}
            {IconComponent ? (
              <IconComponent className="w-4 h-4" />
            ) : typeof category.icon === 'string' ? (
              <span className="text-base">{category.icon}</span>
            ) : null}

            {/* Label */}
            <span>{category.label}</span>

            {/* Count Badge */}
            {category.count !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs font-semibold',
                  isActive
                    ? 'bg-black/20 text-black'
                    : 'bg-[#2A2A2A] text-[#666666]'
                )}
              >
                {category.count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Preset categories for casino
export const CASINO_CATEGORIES = [
  { id: 'all', label: 'Lobby', icon: '🏠' },
  { id: 'originals', label: 'Originals', icon: '⭐' },
  { id: 'slots', label: 'Slots', icon: '🎰' },
  { id: 'live', label: 'Live', icon: '🔴' },
  { id: 'table', label: 'Table Games', icon: '🃏' },
  { id: 'crash', label: 'Crash', icon: '📈' },
];

// Game type pills
export const GAME_TYPE_PILLS = [
  { id: 'all', label: 'All Games' },
  { id: 'popular', label: 'Popular', icon: '🔥' },
  { id: 'new', label: 'New', icon: '✨' },
  { id: 'favorites', label: 'Favorites', icon: '❤️' },
];
