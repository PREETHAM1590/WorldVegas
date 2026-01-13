'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminUser {
  id: string;
  username: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();

      if (data.success && data.admin) {
        setAdmin(data.admin);
      } else if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } catch {
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAdmin(null);
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Login page doesn't need admin check
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-xl font-bold text-purple-400">WorldVegas Admin</span>
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Dashboard
                </a>
                <a
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/users' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Users
                </a>
                <a
                  href="/admin/transactions"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/transactions' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Transactions
                </a>
                <a
                  href="/admin/bonuses"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/bonuses' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Bonuses
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {admin.username} ({admin.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
