import { NextRequest, NextResponse } from 'next/server';
import { MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js';
import crypto from 'crypto';
import prisma from '@/lib/db';
import { Currency, DepositStatus } from '@prisma/client';

// World Chain RPC endpoint for on-chain verification
const WORLD_CHAIN_RPC = process.env.WORLD_CHAIN_RPC_URL || 'https://worldchain-mainnet.g.alchemy.com/public';

// Token addresses on World Chain
const TOKEN_ADDRESSES: Record<string, string> = {
  WLD: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003',
  USDC: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
};

// Treasury address from environment variable
const TREASURY_ADDRESS = process.env.TREASURY_WALLET_ADDRESS;

interface InitPaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

interface TransactionReceipt {
  status: string;
  blockNumber: string;
  from: string;
  to: string;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
}

/**
 * Verify a transaction on World Chain
 * Returns the transaction details if valid
 */
async function verifyOnChain(txHash: string): Promise<{
  verified: boolean;
  from?: string;
  to?: string;
  amount?: string;
  token?: string;
  blockNumber?: number;
  error?: string;
}> {
  try {
    // Get transaction receipt
    const receiptResponse = await fetch(WORLD_CHAIN_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      }),
    });

    const receiptData = await receiptResponse.json();

    if (!receiptData.result) {
      return { verified: false, error: 'Transaction not found or pending' };
    }

    const receipt: TransactionReceipt = receiptData.result;

    // Check transaction status (0x1 = success)
    if (receipt.status !== '0x1') {
      return { verified: false, error: 'Transaction failed' };
    }

    // For token transfers, parse the Transfer event logs
    // ERC20 Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
    // Topic0: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    let foundValidTransfer = false;
    let transferAmount = '0';
    let tokenAddress = '';
    let fromAddress = '';
    let toAddress = '';

    for (const log of receipt.logs) {
      if (log.topics[0] === transferEventSignature) {
        // Extract from and to addresses from indexed parameters
        fromAddress = '0x' + log.topics[1].slice(26);
        toAddress = '0x' + log.topics[2].slice(26);
        transferAmount = log.data;
        tokenAddress = log.address.toLowerCase();

        // Verify the transfer was to our treasury
        if (TREASURY_ADDRESS && toAddress.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
          foundValidTransfer = true;
          break;
        }
      }
    }

    if (!foundValidTransfer) {
      return { verified: false, error: 'No valid transfer to treasury found' };
    }

    // Determine token type
    let token = '';
    if (tokenAddress.toLowerCase() === TOKEN_ADDRESSES.WLD.toLowerCase()) {
      token = 'WLD';
    } else if (tokenAddress.toLowerCase() === TOKEN_ADDRESSES.USDC.toLowerCase()) {
      token = 'USDC';
    } else {
      return { verified: false, error: 'Unknown token address' };
    }

    // Convert amount from hex to decimal
    const amountBigInt = BigInt(transferAmount);
    const decimals = token === 'USDC' ? 6 : 18;
    const amountNum = Number(amountBigInt) / Math.pow(10, decimals);

    return {
      verified: true,
      from: fromAddress,
      to: toAddress,
      amount: amountNum.toString(),
      token,
      blockNumber: parseInt(receipt.blockNumber, 16),
    };
  } catch (error) {
    console.error('On-chain verification error:', error);
    return { verified: false, error: 'Failed to verify on-chain' };
  }
}

