'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Gift,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Tag,
} from 'lucide-react';

interface Bonus {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  type: string;
  amount: number | null;
  percentage: number | null;
  maxBonus: number | null;
  minDeposit: number | null;
  wagerRequirement: number;
  startsAt: string;
  expiresAt: string | null;
  usageLimit: number | null;
  perUserLimit: number;
  isActive: boolean;
  vipLevelRequired: number | null;
  claimCount: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const BONUS_TYPES = [
  'WELCOME',
  'DEPOSIT_MATCH',
  'FREE_SPINS',
  'CASHBACK',
  'RELOAD',
  'VIP_REWARD',
  'REFERRAL',
  'CUSTOM',
];

export default function AdminBonusesPage() {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'DEPOSIT_MATCH',
    amount: '',
    percentage: '',
    maxBonus: '',
    minDeposit: '',
    wagerRequirement: '30',
    expiresAt: '',
    usageLimit: '',
    perUserLimit: '1',
    vipLevelRequired: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBonuses();
  }, [pagination.page]);

  async function fetchBonuses() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const res = await fetch(`/api/admin/bonuses?${params}`);
      const data = await res.json();

      if (data.success) {
        setBonuses(data.bonuses);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch bonuses:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingBonus(null);
    setFormData({
      name: '',
      description: '',
      code: '',
      type: 'DEPOSIT_MATCH',
      amount: '',
      percentage: '',
      maxBonus: '',
      minDeposit: '',
      wagerRequirement: '30',
      expiresAt: '',
      usageLimit: '',
      perUserLimit: '1',
      vipLevelRequired: '',
      isActive: true,
    });
    setShowModal(true);
  }

  function openEditModal(bonus: Bonus) {
    setEditingBonus(bonus);
    setFormData({
      name: bonus.name,
      description: bonus.description || '',
      code: bonus.code || '',
      type: bonus.type,
      amount: bonus.amount?.toString() || '',
      percentage: bonus.percentage?.toString() || '',
      maxBonus: bonus.maxBonus?.toString() || '',
      minDeposit: bonus.minDeposit?.toString() || '',
      wagerRequirement: bonus.wagerRequirement.toString(),
      expiresAt: bonus.expiresAt ? new Date(bonus.expiresAt).toISOString().slice(0, 16) : '',
      usageLimit: bonus.usageLimit?.toString() || '',
      perUserLimit: bonus.perUserLimit.toString(),
      vipLevelRequired: bonus.vipLevelRequired?.toString() || '',
      isActive: bonus.isActive,
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const method = editingBonus ? 'PUT' : 'POST';
      const body = editingBonus ? { ...formData, id: editingBonus.id } : formData;

      const res = await fetch('/api/admin/bonuses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        fetchBonuses();
      } else {
        alert(result.error || 'Failed to save bonus');
      }
    } catch {
      alert('Failed to save bonus');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(bonusId: string) {
    if (!confirm('Are you sure you want to delete this bonus?')) return;

    try {
      const res = await fetch(`/api/admin/bonuses?id=${bonusId}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        fetchBonuses();
      } else {
        alert(result.error || 'Failed to delete bonus');
      }
    } catch {
      alert('Failed to delete bonus');
    }
  }

  async function toggleActive(bonus: Bonus) {
    try {
      const res = await fetch('/api/admin/bonuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bonus.id, isActive: !bonus.isActive }),
      });

      const result = await res.json();
      if (result.success) {
        fetchBonuses();
      } else {
        alert(result.error || 'Failed to update bonus');
      }
    } catch {
      alert('Failed to update bonus');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bonuses & Promotions</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Create Bonus
        </button>
      </div>

      {/* Bonuses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : bonuses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No bonuses created yet
          </div>
        ) : (
          bonuses.map((bonus) => (
            <div
              key={bonus.id}
              className={`bg-gray-800 rounded-xl border ${
                bonus.isActive ? 'border-gray-700' : 'border-red-500/30'
              } overflow-hidden`}
            >
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{bonus.name}</h3>
                      <p className="text-sm text-gray-400">{bonus.type}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      bonus.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {bonus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {bonus.code && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <code className="text-sm bg-gray-700 px-2 py-1 rounded">{bonus.code}</code>
                  </div>
                )}

                <div className="text-sm text-gray-400">
                  {bonus.percentage && <p>{bonus.percentage}% match bonus</p>}
                  {bonus.amount && <p>${bonus.amount} fixed bonus</p>}
                  {bonus.maxBonus && <p>Max: ${bonus.maxBonus}</p>}
                  <p>{bonus.wagerRequirement}x wagering required</p>
                </div>

                <div className="flex justify-between items-center text-sm pt-2">
                  <span className="text-gray-500">{bonus.claimCount} claims</span>
                  {bonus.expiresAt && (
                    <span className="text-yellow-400">
                      Expires: {new Date(bonus.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-700 flex gap-2">
                <button
                  onClick={() => toggleActive(bonus)}
                  className={`flex-1 py-2 rounded text-sm ${
                    bonus.isActive
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                      : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  }`}
                >
                  {bonus.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditModal(bonus)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(bonus.id)}
                  className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            disabled={pagination.page === 1}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-gray-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            disabled={pagination.page >= pagination.pages}
            className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-gray-700 my-8">
            <h3 className="text-lg font-bold mb-6">
              {editingBonus ? 'Edit Bonus' : 'Create Bonus'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {BONUS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Promo Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME50"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fixed Amount ($)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="50"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Bonus ($)</label>
                  <input
                    type="number"
                    value={formData.maxBonus}
                    onChange={(e) => setFormData({ ...formData, maxBonus: e.target.value })}
                    placeholder="500"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={formData.minDeposit}
                    onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Wagering Requirement (x)</label>
                  <input
                    type="number"
                    value={formData.wagerRequirement}
                    onChange={(e) => setFormData({ ...formData, wagerRequirement: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Expires At</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBonus ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
