'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Respects accessibility preferences for animations
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Optimized Framer Motion transition presets
 * These are tuned for smooth 60fps animations
 */
export const smoothTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const quickTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
  mass: 0.5,
};

export const gentleTransition = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
  mass: 1,
};

export const fadeTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

export const scaleTransition = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 28,
};

/**
 * Get transition based on reduced motion preference
 */
export function getTransition(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return { duration: 0 };
  }
  return smoothTransition;
}

/**
 * Animation variants optimized for performance
 * Uses transform and opacity only (GPU-accelerated properties)
 */
export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20,
    // Force GPU layer
    transform: 'translateY(20px) translateZ(0)',
  },
  visible: {
    opacity: 1,
    y: 0,
    transform: 'translateY(0) translateZ(0)',
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transform: 'scale(0.95) translateZ(0)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    transform: 'scale(1) translateZ(0)',
  },
};

export const slideInRight = {
  hidden: {
    opacity: 0,
    x: 20,
    transform: 'translateX(20px) translateZ(0)',
  },
  visible: {
    opacity: 1,
    x: 0,
    transform: 'translateX(0) translateZ(0)',
  },
};

/**
 * Stagger children animation helper
 */
export function getStaggerChildren(delay: number = 0.05) {
  return {
    visible: {
      transition: {
        staggerChildren: delay,
      },
    },
  };
}
