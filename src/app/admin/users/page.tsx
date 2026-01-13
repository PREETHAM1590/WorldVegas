'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Lock,
  Unlock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface User {
  id: string;
  address: string;
  fullAddress: string;
  wldBalance: number;
  usdcBalance: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  gamesPlayed: number;
  transactionCount: number;
  gameCount: number;
  isAccountLocked: boolean;
  selfExcludedUntil: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        filter,
      });
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function performAction(action: string, data?: Record<string, unknown>) {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: selectedUser.id, data }),
      });

      const result = await res.json();
      if (result.success) {
        // Refresh users
        fetchUsers();
        setSelectedUser(null);
      } else {
        alert(result.error || 'Action failed');
      }
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-gray-400">{pagination.total} total users</span>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by address..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Users</option>
          <option value="active">Active (7d)</option>
          <option value="locked">Locked</option>
          <option value="excluded">Self-Excluded</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Address</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">WLD</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">USDC</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Wagered</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Net P/L</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-mono text-sm">{user.address}</p>
                        <p className="text-xs text-gray-500">{user.gamesPlayed} games</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {user.wldBalance.toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {user.usdcBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      ${user.totalWagered.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono ${
                        user.netProfit >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {user.netProfit >= 0 ? '+' : ''}${user.netProfit.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {user.isAccountLocked ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                          Locked
                        </span>
                      ) : user.selfExcludedUntil ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                          Excluded
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Manage User</h3>
            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-400">
                Address: <span className="text-white font-mono">{selectedUser.address}</span>
              </p>
              <p className="text-sm text-gray-400">
                WLD Balance: <span className="text-white">{selectedUser.wldBalance.toFixed(4)}</span>
              </p>
              <p className="text-sm text-gray-400">
                USDC Balance: <span className="text-white">{selectedUser.usdcBalance.toFixed(2)}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => performAction(selectedUser.isAccountLocked ? 'unlock' : 'lock')}
                disabled={actionLoading}
                className={`w-full py-2 rounded flex items-center justify-center gap-2 ${
                  selectedUser.isAccountLocked
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedUser.isAccountLocked ? (
                  <>
                    <Unlock className="w-4 h-4" />
                    Unlock Account
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Lock Account
                  </>
                )}
              </button>

              {selectedUser.selfExcludedUntil && (
                <button
                  onClick={() => performAction('removeSelfExclusion')}
                  disabled={actionLoading}
                  className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 rounded flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Remove Self-Exclusion
                </button>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  id="adjustAmount"
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  id="adjustCurrency"
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USDC">USDC</option>
                  <option value="WLD">WLD</option>
                </select>
                <button
                  onClick={() => {
                    const amount = parseFloat(
                      (document.getElementById('adjustAmount') as HTMLInputElement).value
                    );
                    const currency = (document.getElementById('adjustCurrency') as HTMLSelectElement)
                      .value;
                    if (!isNaN(amount)) {
                      performAction('adjustBalance', { amount, currency });
                    }
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                >
                  <DollarSign className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
