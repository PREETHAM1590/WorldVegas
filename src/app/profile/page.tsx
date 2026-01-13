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
  CheckCircle
} from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserStore } from '@/stores/userStore';
import { useWorldAuth } from '@/hooks/useWorldAuth';
import { shortenAddress, cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, isLoading } = useUserStore();
  const { signInWithWorldID, verifyAction, logout } = useWorldAuth();

  const menuItems = [
    {
      icon: <History className="w-5 h-5" />,
      label: 'Game History',
      description: 'View all your past games',
      action: () => {},
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Verify for High Stakes',
      description: 'Enable higher bet limits',
      action: () => verifyAction('worldvegas-high-stakes'),
      highlight: true,
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      description: 'Manage your preferences',
      action: () => {},
    },
    {
      icon: <ExternalLink className="w-5 h-5" />,
      label: 'Provably Fair',
      description: 'Learn how we ensure fairness',
      action: () => {},
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              {user ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center shadow-neon-purple">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {shortenAddress(user.address, 6)}
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                            user.verificationLevel === 'orb'
                              ? 'bg-teal-500/20 text-teal-400'
                              : 'bg-primary-500/20 text-primary-400'
                          )}
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span className="capitalize">{user.verificationLevel} Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.verificationLevel !== 'orb' && (
                    <div className="bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-gold-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gold-400 text-sm">Upgrade to Orb Verification</p>
                          <p className="text-xs text-white/60 mt-1">
                            Get higher bet limits and access to exclusive games
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-gold-500/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white/30" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Not Signed In</h2>
                  <p className="text-white/60 text-sm mb-4">
                    Sign in with World ID to play
                  </p>
                  <Button
                    variant="primary"
                    onClick={signInWithWorldID}
                    isLoading={isLoading}
                    className="w-full"
                  >
                    <Shield className="w-5 h-5" />
                    Sign in with World ID
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Menu Items */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card
                  onClick={item.action}
                  className={cn(
                    'p-4 cursor-pointer transition-colors',
                    item.highlight && 'border-gold-500/30'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          item.highlight
                            ? 'bg-gold-500/20 text-gold-400'
                            : 'bg-white/5 text-white/60'
                        )}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-white/50">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30" />
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Logout */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
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
          <p className="text-xs text-white/30">WorldVegas v1.0.0</p>
          <p className="text-xs text-white/20">Provably Fair Gaming</p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
