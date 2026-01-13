import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { LeaderboardType } from '@prisma/client';

// GET - Public leaderboard
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || 'WEEKLY') as LeaderboardType;
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Determine the current period based on type
    const now = new Date();
    let period: string;

    switch (type) {
      case 'DAILY':
        period = now.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'WEEKLY':
        // Get ISO week number
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        period = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
        break;
      case 'MONTHLY':
        period = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        break;
      case 'ALL_TIME':
      default:
        period = 'all-time';
    }

    // Try to get cached leaderboard entries
    let entries = await prisma.leaderboardEntry.findMany({
      where: { period, type },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    // If no cached entries or stale (for non-all-time), compute from game results
    if (entries.length === 0 || (type !== 'ALL_TIME' && entries.length > 0)) {
      // Determine date range
      let startDate: Date | undefined;
      switch (type) {
        case 'DAILY':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'WEEKLY':
          const day = now.getDay();
          startDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'MONTHLY':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = undefined;
      }

      // Aggregate from game results
      const aggregation = await prisma.gameResult.groupBy({
        by: ['userId'],
        where: startDate ? { createdAt: { gte: startDate } } : {},
        _sum: {
          betAmount: true,
          payout: true,
        },
        _count: true,
        _max: {
          payout: true,
        },
      });

      // Sort by total wagered (or you could use total won)
      const sorted = aggregation
        .map((a) => ({
          userId: a.userId,
          totalWagered: a._sum.betAmount || 0,
          totalWon: a._sum.payout || 0,
          gamesPlayed: a._count,
          biggestWin: a._max.payout || 0,
        }))
        .sort((a, b) => b.totalWagered - a.totalWagered)
        .slice(0, limit);

      // Get user details
      const userIds = sorted.map((s) => s.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, address: true },
      });
      const userMap = new Map(users.map((u) => [u.id, u]));

      // Format response
      const leaderboard = sorted.map((entry, index) => {
        const user = userMap.get(entry.userId);
        return {
          rank: index + 1,
          userId: entry.userId,
          address: user ? user.address.slice(0, 6) + '...' + user.address.slice(-4) : 'Unknown',
          totalWagered: entry.totalWagered,
          totalWon: entry.totalWon,
          netProfit: entry.totalWon - entry.totalWagered,
          gamesPlayed: entry.gamesPlayed,
          biggestWin: entry.biggestWin,
        };
      });

      return NextResponse.json({
        success: true,
        leaderboard,
        period,
        type,
        updatedAt: new Date().toISOString(),
      });
    }

    // Get user details for cached entries
    const userIds = entries.map((e) => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, address: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard = entries.map((entry) => {
      const user = userMap.get(entry.userId);
      return {
        rank: entry.rank,
        userId: entry.userId,
        address: user ? user.address.slice(0, 6) + '...' + user.address.slice(-4) : 'Unknown',
        totalWagered: entry.totalWagered,
        totalWon: entry.totalWon,
        netProfit: entry.totalWon - entry.totalWagered,
        gamesPlayed: entry.gamesPlayed,
        biggestWin: entry.biggestWin,
      };
    });

    return NextResponse.json({
      success: true,
      leaderboard,
      period,
      type,
      updatedAt: entries[0]?.updatedAt?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
