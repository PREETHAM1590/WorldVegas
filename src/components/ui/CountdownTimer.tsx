'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date | string;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  className?: string;
  variant?: 'gold' | 'dark';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  targetDate,
  title,
  subtitle,
  onComplete,
  className,
  variant = 'gold',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setIsComplete(true);
        onComplete?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const boxStyles = {
    gold: 'bg-gradient-to-b from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] text-black shadow-[0_4px_15px_-3px_rgba(212,175,55,0.4)]',
    dark: 'bg-[#1A1A1A] border border-[#2A2A2A] text-white',
  };

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <motion.div
      key={value}
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={cn(
        'flex flex-col items-center justify-center',
        'px-4 py-3 rounded-xl min-w-[70px]',
        boxStyles[variant]
      )}
    >
      <motion.span
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl sm:text-3xl font-extrabold font-display leading-none"
      >
        {String(value).padStart(2, '0')}
      </motion.span>
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mt-1">
        {label}
      </span>
    </motion.div>
  );

  if (isComplete) {
    return (
      <div className={cn('text-center py-4', className)}>
        <span className="text-[#D4AF37] font-bold text-xl">Race Complete!</span>
      </div>
    );
  }

  return (
    <div className={cn('', className)}>
      {/* Title */}
      {(title || subtitle) && (
        <div className="text-center mb-4">
          {subtitle && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#666666] mb-1">
              {subtitle}
            </p>
          )}
          {title && (
            <h3 className="text-xl font-bold text-white font-display">
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Timer Boxes */}
      <div className="flex items-center justify-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <TimeBox value={timeLeft.days} label="Days" />
            <span className="text-2xl font-bold text-[#666666]">:</span>
          </>
        )}
        <TimeBox value={timeLeft.hours} label="Hours" />
        <span className="text-2xl font-bold text-[#666666]">:</span>
        <TimeBox value={timeLeft.minutes} label="Mins" />
        <span className="text-2xl font-bold text-[#666666]">:</span>
        <TimeBox value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}

// Daily Race Countdown Card (as shown in the design)
export function DailyRaceCountdown({ className }: { className?: string }) {
  // Set target to next midnight
  const getNextMidnight = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500]',
        'border border-[#D4AF37]/30',
        className
      )}
    >
      {/* Decorative coins */}
      <div className="absolute -right-4 -bottom-4 opacity-60">
        <div className="relative w-32 h-32">
          <span className="absolute text-5xl top-0 right-8 animate-float">🪙</span>
          <span className="absolute text-4xl top-8 right-0 animate-float" style={{ animationDelay: '0.3s' }}>🪙</span>
          <span className="absolute text-3xl top-16 right-12 animate-float" style={{ animationDelay: '0.6s' }}>🪙</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-center mb-1">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-2xl font-extrabold font-display">
            WORLDVEGAS
          </span>
        </h2>
        <h3 className="text-center text-white text-xl font-bold mb-4">
          $25K DAILY RACE
        </h3>

        <CountdownTimer
          targetDate={getNextMidnight()}
          subtitle="RACE RESETS IN"
        />

        {/* How it works button */}
        <div className="text-center mt-4">
          <button className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#C9A227] transition-colors">
            How it works
          </button>
        </div>
      </div>
    </div>
  );
}
