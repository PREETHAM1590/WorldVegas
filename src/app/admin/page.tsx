'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Gamepad2,
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    new: number;
    active: number;
  };
  transactions: {
    total: number;
    pendingWithdrawals: number;
    deposits: { count: number; total: number };
    withdrawals: { count: number; total: number };
  };
  gaming: {
    totalGames: number;
    totalBets: number;
    totalPayouts: number;
    houseProfit: number;
    houseEdge: string;
  };
  gameDistribution: Array<{ game: string; count: number; wagered: number }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    userAddress: string;
    createdAt: string;
  }>;
  topPlayers: Array<{
    id: string;
    address: string;
    totalWagered: number;
    totalWon: number;
    gamesPlayed: number;
    netProfit: number;
  }>;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  change?: number;
  icon: typeof Users;
  color: string;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm mt-2 ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {change >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('24h');

  useEffect(() => {
    fetchStats();
  }, [range]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?range=${range}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {['24h', '7d', '30d', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                range === r
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {r === 'all' ? 'All Time' : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.users.total.toLocaleString() || '0'}
          icon={Users}
          color="bg-blue-600"
        />
        <StatCard
          title="Active Users"
          value={stats?.users.active.toLocaleString() || '0'}
          icon={Activity}
          color="bg-green-600"
        />
        <StatCard
          title="Total Deposits"
          value={`$${(stats?.transactions.deposits.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-purple-600"
        />
        <StatCard
          title="House Profit"
          value={`$${(stats?.gaming.houseProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="bg-orange-600"
        />
      </div>

      {/* Gaming Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            Gaming Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Games</span>
              <span className="font-medium">{stats?.gaming.totalGames.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Wagered</span>
              <span className="font-medium">${stats?.gaming.totalBets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Payouts</span>
              <span className="font-medium">${stats?.gaming.totalPayouts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">House Edge</span>
              <span className="font-medium text-green-400">{stats?.gaming.houseEdge}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Game Distribution</h3>
          <div className="space-y-3">
            {stats?.gameDistribution.slice(0, 5).map((game) => (
              <div key={game.game} className="flex items-center justify-between">
                <span className="text-gray-400">{game.game}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{game.count} plays</span>
                  <span className="font-medium">${game.wagered.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Pending Actions
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending Withdrawals</span>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                {stats?.transactions.pendingWithdrawals || 0}
              </span>
            </div>
            <a
              href="/admin/transactions?status=PENDING"
              className="block w-full py-2 text-center bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
            >
              View Pending Transactions
            </a>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Top Players */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {stats?.recentTransactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'DEPOSIT' ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? (
                      <ArrowDownRight className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{tx.userAddress}</p>
                    <p className="text-sm text-gray-400">{tx.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {tx.type === 'DEPOSIT' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm ${
                      tx.status === 'COMPLETED'
                        ? 'text-green-400'
                        : tx.status === 'PENDING'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/admin/transactions"
            className="block p-4 text-center text-purple-400 hover:text-purple-300 border-t border-gray-700"
          >
            View All Transactions
          </a>
        </div>

        {/* Top Players */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold">Top Players (by Wagered)</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {stats?.topPlayers.slice(0, 5).map((player, index) => (
              <div key={player.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{player.address}</p>
                    <p className="text-sm text-gray-400">{player.gamesPlayed} games</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${player.totalWagered.toLocaleString()}</p>
                  <p
                    className={`text-sm ${
                      player.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {player.netProfit >= 0 ? '+' : ''}${player.netProfit.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/admin/users"
            className="block p-4 text-center text-purple-400 hover:text-purple-300 border-t border-gray-700"
          >
            View All Users
          </a>
        </div>
      </div>
    </div>
  );
}
