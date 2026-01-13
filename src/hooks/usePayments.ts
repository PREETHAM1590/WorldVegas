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
  simulated?: boolean;
}

// Treasury address (replace with your actual address)
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000';

// Check if we're in development/simulation mode
const isSimulationMode = () => {
  // Allow simulation if MiniKit is not installed (running outside World App)
  return typeof window !== 'undefined' && !MiniKit.isInstalled();
};

export function usePayments() {
  const { addBalance, subtractBalance, user } = useUserStore();
  const { addTransaction, updateTransaction } = useTransactionStore();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Deposit funds to casino
   * Supports both real World App payments and simulation mode for testing
   */
  const deposit = useCallback(
    async (amount: number, token: 'WLD' | 'USDC'): Promise<PaymentResult> => {
      const transactionId = crypto.randomUUID();
      const tokenKey = token.toLowerCase() as 'wld' | 'usdc';

      // Validate minimum amount
      if (amount < 0.1) {
        return { success: false, error: 'Minimum deposit is 0.1' };
      }

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

        // SIMULATION MODE: For testing outside World App
        if (isSimulationMode()) {
          // Simulate a short delay for realism
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Update local balance directly
          addBalance(tokenKey, amount);

          // Mark transaction as completed
          updateTransaction(transactionId, {
            status: 'completed',
            transactionHash: `sim_${transactionId.slice(0, 8)}`,
          });

          return {
            success: true,
            transactionId,
            transactionHash: `sim_${transactionId.slice(0, 8)}`,
            simulated: true,
          };
        }

        // REAL MODE: World App MiniKit payment
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
   * Supports both real World App withdrawals and simulation mode for testing
   */
  const withdraw = useCallback(
    async (amount: number, token: 'WLD' | 'USDC'): Promise<PaymentResult> => {
      const localTransactionId = crypto.randomUUID();
      const tokenKey = token.toLowerCase() as 'wld' | 'usdc';

      // Validate minimum amount
      if (amount < 0.1) {
        return { success: false, error: 'Minimum withdrawal is 0.1' };
      }

      // Check if user has enough balance locally first
      const currentBalance = useUserStore.getState().balance;
      if (currentBalance[tokenKey] < amount) {
        return { success: false, error: `Insufficient ${token} balance` };
      }

      // Create pending transaction record locally
      const pendingTransaction: Transaction = {
        id: localTransactionId,
        type: 'withdraw',
        amount,
        currency: tokenKey,
        status: 'pending',
        timestamp: Date.now(),
      };
      addTransaction(pendingTransaction);

      try {
        setIsProcessing(true);

        // SIMULATION MODE: For testing outside World App
        if (isSimulationMode()) {
          // Simulate a short delay for realism
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Subtract from local balance
          subtractBalance(tokenKey, amount);

          // Mark transaction as completed
          updateTransaction(localTransactionId, {
            status: 'completed',
            transactionHash: `sim_withdraw_${localTransactionId.slice(0, 8)}`,
          });

          return {
            success: true,
            transactionId: localTransactionId,
            transactionHash: `sim_withdraw_${localTransactionId.slice(0, 8)}`,
            simulated: true,
          };
        }

        // REAL MODE: Check if user is logged in
        if (!user?.address) {
          throw new Error('Please login to withdraw');
        }

        // Call the withdraw API - it will check database balance and process
        const response = await fetch('/api/payment/withdraw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount.toString(),
            token,
            toAddress: user.address,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Withdrawal failed');
        }

        // Subtract from local balance on success (database already updated)
        subtractBalance(tokenKey, amount);

        // Update local transaction as completed
        updateTransaction(localTransactionId, {
          status: 'completed',
          transactionHash: result.withdrawalId || result.transactionId,
        });

        return {
          success: true,
          transactionId: result.transactionId,
          transactionHash: result.withdrawalId,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Withdrawal failed';

        // Update local transaction as failed
        updateTransaction(localTransactionId, {
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
    isSimulationMode: isSimulationMode(),
  };
}
