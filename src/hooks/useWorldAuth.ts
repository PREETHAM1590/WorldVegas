'use client';

import { MiniKit, WalletAuthInput, VerificationLevel } from '@worldcoin/minikit-js';
import { useUserStore } from '@/stores/userStore';
import { useCallback, useState } from 'react';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export function useWorldAuth() {
  const { setUser, setLoading, setError, logout: storeLogout } = useUserStore();
  const [nonce, setNonce] = useState<string>('');

  /**
   * Sign in with World ID using wallet authentication (SIWE)
   * Flow:
   * 1. Get nonce from server (stored in HTTP-only cookie)
   * 2. Request wallet auth from MiniKit
   * 3. Send signed message to server for verification
   * 4. Server verifies signature and creates session
   */
  const signInWithWorldID = useCallback(async (): Promise<AuthResult> => {
    try {
      setLoading(true);
      setError(null);

      // Check if MiniKit is available
      if (!MiniKit.isInstalled()) {
        throw new Error('Please open this app in World App');
      }

      // Step 1: Get nonce from server
      const nonceResponse = await fetch('/api/auth/nonce');
      if (!nonceResponse.ok) {
        throw new Error('Failed to get authentication nonce');
      }
      const { nonce: serverNonce } = await nonceResponse.json();
      setNonce(serverNonce);

      // Step 2: Request wallet authentication from World App
      const walletAuthInput: WalletAuthInput = {
        nonce: serverNonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        statement: 'Sign in to WorldVegas - Provably Fair Casino',
        notBefore: new Date(),
      };

      // Use the synchronous command that triggers World App UI
      const { commandPayload, finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthInput);

      // Check if user cancelled or error occurred
      if (finalPayload.status === 'error') {
        throw new Error('Authentication was cancelled or failed');
      }

      // Step 3: Verify signature on server
      const verifyResponse = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload,
          nonce: serverNonce,
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success || !verifyResult.isValid) {
        throw new Error(verifyResult.error || 'Signature verification failed');
      }

      // Step 4: Update user state
      setUser({
        address: verifyResult.address,
        nullifierHash: '',
        verificationLevel: 'device',
        isVerified: true,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  /**
   * Verify action with World ID (for high-stakes actions)
   * Uses incognito actions to verify humanity without revealing identity
   */
  const verifyAction = useCallback(
    async (action: string, signal?: string): Promise<AuthResult> => {
      try {
        setLoading(true);

        if (!MiniKit.isInstalled()) {
          throw new Error('Please open this app in World App');
        }

        // Request World ID verification
        const { finalPayload } = await MiniKit.commandsAsync.verify({
          action,
          signal,
          verification_level: VerificationLevel.Orb, // Require orb verification for high-stakes
        });

        if (finalPayload.status === 'error') {
          throw new Error('Verification was cancelled or failed');
        }

        // Verify proof on server
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: finalPayload,
            action,
            signal,
          }),
        });

        const verifyResult = await verifyResponse.json();

        if (!verifyResult.success) {
          throw new Error(verifyResult.error || 'Verification failed');
        }

        // Update user verification level
        const { user } = useUserStore.getState();
        if (user) {
          setUser({
            ...user,
            nullifierHash: verifyResult.nullifierHash,
            verificationLevel: verifyResult.verificationLevel as 'orb' | 'device' | 'phone',
          });
        }

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Verification failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  /**
   * Logout - clear session
   */
  const logout = useCallback(async () => {
    try {
      // Clear server-side session
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue with client-side logout even if server call fails
    }

    storeLogout();
    setNonce('');
  }, [storeLogout]);

  return {
    signInWithWorldID,
    verifyAction,
    logout,
    nonce,
  };
}
