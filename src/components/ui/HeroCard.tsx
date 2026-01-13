'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeroCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  imageSrc?: string;
  variant?: 'gold' | 'dark' | 'vip';
  className?: string;
  children?: React.ReactNode;
}

export function HeroCard({
  title,
  subtitle,
  description,
  buttonText = 'Explore',
  buttonHref = '#',
  imageSrc,
  variant = 'gold',
  className,
  children,
}: HeroCardProps) {
  const variants = {
    gold: {
      bg: 'bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500]',
      border: 'border-[#D4AF37]/30',
      glow: 'shadow-[0_0_40px_-10px_rgba(212,175,55,0.3)]',
    },
    dark: {
      bg: 'bg-gradient-to-br from-[#161616] via-[#1A1A1A] to-[#161616]',
      border: 'border-[#2A2A2A]',
      glow: '',
    },
    vip: {
      bg: 'bg-gradient-to-br from-[#1A1000] via-[#2D1D00] to-[#1A1000]',
      border: 'border-[#FFD700]/40',
      glow: 'shadow-[0_0_50px_-10px_rgba(255,215,0,0.4)]',
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5',
        style.bg,
        style.border,
        style.glow,
        className
      )}
    >
      {/* Gold Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.15)_0%,transparent_60%)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {subtitle && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
            {subtitle}
          </span>
        )}

        <h3 className="text-2xl font-bold text-white mb-2 font-display">
          {title.split(' ').map((word, i) => (
            <span key={i}>
              {word.toLowerCase() === 'vip' || word.toLowerCase() === 'gold' ? (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B]">
                  {word}
                </span>
              ) : (
                word
              )}
              {' '}
            </span>
          ))}
        </h3>

        {description && (
          <p className="text-sm text-[#A3A3A3] mb-4">
            {description}
          </p>
        )}

        {children}

        {buttonText && (
          <Link href={buttonHref}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                'bg-[#161616] border border-[#2A2A2A]',
                'text-white font-medium text-sm',
                'hover:border-[#D4AF37]/30 hover:bg-[#1A1A1A]',
                'transition-all duration-200'
              )}
            >
              {buttonText}
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </Link>
        )}
      </div>

      {/* Optional Image */}
      {imageSrc && (
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-80">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-contain"
          />
        </div>
      )}
    </motion.div>
  );
}

// VIP Hero Card with special styling
export function VIPHeroCard() {
  return (
    <HeroCard
      variant="vip"
      subtitle="GET ALL-STAR TREATMENT"
      title="IT PAYS TO BE A VIP!"
      buttonText="Explore"
      buttonHref="/profile"
      className="min-h-[180px]"
    >
      {/* Floating coins decoration */}
      <div className="absolute right-4 top-4 text-4xl animate-float">
        🪙
      </div>
      <div className="absolute right-12 bottom-8 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>
        💰
      </div>
    </HeroCard>
  );
}

// Welcome Hero Card - For logged-in users
export function WelcomeHeroCard() {
  return (
    <HeroCard
      variant="gold"
      title="YOUR LUCK AWAITS"
      description="Play now and win big on your favorite games!"
      buttonText="Play Games"
      buttonHref="/games"
      className="min-h-[180px] text-center items-center justify-center"
    >
      {/* Roulette wheel decoration */}
      <div className="absolute right-4 top-4 text-4xl animate-float">
        🎲
      </div>
      <div className="absolute right-12 bottom-8 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>
        💎
      </div>
    </HeroCard>
  );
}
