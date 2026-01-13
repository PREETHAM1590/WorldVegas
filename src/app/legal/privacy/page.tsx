'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/BottomNav';

export default function PrivacyPage() {
  const router = useRouter();

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
            <Shield className="w-5 h-5 text-green-400" />
            <h1 className="text-lg font-bold">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="prose prose-invert max-w-none">
          <p className="text-white/60 text-sm mb-6">Last updated: January 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p><strong>World ID Data:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nullifier hash (anonymous identifier)</li>
                <li>Verification level (device/orb)</li>
                <li>Wallet address</li>
              </ul>
              <p className="mt-3"><strong>Gameplay Data:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Game results and bet history</li>
                <li>Transaction history</li>
                <li>Session information</li>
              </ul>
              <p className="mt-3"><strong>Technical Data:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Device type and browser</li>
                <li>IP address (for security)</li>
                <li>Usage patterns</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Provide and improve our services</li>
                <li>Process deposits and withdrawals</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Enforce responsible gambling measures</li>
                <li>Comply with legal requirements</li>
                <li>Communicate important updates</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">3. Data Security</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              We implement industry-standard security measures including encryption, secure sessions,
              and regular security audits. Your wallet private keys are never stored on our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">4. Data Sharing</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>We do not sell your personal data. We may share data with:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>World ID for verification purposes</li>
                <li>Payment processors for transactions</li>
                <li>Law enforcement when legally required</li>
                <li>Third-party auditors for fairness verification</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">5. Blockchain Data</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Transactions on World Chain are public and immutable. Your wallet address and
              transaction history are visible on the blockchain. This is inherent to blockchain
              technology and not within our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">6. Your Rights</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Access your personal data</li>
                <li>Request data deletion (subject to legal requirements)</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">7. Data Retention</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              We retain your data for as long as your account is active. After account closure,
              we retain transaction records for 7 years to comply with financial regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">8. Cookies and Tracking</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              We use essential cookies for authentication and session management. We do not use
              third-party advertising trackers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">9. Children's Privacy</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Our service is not intended for users under 18. We do not knowingly collect data
              from minors. If we discover we have collected data from a minor, we will delete it.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">10. Changes to This Policy</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              We may update this policy periodically. We will notify you of significant changes
              through the app or email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">11. Contact Us</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              For privacy-related inquiries, contact us at privacy@worldvegas.app
            </p>
          </section>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
