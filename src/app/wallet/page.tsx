'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  ExternalLink,
  Coins,
  DollarSign,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Gamepad2,
  Wallet,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { useGameStore } from '@/stores/gameStore';
import { useTransactionStore, WORLD_CHAIN_EXPLORER } from '@/stores/transactionStore';
import { usePayments } from '@/hooks/usePayments';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, cn } from '@/lib/utils';

type ModalType = 'deposit' | 'withdraw' | null;
type TabType = 'transactions' | 'games';

export default function WalletPage() {
  const { balance } = useUserStore();
  const { results } = useGameStore();
  const { transactions } = useTransactionStore();
  const { deposit, withdraw, isProcessing } = usePayments();
  const { showToast } = useToast();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [amount, setAmount] = useState(0.1);
  const [currency, setCurrency] = useState<'wld' | 'usdc'>('usdc');
  const [activeTab, setActiveTab] = useState<TabType>('transactions');

  const handleTransaction = async () => {
    if (modalType === 'deposit') {
      const result = await deposit(amount, currency.toUpperCase() as 'WLD' | 'USDC');
      if (result.success) {
        showToast(`Deposited ${amount} ${currency.toUpperCase()}`, 'success');
        setModalType(null);
      } else {
        showToast(result.error || 'Deposit failed', 'error');
      }
    } else if (modalType === 'withdraw') {
      if (balance[currency] < amount) {
        showToast(`Insufficient ${currency.toUpperCase()} balance`, 'error');
        return;
      }

      const result = await withdraw(amount, currency.toUpperCase() as 'WLD' | 'USDC');
      if (result.success) {
        showToast(`Withdrawal of ${amount} ${currency.toUpperCase()} processed`, 'success');
        setModalType(null);
      } else {
        showToast(result.error || 'Withdrawal failed', 'error');
      }
    }
  };

  const openExplorer = (hash: string) => {
    window.open(`${WORLD_CHAIN_EXPLORER}${hash}`, '_blank');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate total balance in USD
  const totalBalanceUSD = balance.usdc + balance.wld * 2.5;

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Balance Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500] p-6 mb-6"
        >
          {/* Gold Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.2)_0%,transparent_60%)] pointer-events-none" />

          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 opacity-30">
            <span className="text-6xl animate-float">💰</span>
          </div>

          <div className="relative">
            {/* Total Balance */}
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-[#D4AF37]" />
              <p className="text-[#A3A3A3] text-sm font-medium">Total Balance</p>
            </div>
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] font-display">
                ${formatCurrency(totalBalanceUSD)}
              </h2>
              <span className="text-[#666666] text-sm">USD</span>
            </div>

            {/* Currency Balances */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#0A0A0A]/50 rounded-xl p-4 border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center">
                    <Coins className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-[#A3A3A3] text-sm font-medium">WLD</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(balance.wld)}</p>
                <p className="text-[10px] text-[#666666]">≈ ${formatCurrency(balance.wld * 2.5)} USD</p>
              </div>

              <div className="bg-[#0A0A0A]/50 rounded-xl p-4 border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C853] to-[#009624] flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[#A3A3A3] text-sm font-medium">USDC</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(balance.usdc)}</p>
                <p className="text-[10px] text-[#666666]">Stablecoin</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalType('deposit')}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-bold",
                  "bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37]",
                  "text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.5)]",
                  "flex items-center justify-center gap-2"
                )}
              >
                <ArrowDownToLine className="w-5 h-5" />
                Deposit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModalType('withdraw')}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-bold",
                  "bg-[#161616] border border-[#2A2A2A]",
                  "text-white hover:border-[#D4AF37]/30",
                  "flex items-center justify-center gap-2",
                  "transition-all duration-200"
                )}
              >
                <ArrowUpFromLine className="w-5 h-5" />
                Withdraw
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center">
            <TrendingUp className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
            <p className="text-sm font-bold text-white">${formatCurrency(totalBalanceUSD * 0.15)}</p>
            <p className="text-[9px] text-[#666666] uppercase">Today's P/L</p>
          </div>
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center">
            <Gamepad2 className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{results.length}</p>
            <p className="text-[9px] text-[#666666] uppercase">Games Played</p>
          </div>
          <div className="p-3 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center">
            <Shield className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
            <p className="text-sm font-bold text-white">100%</p>
            <p className="text-[9px] text-[#666666] uppercase">Secure</p>
          </div>
        </motion.div>

        {/* History Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('transactions')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] text-black'
                  : 'bg-[#161616] border border-[#2A2A2A] text-[#A3A3A3] hover:border-[#D4AF37]/30'
              )}
            >
              <History className="w-4 h-4" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] text-black'
                  : 'bg-[#161616] border border-[#2A2A2A] text-[#A3A3A3] hover:border-[#D4AF37]/30'
              )}
            >
              <Gamepad2 className="w-4 h-4" />
              Game History
            </button>
          </div>

          {/* Transaction History */}
          {activeTab === 'transactions' && (
            <div className="space-y-2">
              {transactions.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center">
                  <div className="w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto mb-3">
                    <History className="w-7 h-7 text-[#666666]" />
                  </div>
                  <p className="text-white font-medium mb-1">No transactions yet</p>
                  <p className="text-[#666666] text-sm">Deposit or withdraw to see history</p>
                </div>
              ) : (
                transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#D4AF37]/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center',
                            tx.type === 'deposit'
                              ? 'bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5'
                              : 'bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5'
                          )}
                        >
                          {tx.type === 'deposit' ? (
                            <ArrowDownToLine className="w-5 h-5 text-[#00C853]" />
                          ) : (
                            <ArrowUpFromLine className="w-5 h-5 text-[#FF6B6B]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white capitalize">{tx.type}</p>
                          <p className="text-xs text-[#666666]">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-bold',
                            tx.type === 'deposit' ? 'text-[#00C853]' : 'text-[#FF6B6B]'
                          )}
                        >
                          {tx.type === 'deposit' ? '+' : '-'}
                          {tx.amount} {tx.currency.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {tx.status === 'completed' && (
                            <CheckCircle className="w-3 h-3 text-[#00C853]" />
                          )}
                          {tx.status === 'pending' && (
                            <Clock className="w-3 h-3 text-[#D4AF37]" />
                          )}
                          {tx.status === 'failed' && (
                            <XCircle className="w-3 h-3 text-[#FF6B6B]" />
                          )}
                          <span
                            className={cn(
                              'text-xs capitalize',
                              tx.status === 'completed' && 'text-[#00C853]',
                              tx.status === 'pending' && 'text-[#D4AF37]',
                              tx.status === 'failed' && 'text-[#FF6B6B]'
                            )}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {tx.transactionHash && tx.status === 'completed' && (
                      <button
                        onClick={() => openExplorer(tx.transactionHash!)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-xs text-[#D4AF37] hover:border-[#D4AF37]/30 transition-colors"
                      >
                        <span>View on World Chain Explorer</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    {tx.errorMessage && tx.status === 'failed' && (
                      <p className="mt-2 text-xs text-[#FF6B6B] bg-[#FF6B6B]/10 rounded-lg px-3 py-2">
                        {tx.errorMessage}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Game History */}
          {activeTab === 'games' && (
            <div className="space-y-2">
              {results.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center">
                  <div className="w-14 h-14 rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto mb-3">
                    <Gamepad2 className="w-7 h-7 text-[#666666]" />
                  </div>
                  <p className="text-white font-medium mb-1">No games played yet</p>
                  <p className="text-[#666666] text-sm">Play games to see your history</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#D4AF37]/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center text-xl',
                            result.outcome === 'win'
                              ? 'bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5'
                              : result.outcome === 'push'
                              ? 'bg-[#2A2A2A]'
                              : 'bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5'
                          )}
                        >
                          {result.game === 'slots' && '🎰'}
                          {result.game === 'blackjack' && '🃏'}
                          {result.game === 'aviator' && '✈️'}
                          {result.game === 'coinflip' && '🪙'}
                          {result.game === 'dice' && '🎲'}
                          {result.game === 'roulette' && '🎡'}
                          {result.game === 'mines' && '💎'}
                          {result.game === 'prediction' && '📊'}
                        </div>
                        <div>
                          <p className="font-semibold text-white capitalize">{result.game}</p>
                          <p className="text-xs text-[#666666]">
                            Bet: {result.betAmount} {result.currency.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-bold',
                            result.outcome === 'win'
                              ? 'text-[#00C853]'
                              : result.outcome === 'push'
                              ? 'text-[#A3A3A3]'
                              : 'text-[#FF6B6B]'
                          )}
                        >
                          {result.outcome === 'win'
                            ? `+${formatCurrency(result.payout)}`
                            : result.outcome === 'push'
                            ? '0'
                            : `-${formatCurrency(result.betAmount)}`}
                        </p>
                        <p className="text-xs text-[#666666]">
                          {formatDate(result.timestamp)}
                        </p>
                      </div>
                    </div>
                    {result.serverSeed && (
                      <div className="mt-3 p-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Shield className="w-3 h-3 text-[#D4AF37]" />
                          <p className="text-[10px] text-[#D4AF37] font-semibold uppercase">Provably Fair</p>
                        </div>
                        <p className="text-xs text-[#666666] font-mono truncate">
                          Seed: {result.serverSeed.slice(0, 24)}...
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Transaction Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setModalType(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0A0A0A] border-t border-[#2A2A2A] rounded-t-3xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="w-12 h-1 bg-[#2A2A2A] rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      modalType === 'deposit'
                        ? "bg-gradient-to-br from-[#00C853]/20 to-[#00C853]/5"
                        : "bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5"
                    )}>
                      {modalType === 'deposit' ? (
                        <ArrowDownToLine className="w-6 h-6 text-[#00C853]" />
                      ) : (
                        <ArrowUpFromLine className="w-6 h-6 text-[#FF6B6B]" />
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white capitalize">{modalType}</h2>
                  </div>
                  <button
                    onClick={() => setModalType(null)}
                    className="p-2 rounded-lg bg-[#161616] border border-[#2A2A2A] hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-[#A3A3A3]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6">
                {/* Currency Selection */}
                <div className="flex gap-2 mb-6">
                  {(['wld', 'usdc'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'flex-1 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                        currency === c
                          ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] text-black'
                          : 'bg-[#161616] border border-[#2A2A2A] text-[#A3A3A3] hover:border-[#D4AF37]/30'
                      )}
                    >
                      {c === 'wld' ? (
                        <Coins className="w-4 h-4" />
                      ) : (
                        <DollarSign className="w-4 h-4" />
                      )}
                      {c.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Amount Selection */}
                <div className="mb-6">
                  <label className="block text-sm text-[#A3A3A3] mb-3">Select Amount (min 0.1)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[0.1, 0.5, 1, 5, 10, 25, 50, 100].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(a)}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-semibold transition-all',
                          amount === a
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black'
                            : 'bg-[#161616] border border-[#2A2A2A] text-[#A3A3A3] hover:border-[#D4AF37]/30'
                        )}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  {/* Custom Amount Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0.1) setAmount(val);
                      }}
                      className={cn(
                        "flex-1 bg-[#161616] border border-[#2A2A2A] rounded-xl px-4 py-3.5",
                        "text-white placeholder-[#666666]",
                        "focus:outline-none focus:border-[#D4AF37]/50",
                        "transition-colors"
                      )}
                      placeholder="Custom amount"
                    />
                    <span className="text-[#D4AF37] uppercase text-sm font-bold">{currency}</span>
                  </div>
                </div>

                {/* Current Balance for Withdraw */}
                {modalType === 'withdraw' && (
                  <div className="bg-[#161616] border border-[#2A2A2A] rounded-xl p-4 mb-4">
                    <p className="text-sm text-[#A3A3A3] mb-1">Available Balance</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(balance[currency])} <span className="text-[#D4AF37]">{currency.toUpperCase()}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-6 pt-4 pb-24 border-t border-[#2A2A2A]">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleTransaction}
                  disabled={isProcessing || amount < 0.1 || (modalType === 'withdraw' && balance[currency] < amount)}
                  className={cn(
                    "w-full py-4 rounded-xl font-bold text-lg",
                    "flex items-center justify-center gap-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    modalType === 'deposit'
                      ? "bg-gradient-to-r from-[#D4AF37] via-[#F5D77A] to-[#D4AF37] text-black shadow-[0_0_20px_-5px_rgba(212,175,55,0.5)]"
                      : "bg-[#161616] border border-[#2A2A2A] text-white hover:border-[#D4AF37]/30"
                  )}
                >
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                  ) : modalType === 'deposit' ? (
                    <>
                      <ArrowDownToLine className="w-5 h-5" />
                      Deposit {amount} {currency.toUpperCase()}
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="w-5 h-5" />
                      Withdraw {amount} {currency.toUpperCase()}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
