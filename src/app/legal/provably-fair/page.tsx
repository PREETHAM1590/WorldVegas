'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Lock,
  RefreshCw,
  Eye,
  Hash,
  Code,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    step: 1,
    title: 'Server Seed Generation',
    description: 'Before each game round, our server generates a cryptographically secure random seed using industry-standard algorithms.',
    icon: Lock,
    detail: 'We use crypto.getRandomValues() which provides cryptographically secure random numbers.',
  },
  {
    step: 2,
    title: 'Commitment Hash',
    description: 'The server creates a SHA-256 hash of this seed and shows it to you BEFORE you place your bet.',
    icon: Hash,
    detail: 'This hash acts as a binding commitment - we cannot change the seed after showing you the hash.',
  },
  {
    step: 3,
    title: 'Client Seed',
    description: 'You can optionally provide your own seed, or we generate one for you. This adds your own randomness.',
    icon: RefreshCw,
    detail: 'Your client seed ensures that we cannot predict the outcome even with our server seed.',
  },
  {
    step: 4,
    title: 'Outcome Generation',
    description: 'The final outcome is calculated using HMAC-SHA256 combining both seeds and a nonce counter.',
    icon: Code,
    detail: 'Formula: HMAC-SHA256(serverSeed, clientSeed:nonce)',
  },
  {
    step: 5,
    title: 'Verification',
    description: 'After the game, we reveal the original server seed. You can verify the hash matches and recalculate the outcome.',
    icon: Eye,
    detail: 'Use any HMAC-SHA256 calculator to verify the outcome independently.',
  },
];

export default function ProvablyFairPage() {
  const [copied, setCopied] = useState(false);

  const sampleCode = `// Example verification code
const CryptoJS = require('crypto-js');

// Your game data
const serverSeed = '...revealed after game...';
const clientSeed = 'your-client-seed';
const nonce = 1;

// Verify server seed matches hash
const hash = CryptoJS.SHA256(serverSeed).toString();
console.log('Hash matches:', hash === originalHash);

// Regenerate outcome
const message = \`\${clientSeed}:\${nonce}\`;
const hmac = CryptoJS.HmacSHA256(message, serverSeed).toString();
const outcome = parseInt(hmac.slice(0, 8), 16) % 10001;
console.log('Outcome:', outcome);`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profile">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-[#A3A3A3]" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Provably Fair</h1>
            <p className="text-xs text-[#666666]">How we ensure fair gaming</p>
          </div>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1A1500] via-[#2D2300] to-[#1A1500] p-6 mb-6"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.15)_0%,transparent_60%)] pointer-events-none" />
          <div className="absolute -right-6 -top-6 opacity-30">
            <span className="text-6xl">🔐</span>
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-[0_0_30px_-5px_rgba(212,175,55,0.5)]">
              <Shield className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">100% Verifiable</h2>
              <p className="text-sm text-[#A3A3A3]">
                Every game outcome can be independently verified by you
              </p>
            </div>
          </div>
        </motion.div>

        {/* What is Provably Fair */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 rounded-xl bg-[#161616] border border-[#2A2A2A] mb-6"
        >
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#D4AF37]" />
            What is Provably Fair?
          </h3>
          <p className="text-sm text-[#A3A3A3] leading-relaxed">
            Provably fair is a cryptographic method that allows you to verify that game outcomes
            are truly random and were not manipulated. Using commitment schemes and cryptographic
            hashes, we can prove that:
          </p>
          <ul className="mt-3 space-y-2">
            {[
              'The outcome was determined BEFORE you placed your bet',
              'We cannot change the outcome after seeing your bet',
              'You can independently verify every single game',
              'No backdoors or hidden manipulation is possible',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#A3A3A3]">
                <CheckCircle className="w-4 h-4 text-[#00C853] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-4">
            How It Works
          </h3>
          <div className="space-y-3">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-[#D4AF37]/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#B8860B]/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                        STEP {step.step}
                      </span>
                      <h4 className="font-semibold text-white">{step.title}</h4>
                    </div>
                    <p className="text-sm text-[#A3A3A3] mb-2">{step.description}</p>
                    <p className="text-xs text-[#666666] italic">{step.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Verification Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <h3 className="text-sm font-semibold text-[#666666] uppercase tracking-wider px-1 mb-4 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Verify It Yourself
          </h3>
          <div className="rounded-xl bg-[#161616] border border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border-b border-[#2A2A2A]">
              <span className="text-xs text-[#666666] font-mono">verification.js</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-xs text-[#A3A3A3] hover:bg-[#333333] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00C853]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </motion.button>
            </div>
            <pre className="p-4 text-xs text-[#A3A3A3] font-mono overflow-x-auto">
              <code>{sampleCode}</code>
            </pre>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {[
            { icon: Shield, label: 'SHA-256 Hashing', description: 'Military-grade encryption' },
            { icon: Lock, label: 'HMAC Authentication', description: 'Tamper-proof results' },
            { icon: RefreshCw, label: 'User Seeds', description: 'Add your own randomness' },
            { icon: Eye, label: 'Open Verification', description: 'Check any game result' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] text-center"
            >
              <item.icon className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="text-[10px] text-[#666666]">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Learn More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30"
        >
          <p className="text-sm text-[#A3A3A3] mb-3">
            Want to learn more about provably fair gaming and cryptographic verification?
          </p>
          <a
            href="https://en.wikipedia.org/wiki/Provably_fair"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#D4AF37] text-sm font-medium hover:underline"
          >
            Read on Wikipedia
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
