import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

interface UserSession {
  userId: string;
  address: string;
  exp: number;
}

async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session: UserSession = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    );

    if (!session.address || !session.exp || session.exp < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// GET - Export transactions as CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const type = url.searchParams.get('type'); // 'transactions' or 'games'
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Find user
    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Build date filter
    const dateFilter: Record<string, unknown> = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    if (type === 'games') {
      // Export game history
      const games = await prisma.gameResult.findMany({
        where: {
          userId: user.id,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        orderBy: { createdAt: 'desc' },
        take: 10000, // Limit export size
      });

      if (format === 'csv') {
        const headers = ['Date', 'Game', 'Bet Amount', 'Currency', 'Outcome', 'Payout', 'Multiplier'];
        const rows = games.map((g) => [
          g.createdAt.toISOString(),
          g.game,
          g.betAmount.toString(),
          g.currency,
          g.outcome,
          g.payout.toString(),
          g.multiplier?.toString() || '',
        ]);

        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="game-history-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      // JSON format
      return NextResponse.json({
        success: true,
        data: games.map((g) => ({
          date: g.createdAt,
          game: g.game,
          betAmount: g.betAmount,
          currency: g.currency,
          outcome: g.outcome,
          payout: g.payout,
          multiplier: g.multiplier,
        })),
      });
    } else {
      // Export transactions
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
        },
        orderBy: { createdAt: 'desc' },
        take: 10000,
      });

      if (format === 'csv') {
        const headers = ['Date', 'Type', 'Amount', 'Currency', 'Status', 'Transaction Hash'];
        const rows = transactions.map((t) => [
          t.createdAt.toISOString(),
          t.type,
          t.amount.toString(),
          t.currency,
          t.status,
          t.transactionHash || '',
        ]);

        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }

      // JSON format
      return NextResponse.json({
        success: true,
        data: transactions.map((t) => ({
          date: t.createdAt,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          transactionHash: t.transactionHash,
        })),
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Failed to export data' }, { status: 500 });
  }
}
