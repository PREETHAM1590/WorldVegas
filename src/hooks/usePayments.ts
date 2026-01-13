'use client';

import { MiniKit, Tokens, PayCommandInput } from '@worldcoin/minikit-js';
import { useUserStore } from '@/stores/userStore';
import { useTransactionStore, Transaction } from '@/stores/transactionStore';
import { useCallback, useState } from 'react';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  transactionHash?: string;
  error?: string;
}

// Treasury address (replace with your actual address)
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000';

export function usePayments() {
  const { addBalance, subtractBalance, user } = useUserStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Deposit funds to casino
   */
  const deposit = useCallback(
    async (amount: number, token: 'WLD' | 'USDC'): Promise<PaymentResult> => {
      const transactionId = crypto.randomUUID();
      const tokenKey = token.toLowerCase() as 'wld' | 'usdc';

      // Create pending transaction record
      const pendingTransaction: Transaction = {
        id: transactionId,
        type: 'deposit',
        amount,
        currency: tokenKey,
        status: 'pending',
        timestamp: Date.now(),
      };
      addTransaction(pendingTransaction);

      try {
        setIsProcessing(true);

        if (!MiniKit.isInstalled()) {
          throw new Error('Please open this app in World App');
        }

        // Initialize payment on server
        const initResponse = await fetch('/api/payment/deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.toString(),
            token,
            userId: user?.address || 'guest',
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

        // Get transaction hash from payload
        const txHash = (finalPayload as any).transaction_id || (finalPayload as any).transactionHash;

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
        addBalance(tokenKey, amount);

        // Update transaction as completed
        updateTransaction(transactionId, {
          status: 'completed',
          transactionHash: txHash || verifyResult.transactionId,
        });

        return {
          success: true,
          transactionId: verifyResult.transactionId,
          transactionHash: txHash,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment failed';

        // Update transaction as failed
        updateTransaction(transactionId, {
          status: 'failed',
          errorMessage: message,
        });

        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [user, addBalance, addTransaction, updateTransaction]
  );

  /**
   * Withdraw funds from casino
   */
  const withdraw = useCallback(
    async (amount: number, token: 'WLD' | 'USDC'): Promise<PaymentResult> => {
      const transactionId = crypto.randomUUID();
      const tokenKey = token.toLowerCase() as 'wld' | 'usdc';

      // Check if user has enough balance locally first
      const currentBalance = useUserStore.getState().balance;
      if (currentBalance[tokenKey] < amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create pending transaction record
      const pendingTransaction: Transaction = {
        id: transactionId,
        type: 'withdraw',
        amount,
        currency: tokenKey,
        status: 'pending',
        timestamp: Date.now(),
      };
      addTransaction(pendingTransaction);

      try {
        setIsProcessing(true);

        const response = await fetch('/api/payment/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.toString(),
            token,
            userId: user?.address || 'guest',
            toAddress: user?.address || 'guest',
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Withdrawal failed');
        }

        // Subtract from local balance on success
        subtractBalance(tokenKey, amount);

        // Update transaction as completed
        updateTransaction(transactionId, {
          status: 'completed',
          transactionHash: result.transactionId,
        });

        return {
          success: true,
          transactionId: result.transactionId,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Withdrawal failed';

        // Update transaction as failed
        updateTransaction(transactionId, {
          status: 'failed',
          errorMessage: message,
        });

        return { success: false, error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [user, subtractBalance, addTransaction, updateTransaction]
  );

  return {
    deposit,
    withdraw,
    isProcessing,
  };
}
