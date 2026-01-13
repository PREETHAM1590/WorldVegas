'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { formatCurrency, shortenAddress } from '@/lib/utils';
import { Coins, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, balance } = useUserStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 safe-area-top">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center shadow-neon-purple">
              <span className="text-xl font-bold">W</span>
            </div>
            <div>
              <h1 className="text-lg font-bold neon-text-purple">WorldVegas</h1>
              <p className="text-[10px] text-white/50 -mt-0.5">Provably Fair</p>
            </div>
          </motion.div>

          {/* Balance Pill */}
          {user && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/wallet')}
              className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">
                    {formatCurrency(balance.wld)} WLD
                  </p>
                  <p className="text-[10px] text-white/50">
                    ${formatCurrency(balance.usdc)} USDC
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
