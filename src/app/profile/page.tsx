'use client';

import { motion } from 'framer-motion';
import {
  User,
  Shield,
  History,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Crown,
  Star,
  Trophy,
  Zap,
  Gift,
  Volume2,
  Bell,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { useWorldAuth } from '@/hooks/useWorldAuth';
import { shortenAddress, cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading, balance } = useUserStore();
  const { signInWithWorldID, verifyAction, logout } = useWorldAuth();

  const stats = [
    { label: 'Total Wagered', value: '$12,450', icon: Zap },
    { label: 'Total Won', value: '$8,320', icon: Trophy },
    { label: 'Win Rate', value: '64%', icon: Star },
  ];

  const menuItems = [
    {
      icon: <History className="w-5 h-5" />,
      label: 'Game History',
      description: 'View all your past games',
      href: '/history',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Verify for High Stakes',
      description: 'Enable higher bet limits',
      action: () => verifyAction('worldvegas-high-stakes'),
      highlight: true,
    },
    {
      icon: <Gift className="w-5 h-5" />,
      label: 'Rewards & Bonuses',
      description: 'Claim your daily rewards',
      href: '/rewards',
    },
    {
      icon: <Volume2 className="w-5 h-5" />,
      label: 'Sound Settings',
      description: 'Manage audio preferences',
      href: '/settings',
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      description: 'Configure alerts',
      href: '/settings',
    },
    {
      icon: <ExternalLink className="w-5 h-5" />,
      label: 'Provably Fair',
      description: 'Learn how we ensure fairness',
      href: '/legal/provably-fair',
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Support',
      description: 'Get help with your account',
      href: '/support',
    },
  ];

  // VIP tier based on wagered amount
  const getVIPTier = () => {
    return { name: 'Gold', color: 'from-[#D4AF37] to-[#B8860B]', icon: Crown };
  };

  const vipTier = getVIPTier();

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500] p-6 mb-6"
        >
          {/* Gold Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.2)_0%,transparent_60%)] pointer-events-none" />

          {/* Decorative coins */}
          <div className="absolute -right-4 -top-4 opacity-40">
            <span className="text-5xl animate-float">🪙</span>
          </div>

          <div className="relative">
            {user ? (
              <>
                <div className="flex items-start gap-4 mb-6">
                  {/* Avatar with VIP ring */}
                  <div className="relative">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center",
                      "bg-gradient-to-br",
                      vipTier.color,
                      "shadow-[0_0_30px_-5px_rgba(212,175,55,0.5)]"
                    )}>
                      <User className="w-10 h-10 text-black" />
                    </div>
                    {/* VIP Badge */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center border-2 border-[#0A0A0A]">
                      <Crown className="w-4 h-4 text-black" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-xl font-bold text-white font-display">
                      {shortenAddress(user.address, 6)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold',
                          user.verificationLevel === 'orb'
                            ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            : 'bg-[#666666]/20 text-[#A3A3A3]'
                        )}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span className="capitalize">{user.verificationLevel} Verified</span>
                      </div>
                    </div>
                    {/* VIP Status */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-[#666666]">VIP Status:</span>
                      <span className={cn(
                        "text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r",
                        vipTier.color
                      )}>
                        {vipTier.name} Member
                      </span>
                    </div>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-[#0A0A0A]/50 rounded-xl p-3 border border-[#2A2A2A]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#666666] mb-1">WLD Balance</p>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]">
                      {balance?.wld?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="bg-[#0A0A0A]/50 rounded-xl p-3 border border-[#2A2A2A]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#666666] mb-1">USDC Balance</p>
                    <p className="text-xl font-bold text-white">
                      ${balance?.usdc?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                  {stats.map((stat) => (
                    <div key={stat.label} className="text-center bg-[#0A0A0A]/30 rounded-xl p-2.5 border border-[#2A2A2A]/50">
                      <stat.icon className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                      <p className="text-sm font-bold text-white">{stat.value}</p>
                      <p className="text-[9px] text-[#666666] uppercase tracking-wide">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {user.verificationLevel !== 'orb' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl p-4 mt-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#D4AF37] text-sm">Upgrade to Orb Verification</p>
                        <p className="text-xs text-[#A3A3A3] mt-1">
                          Get higher bet limits, exclusive games & VIP rewards
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20">
                  <User className="w-12 h-12 text-[#D4AF37]/50" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 font-display">Welcome to WorldVegas</h2>
                <p className="text-[#A3A3A3] text-sm mb-6">
                  Sign in with World ID to start playing
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={signInWithWorldID}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg",
                    "bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37]",
                    "text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.5)]",
                    "hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.7)]",
                    "transition-all duration-300",
                    "flex items-center justify-center gap-2",
                    "disabled:opacity-50"
                  )}
                >
                  <Shield className="w-5 h-5" />
                  {isLoading ? 'Connecting...' : 'Sign in with World ID'}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Menu Items */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-3">
              Account Settings
            </h3>

            {menuItems.map((item, index) => {
              const content = (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                  onClick={item.action}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                    'bg-[#161616] hover:bg-[#1A1A1A]',
                    item.highlight
                      ? 'border-[#D4AF37]/30 hover:border-[#D4AF37]/50'
                      : 'border-[#2A2A2A] hover:border-[#D4AF37]/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          item.highlight
                            ? 'bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 text-[#D4AF37]'
                            : 'bg-[#2A2A2A] text-[#A3A3A3]'
                        )}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium",
                          item.highlight ? "text-[#D4AF37]" : "text-white"
                        )}>{item.label}</p>
                        <p className="text-xs text-[#666666]">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5",
                      item.highlight ? "text-[#D4AF37]" : "text-[#666666]"
                    )} />
                  </div>
                </motion.div>
              );

              return item.href ? (
                <Link key={item.label} href={item.href}>
                  {content}
                </Link>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={logout}
                className={cn(
                  "w-full py-3.5 rounded-xl font-semibold",
                  "bg-red-500/10 border border-red-500/20",
                  "text-red-400 hover:bg-red-500/20",
                  "transition-all duration-200",
                  "flex items-center justify-center gap-2"
                )}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image
              src="/logo.svg"
              alt="WorldVegas"
              width={32}
              height={32}
              className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#D4AF37] font-bold text-lg font-display">
              WORLDVEGAS
            </span>
          </div>
          <p className="text-xs text-[#666666]">v1.0.0 • Provably Fair Gaming</p>
          <p className="text-[10px] text-[#444444] mt-1">Play Responsibly • 18+</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
