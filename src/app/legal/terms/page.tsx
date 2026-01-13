'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/navigation/BottomNav';

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold">Terms of Service</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="prose prose-invert max-w-none">
          <p className="text-white/60 text-sm mb-6">Last updated: January 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              By accessing or using WorldVegas ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">2. Eligibility</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>To use WorldVegas, you must:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Be at least 18 years old (or the legal gambling age in your jurisdiction)</li>
                <li>Have a valid World ID verification</li>
                <li>Not be located in a jurisdiction where online gambling is prohibited</li>
                <li>Not be self-excluded from gambling services</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">3. Account Registration</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>
                Your account is linked to your World ID. You may only have one account per World ID.
                You are responsible for maintaining the security of your account.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">4. Deposits and Withdrawals</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Deposits are processed via World Chain using WLD or USDC tokens</li>
                <li>Minimum deposit: 0.1 WLD/USDC</li>
                <li>Minimum withdrawal: 0.1 WLD/USDC</li>
                <li>Withdrawals are processed within 24 hours</li>
                <li>We reserve the right to verify your identity before processing large withdrawals</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">5. Game Rules</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>
                All games are provably fair using cryptographic verification. Game outcomes are determined
                by server seeds and client seeds using HMAC-SHA256. You can verify any game result.
              </p>
              <p>
                House edge varies by game (2-5%). Specific odds and payouts are displayed within each game.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">6. Responsible Gambling</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>We are committed to responsible gambling. You can:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Set deposit, loss, and session time limits</li>
                <li>Take a cooling-off period (24 hours to 30 days)</li>
                <li>Self-exclude for 30 days to 1 year</li>
                <li>Access gambling addiction resources</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">7. Prohibited Activities</h2>
            <div className="text-white/80 text-sm leading-relaxed space-y-2">
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Use bots, scripts, or automated systems</li>
                <li>Exploit bugs or vulnerabilities</li>
                <li>Engage in money laundering</li>
                <li>Create multiple accounts</li>
                <li>Collude with other players</li>
                <li>Use the service for illegal purposes</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">8. Account Suspension</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms,
              engage in suspicious activity, or are required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              WorldVegas is provided "as is" without warranties. We are not liable for any losses
              incurred while using the service, including gambling losses, technical issues, or
              blockchain transaction failures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">10. Dispute Resolution</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Any disputes should first be addressed through our customer support. If unresolved,
              disputes will be settled through binding arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">11. Changes to Terms</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              We may update these terms at any time. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">12. Contact</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              For questions about these terms, contact us at support@worldvegas.app
            </p>
          </section>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
