'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { formatCurrency, shortenAddress } from '@/lib/utils';
import { Coins, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Header() {
  const { user, balance } = useUserStore();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 safe-area-top bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-[#D4AF37]/10">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative w-11 h-11 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="WorldVegas"
                width={44}
                height={44}
                className="object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#8B5CF6] via-[#A78BFA] to-[#D4AF37] bg-clip-text text-transparent">WorldVegas</h1>
              <p className="text-[10px] text-[#D4AF37]/60 -mt-0.5 font-medium">Provably Fair Gaming</p>
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
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#1A1500]/80 to-[#0A0A0A]/80 backdrop-blur-xl border border-[#D4AF37]/30 shadow-[0_0_20px_-5px_rgba(212,175,55,0.2)]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                  <Coins className="w-4 h-4 text-black" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#D4AF37]">
                    {formatCurrency(balance.wld)} WLD
                  </p>
                  <p className="text-[10px] text-white/60 font-medium">
                    ${formatCurrency(balance.usdc)} USDC
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#D4AF37]/60" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
