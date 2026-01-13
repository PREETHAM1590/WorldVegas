'use client';

import { MiniKit, Tokens, PayCommandInput, tokenToDecimals } from '@worldcoin/minikit-js';
import { useUserStore } from '@/stores/userStore';
import { useCallback, useState } from 'react';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Treasury address (replace with your actual address)
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000';

export function usePayments() {
  const { addBalance, user } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Deposit funds to casino
   */
  const deposit = useCallback(
    async (amount: number, token: 'WLD' | 'USDC'): Promise<PaymentResult> => {
      try {
        setIsProcessing(true);

        if (!MiniKit.isInstalled()) {
          throw new Error('Please open this app in World App');
        }

        if (!user) {
          throw new Error('Please sign in first');
        }

        // Initialize payment on server
        const initResponse = await fetch('/api/payment/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.toString(),
            token,
            userId: user.address,
          }),
        });

        const initResult = await initResponse.json();
        if (!initResult.success) {
          throw new Error(initResult.error || 'Failed to initialize payment');
        }

        const paymentId = initResult.paymentId;

        // Convert amount to proper token decimals
        const tokenDecimals = token === 'USDC' ? 6 : 18;
        const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, tokenDecimals))).toString();

        // Create pay command input
        const payInput: PayCommandInput = {
          reference: paymentId,
          to: TREASURY_ADDRESS,
          tokens: [
            {
              symbol: token === 'WLD' ? Tokens.WLD : Tokens.USDC,
              token_amount: amountInSmallestUnit,
            },
          ],
          description: `WorldVegas Deposit: ${amount} ${token}`,
        };

        // Execute payment through MiniKit
        const { finalPayload } = await MiniKit.commandsAsync.pay(payInput);

        if (finalPayload.status === 'error') {
          throw new Error('Payment was cancelled or failed');
        }

        // Verify payment on server
        const verifyResponse = await fetch('/api/payment/deposit', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            payload: finalPayload,
          }),
        });

        const verifyResult = await verifyResponse.json();
        if (!verifyResult.success) {
          throw new Error(verifyResult.error || 'Payment verification failed');
        }

        // Update local balance
        addBalance(token.toLowerCase() as 'wld' | 'usdc', amount);

        return {
          success: true,
          transactionId: verifyResult.transactionId,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment failed';
        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [user, addBalance]
  );

  /**
   * Withdraw funds from casino
   */
  const withdraw = useCallback(
    async (amount: number, token: 'WLD' | 'USDC'): Promise<PaymentResult> => {
      try {
        setIsProcessing(true);

        if (!user) {
          throw new Error('Please sign in first');
        }

        const response = await fetch('/api/payment/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.toString(),
            token,
            userId: user.address,
            toAddress: user.address,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Withdrawal failed');
        }

        return {
          success: true,
          transactionId: result.transactionId,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Withdrawal failed';
        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [user]
  );

  return {
    deposit,
    withdraw,
    isProcessing,
  };
}
