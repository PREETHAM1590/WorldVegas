import { NextRequest, NextResponse } from 'next/server';

export interface WithdrawResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<WithdrawResult>> {
  try {
    const { amount, token, userId, toAddress } = await request.json() as {
      amount: string;
      token: 'WLD' | 'USDC';
      userId: string;
      toAddress: string;
    };

    if (!amount || !token || !userId || !toAddress) {
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

    // In production, you would:
    // 1. Verify user has sufficient balance in database
    // 2. Require World ID verification for large withdrawals
    // 3. Execute withdrawal through smart contract
    // 4. Wait for transaction confirmation
    // 5. Update database balance

    // Placeholder transaction ID
    const transactionId = `0x${Date.now().toString(16)}`;

    return NextResponse.json({
      success: true,
      transactionId,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Withdrawal failed' },
      { status: 500 }
    );
  }
}
