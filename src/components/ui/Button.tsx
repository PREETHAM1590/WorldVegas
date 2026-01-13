'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: cn(
    'bg-gradient-to-r from-primary-500 to-primary-600',
    'hover:from-primary-400 hover:to-primary-500',
    'text-white shadow-soft-md hover:shadow-glow-purple',
    'border border-primary-400/20'
  ),
  secondary: cn(
    'bg-gradient-to-r from-accent-emerald to-emerald-600',
    'hover:from-emerald-400 hover:to-emerald-500',
    'text-white shadow-soft-md hover:shadow-glow-emerald',
    'border border-emerald-400/20'
  ),
  gold: cn(
    'bg-gradient-to-r from-accent-gold to-amber-500',
    'hover:from-amber-400 hover:to-accent-gold',
    'text-dark-bg font-semibold shadow-soft-md hover:shadow-glow-gold',
    'border border-amber-300/20'
  ),
  ghost: cn(
    'bg-white/[0.03] hover:bg-white/[0.06]',
    'text-white/80 hover:text-white',
    'border border-white/[0.06] hover:border-white/[0.1]'
  ),
  danger: cn(
    'bg-gradient-to-r from-rose-500 to-rose-600',
    'hover:from-rose-400 hover:to-rose-500',
    'text-white shadow-soft-md',
    'border border-rose-400/20'
  ),
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.01, y: disabled ? 0 : -1 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative font-medium transition-all duration-300 flex items-center justify-center',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
          'btn-premium',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <motion.div
              className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="opacity-80">Loading</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
