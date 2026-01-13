'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Clock, Ban, AlertTriangle, Save, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface ResponsibleGamblingSettings {
  depositLimitDaily: number | null;
  depositLimitWeekly: number | null;
  depositLimitMonthly: number | null;
  lossLimitDaily: number | null;
  lossLimitWeekly: number | null;
  sessionTimeLimit: number | null;
}

const DEPOSIT_LIMITS = [null, 10, 25, 50, 100, 250, 500, 1000];
const LOSS_LIMITS = [null, 5, 10, 25, 50, 100, 250, 500];
const SESSION_LIMITS = [null, 15, 30, 60, 120, 180, 240]; // minutes

export default function ResponsibleGamblingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSelfExclude, setShowSelfExclude] = useState(false);
  const [showCoolOff, setShowCoolOff] = useState(false);

  const [settings, setSettings] = useState<ResponsibleGamblingSettings>({
    depositLimitDaily: null,
    depositLimitWeekly: null,
    depositLimitMonthly: null,
    lossLimitDaily: null,
    lossLimitWeekly: null,
    sessionTimeLimit: null,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/responsible-gambling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast('Settings saved successfully', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelfExclude = async (days: number) => {
    if (!confirm(`Are you sure you want to self-exclude for ${days} days? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/self-exclude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });

      if (res.ok) {
        showToast(`Self-exclusion activated for ${days} days`, 'success');
        router.push('/');
      } else {
        showToast('Failed to activate self-exclusion', 'error');
      }
    } catch {
      showToast('Failed to activate self-exclusion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCoolOff = async (hours: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/cool-off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      });

      if (res.ok) {
        showToast(`Cooling off period activated for ${hours} hours`, 'success');
        router.push('/');
      } else {
        showToast('Failed to activate cooling off', 'error');
      }
    } catch {
      showToast('Failed to activate cooling off', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 safe-area-top bg-gray-900/95 backdrop-blur-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-lg font-bold">Responsible Gambling</h1>
            <p className="text-xs text-white/60">Manage your limits</p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-400">Stay in Control</h3>
              <p className="text-sm text-white/70 mt-1">
                Set personal limits to help manage your gambling. Changes to limits may take 24 hours to remove but apply immediately when set.
              </p>
            </div>
          </div>
        </div>

        {/* Deposit Limits */}
        <section className="bg-gray-800/50 rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-400" />
            Deposit Limits
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Daily Limit</label>
              <div className="flex gap-2 flex-wrap">
                {DEPOSIT_LIMITS.map((limit) => (
                  <button
                    key={limit ?? 'none'}
                    onClick={() => setSettings({ ...settings, depositLimitDaily: limit })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      settings.depositLimitDaily === limit
                        ? 'bg-green-500 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {limit ? `$${limit}` : 'No Limit'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Weekly Limit</label>
              <div className="flex gap-2 flex-wrap">
                {DEPOSIT_LIMITS.map((limit) => (
                  <button
                    key={limit ?? 'none'}
                    onClick={() => setSettings({ ...settings, depositLimitWeekly: limit })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      settings.depositLimitWeekly === limit
                        ? 'bg-green-500 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {limit ? `$${limit}` : 'No Limit'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Monthly Limit</label>
              <div className="flex gap-2 flex-wrap">
                {DEPOSIT_LIMITS.map((limit) => (
                  <button
                    key={limit ?? 'none'}
                    onClick={() => setSettings({ ...settings, depositLimitMonthly: limit })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      settings.depositLimitMonthly === limit
                        ? 'bg-green-500 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {limit ? `$${limit}` : 'No Limit'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Loss Limits */}
        <section className="bg-gray-800/50 rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Loss Limits
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Daily Loss Limit</label>
              <div className="flex gap-2 flex-wrap">
                {LOSS_LIMITS.map((limit) => (
                  <button
                    key={limit ?? 'none'}
                    onClick={() => setSettings({ ...settings, lossLimitDaily: limit })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      settings.lossLimitDaily === limit
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {limit ? `$${limit}` : 'No Limit'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Weekly Loss Limit</label>
              <div className="flex gap-2 flex-wrap">
                {LOSS_LIMITS.map((limit) => (
                  <button
                    key={limit ?? 'none'}
                    onClick={() => setSettings({ ...settings, lossLimitWeekly: limit })}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                      settings.lossLimitWeekly === limit
                        ? 'bg-yellow-500 text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    )}
                  >
                    {limit ? `$${limit}` : 'No Limit'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Session Time Limit */}
        <section className="bg-gray-800/50 rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Session Time Limit
          </h2>

          <p className="text-sm text-white/60 mb-3">
            Get reminded when you've been playing for too long
          </p>

          <div className="flex gap-2 flex-wrap">
            {SESSION_LIMITS.map((limit) => (
              <button
                key={limit ?? 'none'}
                onClick={() => setSettings({ ...settings, sessionTimeLimit: limit })}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  settings.sessionTimeLimit === limit
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {limit ? `${limit} min` : 'No Limit'}
              </button>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save Settings'}
        </motion.button>

        {/* Cooling Off Period */}
        <section className="bg-gray-800/50 rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            Take a Break
          </h2>
          <p className="text-sm text-white/60 mb-4">
            Temporarily suspend your account. You won't be able to play during this period.
          </p>

          {!showCoolOff ? (
            <button
              onClick={() => setShowCoolOff(true)}
              className="w-full py-3 rounded-xl bg-orange-500/20 text-orange-400 font-medium hover:bg-orange-500/30 transition-all"
            >
              Take a Cooling Off Period
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-white/80 mb-2">Choose duration:</p>
              <div className="grid grid-cols-3 gap-2">
                {[24, 48, 72, 168, 336, 720].map((hours) => (
                  <button
                    key={hours}
                    onClick={() => handleCoolOff(hours)}
                    disabled={loading}
                    className="py-2 rounded-lg bg-orange-500/20 text-orange-400 text-sm font-medium hover:bg-orange-500/30"
                  >
                    {hours < 168 ? `${hours}h` : `${Math.floor(hours / 24)} days`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCoolOff(false)}
                className="w-full py-2 text-white/60 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {/* Self-Exclusion */}
        <section className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-red-400">
            <Ban className="w-5 h-5" />
            Self-Exclusion
          </h2>
          <p className="text-sm text-white/60 mb-4">
            Permanently exclude yourself from playing. This action cannot be reversed during the exclusion period.
          </p>

          {!showSelfExclude ? (
            <button
              onClick={() => setShowSelfExclude(true)}
              className="w-full py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition-all"
            >
              Self-Exclude My Account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-400 font-medium mb-2">
                Warning: This will immediately lock your account!
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[30, 90, 180, 365].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleSelfExclude(days)}
                    disabled={loading}
                    className="py-3 rounded-lg bg-red-500/30 text-red-400 font-medium hover:bg-red-500/40"
                  >
                    {days} days
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSelfExclude(false)}
                className="w-full py-2 text-white/60 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {/* Help Resources */}
        <section className="bg-gray-800/50 rounded-2xl p-4">
          <h2 className="text-lg font-bold mb-3">Need Help?</h2>
          <div className="space-y-3">
            <a
              href="https://www.ncpgambling.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <p className="font-medium">National Council on Problem Gambling</p>
              <p className="text-sm text-white/60">1-800-522-4700</p>
            </a>
            <a
              href="https://www.gamblersanonymous.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
            >
              <p className="font-medium">Gamblers Anonymous</p>
              <p className="text-sm text-white/60">Find local meetings</p>
            </a>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
