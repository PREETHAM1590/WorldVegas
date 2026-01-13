import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService, TransactionService, GameService } from '@/lib/services';
import prisma from '@/lib/db';

// Helper to verify session
async function verifySession(request: NextRequest): Promise<{ userId: string; address: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    // Decode session (in production, use proper JWT verification)
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    if (!decoded.address || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return { userId: decoded.userId || '', address: decoded.address };
  } catch {
    return null;
  }
}

/**
 * GET /api/user/sync
 * Syncs user data from database - loads balance, transactions, game history
 * REQUIRES: Valid session cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Verify session first
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please login' },
        { status: 401 }
      );
    }

    const { address } = session;

    const user = await UserService.getByAddress(address);

    if (!user) {
      // User doesn't exist in DB yet, return empty state
      return NextResponse.json({
        success: true,
        exists: false,
        balance: { wld: 0, usdc: 0 },
        transactions: [],
        gameHistory: [],
        stats: {
          totalWagered: 0,
          totalWon: 0,
          gamesPlayed: 0,
        },
      });
    }

    // Map transactions to client format
    const transactions = user.transactions.map((t) => ({
      id: t.id,
      type: t.type.toLowerCase() as 'deposit' | 'withdraw',
      amount: t.amount,
      currency: t.currency.toLowerCase() as 'wld' | 'usdc',
      status: t.status.toLowerCase() as 'pending' | 'completed' | 'failed',
      transactionHash: t.transactionHash,
      timestamp: t.createdAt.getTime(),
      errorMessage: t.errorMessage,
    }));

    // Map game results to client format
    const gameHistory = user.gameResults.map((g) => ({
      id: g.id,
      game: g.game.toLowerCase() as 'slots' | 'blackjack' | 'prediction',
      betAmount: g.betAmount,
      currency: g.currency.toLowerCase() as 'wld' | 'usdc',
      outcome: g.outcome.toLowerCase() as 'win' | 'lose' | 'push',
      payout: g.payout,
      timestamp: g.createdAt.getTime(),
      serverSeed: g.serverSeed,
      clientSeed: g.clientSeed,
      nonce: g.nonce,
    }));

    return NextResponse.json({
      success: true,
      exists: true,
      userId: user.id,
      balance: {
        wld: user.wldBalance,
        usdc: user.usdcBalance,
      },
      transactions,
      gameHistory,
      stats: {
        totalWagered: user.totalWagered,
        totalWon: user.totalWon,
        gamesPlayed: user.gamesPlayed,
      },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/sync
 * Creates or updates user in database
 * REQUIRES: Valid session cookie
 * NOTE: Balance cannot be set from client - only server can modify balance
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session first
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please login' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nullifierHash } = body;

    // Use address from session, not from request body (prevents spoofing)
    const { address } = session;

    // Find or create user
    const user = await UserService.findOrCreateByAddress(address, nullifierHash);

    // NOTE: We do NOT accept balance from client anymore - this was the vulnerability
    // Balance can only be modified through verified deposits/withdrawals/game results

    return NextResponse.json({
      success: true,
      userId: user.id,
      balance: {
        wld: user.wldBalance,
        usdc: user.usdcBalance,
      },
    });
  } catch (error) {
    console.error('Sync POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync user data' },
      { status: 500 }
    );
  }
}