/**
 * Initialize a deposit - creates a pending deposit record
 */
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

    // Check treasury address is configured
    if (!TREASURY_ADDRESS) {
      console.error('CRITICAL: TREASURY_WALLET_ADDRESS not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { address: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate unique payment ID
    const paymentId = crypto.randomUUID();

    // Store pending deposit in database (expires in 10 minutes)
    await prisma.pendingDeposit.create({
      data: {
        paymentId,
        userId: user.id,
        amount: amountNum,
        token: token === 'WLD' ? Currency.WLD : Currency.USDC,
        status: DepositStatus.PENDING,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Clean up expired pending deposits
    await prisma.pendingDeposit.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: DepositStatus.PENDING,
      },
      data: {
        status: DepositStatus.EXPIRED,
      },
    });

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

/**
 * Verify payment after completion - verifies on-chain and credits balance
 */
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

    // Get pending deposit from database
    const pendingDeposit = await prisma.pendingDeposit.findUnique({
      where: { paymentId },
      include: { user: true },
    });

    if (!pendingDeposit) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (pendingDeposit.status !== DepositStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: `Payment already ${pendingDeposit.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    if (pendingDeposit.expiresAt < new Date()) {
      await prisma.pendingDeposit.update({
        where: { id: pendingDeposit.id },
        data: { status: DepositStatus.EXPIRED },
      });
      return NextResponse.json(
        { success: false, error: 'Payment expired' },
        { status: 400 }
      );
    }

    // Verify the payment reference matches
    if (payload.reference !== paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment reference mismatch' },
        { status: 400 }
      );
    }

    // Get transaction hash from payload
    const txHash = payload.transaction_id;

    if (!txHash) {
      return NextResponse.json(
        { success: false, error: 'No transaction hash provided' },
        { status: 400 }
      );
    }

    // Verify on-chain
    const onChainResult = await verifyOnChain(txHash);

    if (!onChainResult.verified) {
      await prisma.pendingDeposit.update({
        where: { id: pendingDeposit.id },
        data: { status: DepositStatus.FAILED },
      });
      return NextResponse.json(
        { success: false, error: onChainResult.error || 'On-chain verification failed' },
        { status: 400 }
      );
    }

    // Verify amount matches (with small tolerance for rounding)
    const onChainAmount = parseFloat(onChainResult.amount || '0');
    const expectedAmount = pendingDeposit.amount;
    const tolerance = expectedAmount * 0.001; // 0.1% tolerance

    if (Math.abs(onChainAmount - expectedAmount) > tolerance) {
      console.error('Amount mismatch:', { onChainAmount, expectedAmount });
      await prisma.pendingDeposit.update({
        where: { id: pendingDeposit.id },
        data: { status: DepositStatus.FAILED },
      });
      return NextResponse.json(
        { success: false, error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Verify token matches
    const expectedToken = pendingDeposit.token === Currency.WLD ? 'WLD' : 'USDC';
    if (onChainResult.token !== expectedToken) {
      await prisma.pendingDeposit.update({
        where: { id: pendingDeposit.id },
        data: { status: DepositStatus.FAILED },
      });
      return NextResponse.json(
        { success: false, error: 'Token mismatch' },
        { status: 400 }
      );
    }

    // All verifications passed - update deposit status and credit balance
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Mark deposit as verified
      await tx.pendingDeposit.update({
        where: { id: pendingDeposit.id },
        data: {
          status: DepositStatus.COMPLETED,
          txHash,
        },
      });

      // Credit user's balance
      const balanceField = pendingDeposit.token === Currency.WLD ? 'wldBalance' : 'usdcBalance';
      await tx.user.update({
        where: { id: pendingDeposit.userId },
        data: {
          [balanceField]: { increment: pendingDeposit.amount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: pendingDeposit.userId,
          type: 'DEPOSIT',
          amount: pendingDeposit.amount,
          currency: pendingDeposit.token,
          status: 'COMPLETED',
          transactionHash: txHash,
          blockNumber: onChainResult.blockNumber,
          completedAt: new Date(),
        },
      });
    });

    console.log('Deposit verified and credited:', {
      paymentId,
      userId: pendingDeposit.userId,
      amount: pendingDeposit.amount,
      token: pendingDeposit.token,
      txHash,
      blockNumber: onChainResult.blockNumber,
    });

    return NextResponse.json({
      success: true,
      amount: pendingDeposit.amount.toString(),
      token: pendingDeposit.token,
      transactionId: txHash,
      blockNumber: onChainResult.blockNumber,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
