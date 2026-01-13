'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Settings, Shield, Volume2, VolumeX,
  LogOut, ChevronRight, User, Lock, HelpCircle, FileText, Globe, LucideIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useUserStore } from '@/stores/userStore';
import { useSoundSettings } from '@/hooks/useSound';
import { useI18n } from '@/lib/i18n';
import { LanguageSelectorCompact } from '@/components/ui/LanguageSelector';
import { cn } from '@/lib/utils';

interface LinkItem {
  type: 'link';
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
  color: string;
}

interface ToggleItem {
  type: 'toggle';
  icon: LucideIcon;
  label: string;
  description: string;
  action: () => void;
  value: boolean;
  color: string;
}

interface CustomItem {
  type: 'custom';
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  component: React.ReactNode;
}

type SettingItem = LinkItem | ToggleItem | CustomItem;

interface SettingsSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const { enabled: soundEnabled, toggleSound } = useSoundSettings();
  const { t, locale, languages } = useI18n();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isAuthenticated = !!user;
  const address = user?.address;
  const currentLanguage = languages[locale];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const settingsSections: SettingsSection[] = [
    {
      title: t('nav.profile'),
      items: [
        {
          type: 'link',
          icon: User,
          label: t('profile.title'),
          description: t('profile.stats'),
          href: '/profile',
          color: 'text-blue-400',
        },
        {
          type: 'link',
          icon: Shield,
          label: t('responsibleGambling.title'),
          description: t('responsibleGambling.description'),
          href: '/settings/responsible-gambling',
          color: 'text-green-400',
        },
      ],
    },
    {
      title: t('settings.title'),
      items: [
        {
          type: 'custom',
          icon: Globe,
          label: t('settings.language'),
          description: `${currentLanguage.flag} ${currentLanguage.nativeName}`,
          color: 'text-orange-400',
          component: <LanguageSelectorCompact />,
        },
        {
          type: 'toggle',
          icon: soundEnabled ? Volume2 : VolumeX,
          label: t('settings.soundEffects'),
          description: soundEnabled ? 'Enabled' : 'Disabled',
          action: toggleSound,
          value: soundEnabled,
          color: 'text-purple-400',
        },
      ],
    },
    {
      title: t('support.title'),
      items: [
        {
          type: 'link',
          icon: HelpCircle,
          label: t('support.helpCenter'),
          description: t('support.faq'),
          href: '/support',
          color: 'text-cyan-400',
        },
        {
          type: 'link',
          icon: FileText,
          label: 'Terms of Service',
          description: 'Read our terms',
          href: '/legal/terms',
          color: 'text-gray-400',
        },
        {
          type: 'link',
          icon: Lock,
          label: 'Privacy Policy',
          description: 'How we protect your data',
          href: '/legal/privacy',
          color: 'text-gray-400',
        },
      ],
    },
  ];

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
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-white/70" />
            <h1 className="text-lg font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Account Info */}
        {isAuthenticated && address && (
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold">Your Account</p>
                <p className="text-sm text-white/60 truncate">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                Verified
              </div>
            </div>
          </div>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-bold text-white/50 uppercase mb-3 px-1">
              {section.title}
            </h2>
            <div className="bg-gray-800/50 rounded-2xl overflow-hidden">
              {section.items.map((item, index) => (
                <div key={item.label}>
                  {item.type === 'toggle' ? (
                    <button
                      onClick={item.action}
                      className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-white/60">{item.description}</p>
                      </div>
                      <div className={cn(
                        "w-12 h-7 rounded-full transition-colors relative",
                        item.value ? "bg-green-500" : "bg-gray-600"
                      )}>
                        <motion.div
                          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow"
                          animate={{ left: item.value ? '26px' : '4px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </button>
                  ) : item.type === 'custom' ? (
                    <div className="flex items-center gap-4 p-4">
                      <div className={cn("w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-white/60">{item.description}</p>
                      </div>
                      {item.component}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center", item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-white/60">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/30" />
                    </a>
                  )}
                  {index < section.items.length - 1 && (
                    <div className="mx-4 border-b border-white/5" />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Logout Button */}
        {isAuthenticated && (
          <section>
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-red-400">Log Out</p>
                  <p className="text-sm text-white/60">Sign out of your account</p>
                </div>
              </button>
            ) : (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50">
                <p className="text-center font-medium text-red-400 mb-3">
                  Are you sure you want to log out?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-white/10 font-medium hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* App Info */}
        <div className="text-center text-white/30 text-sm pt-4">
          <p>WorldVegas v1.0.0</p>
          <p>Built on World Chain</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
