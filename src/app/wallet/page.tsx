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
  Gamepad2
} from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
      const result = await withdraw(amount, currency.toUpperCase() as 'WLD' | 'USDC');
      if (result.success) {
        showToast(`Withdrew ${amount} ${currency.toUpperCase()}`, 'success');
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

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-white/60 text-sm mb-1">Total Balance</p>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-4xl font-bold">
                  ${formatCurrency(balance.usdc + balance.wld * 2.5)}
                </h2>
                <span className="text-white/40 text-sm">USD</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <Coins className="w-3.5 h-3.5 text-primary-400" />
                    </div>
                    <span className="text-white/60 text-xs">WLD</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(balance.wld)}</p>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <span className="text-white/60 text-xs">USDC</span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(balance.usdc)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => setModalType('deposit')}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Deposit
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setModalType('withdraw')}
                >
                  <ArrowUpFromLine className="w-4 h-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </Card>
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
                'flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'transactions'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              <History className="w-4 h-4" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('games')}
              className={cn(
                'flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2',
                activeTab === 'games'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
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
                <Card className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-white/30" />
                  </div>
                  <p className="text-white/50 text-sm">No transactions yet</p>
                  <p className="text-white/30 text-xs">Deposit or withdraw to see history</p>
                </Card>
              ) : (
                transactions.map((tx) => (
                  <Card key={tx.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            tx.type === 'deposit' ? 'bg-teal-500/20' : 'bg-orange-500/20'
                          )}
                        >
                          {tx.type === 'deposit' ? (
                            <ArrowDownToLine className="w-5 h-5 text-teal-400" />
                          ) : (
                            <ArrowUpFromLine className="w-5 h-5 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-white/50">{formatDate(tx.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-bold',
                            tx.type === 'deposit' ? 'text-teal-400' : 'text-orange-400'
                          )}
                        >
                          {tx.type === 'deposit' ? '+' : '-'}
                          {tx.amount} {tx.currency.toUpperCase()}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {tx.status === 'completed' && (
                            <CheckCircle className="w-3 h-3 text-teal-400" />
                          )}
                          {tx.status === 'pending' && (
                            <Clock className="w-3 h-3 text-yellow-400" />
                          )}
                          {tx.status === 'failed' && (
                            <XCircle className="w-3 h-3 text-red-400" />
                          )}
                          <span
                            className={cn(
                              'text-xs capitalize',
                              tx.status === 'completed' && 'text-teal-400',
                              tx.status === 'pending' && 'text-yellow-400',
                              tx.status === 'failed' && 'text-red-400'
                            )}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Transaction Hash Link */}
                    {tx.transactionHash && tx.status === 'completed' && (
                      <button
                        onClick={() => openExplorer(tx.transactionHash!)}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/5 rounded-lg text-xs text-primary-400 hover:bg-white/10 transition-colors"
                      >
                        <span className="truncate">View on World Chain Explorer</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </button>
                    )}
                    {tx.errorMessage && tx.status === 'failed' && (
                      <p className="mt-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                        {tx.errorMessage}
                      </p>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Game History */}
          {activeTab === 'games' && (
            <div className="space-y-2">
              {results.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Gamepad2 className="w-6 h-6 text-white/30" />
                  </div>
                  <p className="text-white/50 text-sm">No games played yet</p>
                  <p className="text-white/30 text-xs">Play games to see your history</p>
                </Card>
              ) : (
                results.map((result) => (
                  <Card key={result.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            result.outcome === 'win'
                              ? 'bg-teal-500/20'
                              : result.outcome === 'push'
                              ? 'bg-white/10'
                              : 'bg-red-500/20'
                          )}
                        >
                          {result.game === 'slots' && '🎰'}
                          {result.game === 'blackjack' && '🃏'}
                          {result.game === 'prediction' && '📊'}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{result.game}</p>
                          <p className="text-xs text-white/50">
                            Bet: {result.betAmount} {result.currency.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-bold',
                            result.outcome === 'win'
                              ? 'text-teal-400'
                              : result.outcome === 'push'
                              ? 'text-white/60'
                              : 'text-red-400'
                          )}
                        >
                          {result.outcome === 'win'
                            ? `+${formatCurrency(result.payout)}`
                            : result.outcome === 'push'
                            ? '0'
                            : `-${formatCurrency(result.betAmount)}`}
                        </p>
                        <p className="text-xs text-white/40">
                          {formatDate(result.timestamp)}
                        </p>
                      </div>
                    </div>
                    {/* Provably Fair Info */}
                    {result.serverSeed && (
                      <div className="mt-3 p-2 bg-white/5 rounded-lg">
                        <p className="text-xs text-white/40 mb-1">Provably Fair</p>
                        <p className="text-xs text-white/60 font-mono truncate">
                          Seed: {result.serverSeed.slice(0, 20)}...
                        </p>
                      </div>
                    )}
                  </Card>
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
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setModalType(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-casino-card rounded-t-3xl flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed */}
              <div className="p-6 pb-0">
                {/* Handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold capitalize">{modalType}</h2>
                  <button
                    onClick={() => setModalType(null)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6">
                {/* Currency Selection */}
                <div className="flex gap-2 mb-6">
                  {(['wld', 'usdc'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2',
                        currency === c
                          ? 'bg-primary-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
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
                  <label className="block text-sm text-white/60 mb-2">Amount (min 0.1)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[0.1, 0.5, 1, 5, 10, 25, 50, 100].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAmount(a)}
                        className={cn(
                          'py-2 rounded-lg text-sm font-medium transition-all',
                          amount === a
                            ? 'bg-gold-500 text-casino-dark'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
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
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="Custom amount"
                    />
                    <span className="text-white/60 uppercase text-sm font-medium">{currency}</span>
                  </div>
                </div>

                {/* Current Balance */}
                {modalType === 'withdraw' && (
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <p className="text-sm text-white/60">Available Balance</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(balance[currency])} {currency.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button - Fixed at bottom */}
              <div className="p-6 pt-4 pb-24 border-t border-white/10">
                <Button
                  variant={modalType === 'deposit' ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={handleTransaction}
                  isLoading={isProcessing}
                  disabled={amount < 0.1 || (modalType === 'withdraw' && balance[currency] < amount)}
                  className="w-full"
                >
                  {modalType === 'deposit' ? (
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
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
