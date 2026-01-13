'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Coins } from 'lucide-react';
import { Header } from '@/components/navigation/Header';
import { BottomNav } from '@/components/navigation/BottomNav';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  address: string;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  gamesPlayed: number;
  biggestWin: number;
}

type LeaderboardType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

const TABS: { label: string; value: LeaderboardType }[] = [
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'All Time', value: 'ALL_TIME' },
];

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-300" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-gray-400">#{rank}</span>;
  }
}

function getRankBg(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30';
    default:
      return 'bg-white/5 border-white/10';
  }
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('WEEKLY');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?type=${activeTab}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <Header />

      <div className="flex-1 px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            <h1 className="text-2xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-white/60 text-sm">Compete with other players for glory!</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-3 gap-2 mb-6"
          >
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="w-14 h-14 rounded-full bg-gray-400/20 flex items-center justify-center mb-2">
                <Medal className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-xs text-white/60 truncate w-full text-center">
                {leaderboard[1]?.address}
              </p>
              <p className="text-sm font-bold text-gray-300">
                ${leaderboard[1]?.totalWagered.toLocaleString()}
              </p>
              <div className="w-full h-20 bg-gray-400/20 rounded-t-lg mt-2" />
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 ring-2 ring-yellow-500/50">
                <Crown className="w-7 h-7 text-yellow-400" />
              </div>
              <p className="text-xs text-white/60 truncate w-full text-center">
                {leaderboard[0]?.address}
              </p>
              <p className="text-sm font-bold text-yellow-400">
                ${leaderboard[0]?.totalWagered.toLocaleString()}
              </p>
              <div className="w-full h-28 bg-yellow-500/20 rounded-t-lg mt-2" />
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="w-12 h-12 rounded-full bg-amber-600/20 flex items-center justify-center mb-2">
                <Medal className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-white/60 truncate w-full text-center">
                {leaderboard[2]?.address}
              </p>
              <p className="text-sm font-bold text-amber-500">
                ${leaderboard[2]?.totalWagered.toLocaleString()}
              </p>
              <div className="w-full h-14 bg-amber-600/20 rounded-t-lg mt-2" />
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rankings yet this period</p>
              <p className="text-sm mt-2">Play games to appear on the leaderboard!</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${getRankBg(
                  entry.rank
                )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                  <div>
                    <p className="font-medium">{entry.address}</p>
                    <p className="text-xs text-white/50">{entry.gamesPlayed} games</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold">
                      ${entry.totalWagered.toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      entry.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {entry.netProfit >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>
                      {entry.netProfit >= 0 ? '+' : ''}${entry.netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
