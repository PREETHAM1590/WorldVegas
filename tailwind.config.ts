import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern 2025 Premium Casino Theme
        // Rich deep tones with vibrant accents
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        accent: {
          gold: '#F5A623',
          amber: '#FFBE0B',
          emerald: '#10B981',
          cyan: '#06B6D4',
          rose: '#F43F5E',
          coral: '#FF6B6B',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        // Premium dark palette
        dark: {
          bg: '#0C0A14',
          card: '#151320',
          elevated: '#1C1A28',
          border: '#2A2838',
          hover: '#322F42',
        },
      },
      backgroundImage: {
        // Modern gradient meshes
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(268, 82%, 35%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(45, 100%, 60%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(268, 82%, 45%, 0.1) 0px, transparent 50%)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // Premium card gradients
        'card-premium': 'linear-gradient(135deg, rgba(21, 19, 32, 0.9) 0%, rgba(28, 26, 40, 0.95) 100%)',
        'card-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'card-gold': 'linear-gradient(135deg, rgba(245, 166, 35, 0.1) 0%, rgba(255, 190, 11, 0.05) 100%)',
        // Button gradients
        'btn-primary': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'btn-gold': 'linear-gradient(135deg, #F5A623 0%, #FFBE0B 100%)',
        'btn-success': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
      boxShadow: {
        // Modern soft shadows with color tints
        'soft-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'soft-md': '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
        'soft-lg': '0 8px 32px -8px rgba(0, 0, 0, 0.5)',
        'soft-xl': '0 16px 48px -12px rgba(0, 0, 0, 0.6)',
        // Glow effects (subtle, not neon)
        'glow-purple': '0 0 20px -5px rgba(139, 92, 246, 0.4)',
        'glow-gold': '0 0 20px -5px rgba(245, 166, 35, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        // Inner shadows for depth
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        // Card shadows
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'card-hover': '0 8px 32px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.2)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cabinet)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [],
};

export default config;
