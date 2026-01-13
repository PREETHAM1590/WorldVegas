import { NextRequest, NextResponse } from 'next/server';
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js';
import crypto from 'crypto';

// Store pending payments in memory (use Redis/database in production)
const pendingPayments = new Map<string, { amount: string; token: string; userId: string; createdAt: number }>();

interface InitPaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<InitPaymentResult>> {
  try {
    const { amount, token, userId } = await request.json() as {
      amount: string;
      token: 'WLD' | 'USDC';
      userId: string;
    };

    if (!amount || !token || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Generate unique payment ID
    const paymentId = crypto.randomUUID();

    // Store pending payment
    pendingPayments.set(paymentId, {
      amount,
      token,
      userId,
      createdAt: Date.now(),
    });

    // Clean up old pending payments (older than 10 minutes)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    for (const [id, payment] of pendingPayments.entries()) {
      if (payment.createdAt < tenMinutesAgo) {
        pendingPayments.delete(id);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId,
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize payment' },
      { status: 500 }
    );
  }
}

// Verify payment after completion
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { paymentId, payload } = await request.json() as {
      paymentId: string;
      payload: MiniAppPaymentSuccessPayload;
    };

    if (!paymentId || !payload) {
      return NextResponse.json(
        { success: false, error: 'Missing payment ID or payload' },
        { status: 400 }
      );
    }

    // Get pending payment
    const pendingPayment = pendingPayments.get(paymentId);
    if (!pendingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found or expired' },
        { status: 404 }
      );
    }

    // Verify the payment reference matches
    if (payload.reference !== paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment reference mismatch' },
        { status: 400 }
      );
    }

    // Here you would verify the transaction on-chain
    // For production: query World Chain RPC to confirm transaction

    // Remove from pending
    pendingPayments.delete(paymentId);

    // Credit the user's balance in your database
    // This is a placeholder - implement your database logic here

    return NextResponse.json({
      success: true,
      amount: pendingPayment.amount,
      token: pendingPayment.token,
      transactionId: payload.transaction_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
