'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'game' | 'glass' | 'elevated';
  onClick?: () => void;
  animate?: boolean;
}

export function Card({ children, className, variant = 'default', onClick, animate = true }: CardProps) {
  const baseStyles = 'rounded-2xl overflow-hidden';

  const variantStyles = {
    default: 'glass-card',
    game: 'glass-card game-card',
    glass: 'bg-white/[0.02] backdrop-blur-2xl border border-white/[0.04]',
    elevated: 'glass-elevated',
  };

  const Component = animate ? motion.div : 'div';
  const motionProps = animate
    ? {
        whileHover: onClick ? { scale: 1.01, y: -2 } : undefined,
        whileTap: onClick ? { scale: 0.99 } : undefined,
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      }
    : {};

  return (
    <Component
      className={cn(baseStyles, variantStyles[variant], onClick && 'cursor-pointer', className)}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

interface GameCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  onClick: () => void;
  badge?: string;
}

export function GameCard({ title, description, icon, gradient, onClick, badge }: GameCardProps) {
  return (
    <Card variant="game" onClick={onClick} className="relative group">
      {/* Background Gradient - Subtle */}
      <div className={cn('absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60', gradient)} />

      {/* Mesh overlay for depth */}
      <div className="absolute inset-0 bg-mesh opacity-50" />

      {/* Content */}
      <div className="relative h-full p-5 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <motion.div
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              'bg-white/[0.06] backdrop-blur-sm border border-white/[0.08]',
              'shadow-soft-sm'
            )}
          >
            {icon}
          </motion.div>

          {badge ? (
            <span className="px-2 py-1 text-2xs font-medium rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/20">
              {badge}
            </span>
          ) : (
            <motion.div
              className="w-2 h-2 rounded-full bg-accent-emerald"
              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-0.5 tracking-tight">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />
    </Card>
  );
}

// Bento-style stat card for modern layouts
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendValue, className }: StatCardProps) {
  const trendColors = {
    up: 'text-accent-emerald',
    down: 'text-accent-rose',
    neutral: 'text-white/50',
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between mb-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
            {icon}
          </div>
        )}
        {trend && trendValue && (
          <span className={cn('text-xs font-medium', trendColors[trend])}>
            {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-white/40 mt-0.5">{label}</p>
    </Card>
  );
}
