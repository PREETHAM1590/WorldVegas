'use client';

import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';
import { PredictionMarket } from '@/components/games/PredictionMarket';

export default function MarketsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        <PredictionMarket />
      </div>

      <BottomNav />
    </div>
  );
}
