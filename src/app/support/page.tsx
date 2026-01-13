'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, ChevronDown, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/BottomNav';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Simply connect your World App wallet and verify with World ID. Your account is automatically created and linked to your World ID verification.'
  },
  {
    category: 'Getting Started',
    question: 'What is World ID verification?',
    answer: 'World ID is a privacy-preserving identity protocol. It verifies you are a unique human without revealing your personal information. This prevents duplicate accounts and ensures fair play.'
  },
  {
    category: 'Getting Started',
    question: 'Is WorldVegas legal?',
    answer: 'WorldVegas operates on the World Chain blockchain. Users are responsible for ensuring online gambling is legal in their jurisdiction. We do not accept users from restricted regions.'
  },

  // Deposits & Withdrawals
  {
    category: 'Deposits & Withdrawals',
    question: 'How do I deposit?',
    answer: 'Go to the Wallet page and tap "Deposit". Choose WLD or USDC, enter the amount, and confirm in your World App. Deposits are instant once confirmed on-chain.'
  },
  {
    category: 'Deposits & Withdrawals',
    question: 'How do I withdraw?',
    answer: 'Go to Wallet > Withdraw. Enter the amount and confirm. Withdrawals are processed within 24 hours. Large withdrawals may require additional verification.'
  },
  {
    category: 'Deposits & Withdrawals',
    question: 'What are the minimum/maximum limits?',
    answer: 'Minimum deposit: 0.1 WLD/USDC. Minimum withdrawal: 0.1 WLD/USDC. Maximum withdrawal: 1000 per transaction. You can set personal limits in Responsible Gambling settings.'
  },
  {
    category: 'Deposits & Withdrawals',
    question: 'Are there any fees?',
    answer: 'WorldVegas does not charge deposit or withdrawal fees. However, blockchain network fees (gas) apply to all transactions.'
  },

  // Games
  {
    category: 'Games',
    question: 'What games are available?',
    answer: 'We offer Slots, Blackjack, Aviator, Coin Flip, Dice, Roulette, and Mines. More games are coming soon!'
  },
  {
    category: 'Games',
    question: 'What is the house edge?',
    answer: 'House edge varies by game: Slots (2-5%), Blackjack (0.5% with basic strategy), Coin Flip (2.5%), Dice (2%), Roulette (2.7%), Aviator (3%), Mines (3%).'
  },
  {
    category: 'Games',
    question: 'Are the games fair?',
    answer: 'Yes! All games use provably fair technology. Before each round, you receive a server seed hash. After the game, the actual server seed is revealed so you can verify the outcome was predetermined and fair.'
  },
  {
    category: 'Games',
    question: 'How do I verify game results?',
    answer: 'Each game result includes the server seed, client seed, and nonce. You can use any HMAC-SHA256 calculator to verify the outcome matches. We also provide a verification tool in your game history.'
  },

  // Account & Security
  {
    category: 'Account & Security',
    question: 'How do I protect my account?',
    answer: 'Your account is protected by World ID verification and your wallet signature. Never share your wallet seed phrase. Enable device verification for additional security.'
  },
  {
    category: 'Account & Security',
    question: 'Can I have multiple accounts?',
    answer: 'No. Each person can only have one account, enforced by World ID. Multiple accounts will result in all accounts being banned and funds forfeited.'
  },
  {
    category: 'Account & Security',
    question: 'What if I lose access to my wallet?',
    answer: 'If you recover your wallet using your seed phrase, you can access your WorldVegas account. If you create a new wallet, you\'ll need to verify with World ID again to link it.'
  },

  // Responsible Gambling
  {
    category: 'Responsible Gambling',
    question: 'How do I set betting limits?',
    answer: 'Go to Profile > Responsible Gambling. You can set daily, weekly, and monthly deposit limits, loss limits, and session time limits.'
  },
  {
    category: 'Responsible Gambling',
    question: 'How does self-exclusion work?',
    answer: 'Self-exclusion locks your account for 30 days to 1 year. You cannot play during this period and the exclusion cannot be reversed early. Use this if you need a break from gambling.'
  },
  {
    category: 'Responsible Gambling',
    question: 'Where can I get help for gambling problems?',
    answer: 'We link to resources like the National Council on Problem Gambling (1-800-522-4700) and Gamblers Anonymous. You can also contact our support team for assistance.'
  },
];

const categories = [...new Set(faqs.map(f => f.category))];

export default function SupportPage() {
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFAQs = selectedCategory === 'All'
    ? faqs
    : faqs.filter(f => f.category === selectedCategory);

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
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold">Help & Support</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Contact Options */}
        <section>
          <h2 className="text-lg font-bold mb-3">Contact Us</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="mailto:support@worldvegas.app"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-xs text-white/60">24-48h response</p>
              </div>
            </a>
            <a
              href="https://t.me/worldvegas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl bg-gray-800/50 hover:bg-gray-800 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-medium">Telegram</p>
                <p className="text-xs text-white/60">Community chat</p>
              </div>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <h2 className="text-lg font-bold mb-3">Frequently Asked Questions</h2>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
            <button
              onClick={() => setSelectedCategory('All')}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                selectedCategory === 'All'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFAQ === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4">
                        <p className="text-sm text-white/70 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-lg font-bold mb-3">Quick Links</h2>
          <div className="space-y-2">
            <a
              href="/legal/terms"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all"
            >
              <span>Terms of Service</span>
              <ExternalLink className="w-4 h-4 text-white/50" />
            </a>
            <a
              href="/legal/privacy"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all"
            >
              <span>Privacy Policy</span>
              <ExternalLink className="w-4 h-4 text-white/50" />
            </a>
            <a
              href="/settings/responsible-gambling"
              className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all"
            >
              <span>Responsible Gambling</span>
              <ExternalLink className="w-4 h-4 text-white/50" />
            </a>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
