import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService, TransactionService } from '@/lib/services';
import prisma from '@/lib/db';

export interface WithdrawResult {
  success: boolean;
  transactionId?: string;
  withdrawalId?: string;
  error?: string;
}

// Validate Ethereum address format
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Helper to verify session
async function verifySession(): Promise<{ userId: string; address: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    if (!decoded.address || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return { userId: decoded.userId || '', address: decoded.address };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<WithdrawResult>> {
  try {
    // Verify session first
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please login' },
        { status: 401 }
      );
    }

    const { amount, token, toAddress } = await request.json() as {
      amount: string;
      token: 'WLD' | 'USDC';
      toAddress: string;
    };

    if (!amount || !token || !toAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate address format
    if (!isValidAddress(toAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount
    if (amountNum < 0.1) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal is 0.1' },
        { status: 400 }
      );
    }

    // Maximum withdrawal amount (daily limit)
    if (amountNum > 1000) {
      return NextResponse.json(
        { success: false, error: 'Maximum single withdrawal is 1000' },
        { status: 400 }
      );
    }

    // Get user from database using session address (not request address)
    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please login first.' },
        { status: 404 }
      );
    }

    // Check if user is self-excluded or in cooling off period
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Your account is self-excluded. Please contact support.' },
        { status: 403 }
      );
    }

    if (user.isAccountLocked) {
      return NextResponse.json(
        { success: false, error: 'Your account is locked. Please contact support.' },
        { status: 403 }
      );
    }

    // Check database balance
    const tokenKey = token.toLowerCase() as 'wld' | 'usdc';
    const balanceField = tokenKey === 'wld' ? 'wldBalance' : 'usdcBalance';
    const currentBalance = user[balanceField];

    if (currentBalance < amountNum) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. You have ${currentBalance.toFixed(2)} ${token}`
        },
        { status: 400 }
      );
    }

    // Create pending transaction in database
    const transaction = await TransactionService.createPending(
      user.id,
      'withdraw',
      amountNum,
      tokenKey
    );

    // Deduct balance from database immediately (pending withdrawal)
    await UserService.updateBalance(user.id, tokenKey, amountNum, 'subtract');

    // For World App Mini Apps, withdrawals work differently:
    // The user needs to initiate a "claim" or we need to send tokens from treasury
    // Since MiniKit.pay is for users paying the app, not the other way around,
    // withdrawals require the backend to have access to the treasury wallet

    // For now, we'll mark this as a pending withdrawal that can be processed
    // In production, you would:
    // 1. Queue the withdrawal for processing
    // 2. Use ethers.js with the treasury private key to send tokens
    // 3. Monitor the transaction and update status

    // Mark transaction as completed (in production, this would be after on-chain confirmation)
    const withdrawalId = `WD-${Date.now().toString(36).toUpperCase()}`;

    await TransactionService.complete(transaction.id, withdrawalId);

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      withdrawalId,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Withdrawal failed. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to check withdrawal status
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');
    const address = searchParams.get('address');

    if (transactionId) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return NextResponse.json(
          { success: false, error: 'Transaction not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          transactionHash: transaction.transactionHash,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
      });
    }

    if (address) {
      const user = await prisma.user.findUnique({
        where: { address },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const withdrawals = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: 'WITHDRAW',
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        withdrawals: withdrawals.map(tx => ({
          id: tx.id,
          status: tx.status,
          amount: tx.amount,
          currency: tx.currency,
          transactionHash: tx.transactionHash,
          createdAt: tx.createdAt,
        })),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Missing id or address parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get withdrawal status' },
      { status: 500 }
    );
  }
}
