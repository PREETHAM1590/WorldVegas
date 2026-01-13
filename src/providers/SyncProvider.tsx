'use client';

import { useEffect, ReactNode } from 'react';
import { useSync } from '@/hooks/useSync';
import { useUserStore } from '@/stores/userStore';

/**
 * Provider component that handles database syncing
 * Wraps the app to enable automatic state persistence
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { user } = useUserStore();
  const { loadFromDatabase } = useSync();

  // Initial sync when user is available
  useEffect(() => {
    if (user?.address) {
      loadFromDatabase(user.address);
    }
  }, [user?.address, loadFromDatabase]);

  return <>{children}</>;
}
