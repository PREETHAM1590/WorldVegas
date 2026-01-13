'use client';

import { ReactNode, useEffect, useState } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

interface MiniKitProviderProps {
  children: ReactNode;
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initMiniKit = async () => {
      try {
        // Initialize MiniKit with app ID from environment
        const appId = process.env.NEXT_PUBLIC_APP_ID;
        if (!appId) {
          console.error('NEXT_PUBLIC_APP_ID is not set');
          return;
        }

        MiniKit.install(appId);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize MiniKit:', error);
      }
    };

    initMiniKit();
  }, []);

  // On web, we render immediately; on World App, wait for init
  if (typeof window !== 'undefined' && !MiniKit.isInstalled() && !isInitialized) {
    // Still render children for development/web preview
  }

  return <>{children}</>;
}

export function useMiniKit() {
  const [isReady, setIsReady] = useState(false);
  const [isWorldApp, setIsWorldApp] = useState(false);

  useEffect(() => {
    setIsReady(MiniKit.isInstalled());
    setIsWorldApp(MiniKit.isInstalled());
  }, []);

  return { isReady, isWorldApp, MiniKit };
}
