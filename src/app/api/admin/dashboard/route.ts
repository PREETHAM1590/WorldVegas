import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/adminAuth';

// GET - Dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get time range from query params
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '24h';

    // Calculate date range
    let startDate: Date;
    const now = new Date();
    switch (range) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      default: // 24h
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Fetch statistics in parallel
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalTransactions,
      deposits,
      withdrawals,
      gameResults,
      pendingWithdrawals,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // New users in period
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Active users (logged in during period)
      prisma.user.count({
        where: { lastLoginAt: { gte: startDate } },
      }),

      // Total transactions in period
      prisma.transaction.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Deposits in period
      prisma.transaction.aggregate({
        where: {
          type: 'DEPOSIT',
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Withdrawals in period
      prisma.transaction.aggregate({
        where: {
          type: 'WITHDRAW',
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Game results in period
      prisma.gameResult.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: {
          betAmount: true,
          payout: true,
        },
        _count: true,
      }),

      // Pending withdrawals
      prisma.transaction.count({
        where: {
          type: 'WITHDRAW',
          status: 'PENDING',
        },
      }),
    ]);

    // Calculate house edge (profit)
    const totalBets = gameResults._sum.betAmount || 0;
    const totalPayouts = gameResults._sum.payout || 0;
    const houseProfit = totalBets - totalPayouts;
    const houseEdge = totalBets > 0 ? (houseProfit / totalBets) * 100 : 0;

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { address: true },
        },
      },
    });

    // Get top players by wagered amount
    const topPlayers = await prisma.user.findMany({
      take: 10,
      orderBy: { totalWagered: 'desc' },
      select: {
        id: true,
        address: true,
        totalWagered: true,
        totalWon: true,
        gamesPlayed: true,
        createdAt: true,
      },
    });

    // Game distribution
    const gameDistribution = await prisma.gameResult.groupBy({
      by: ['game'],
      where: { createdAt: { gte: startDate } },
      _count: true,
      _sum: { betAmount: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
        },
        transactions: {
          total: totalTransactions,
          pendingWithdrawals,
          deposits: {
            count: deposits._count,
            total: deposits._sum.amount || 0,
          },
          withdrawals: {
            count: withdrawals._count,
            total: withdrawals._sum.amount || 0,
          },
        },
        gaming: {
          totalGames: gameResults._count,
          totalBets,
          totalPayouts,
          houseProfit,
          houseEdge: houseEdge.toFixed(2),
        },
        gameDistribution: gameDistribution.map((g) => ({
          game: g.game,
          count: g._count,
          wagered: g._sum.betAmount || 0,
        })),
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          userAddress: t.user.address.slice(0, 8) + '...',
          createdAt: t.createdAt,
        })),
        topPlayers: topPlayers.map((u) => ({
          id: u.id,
          address: u.address.slice(0, 8) + '...' + u.address.slice(-4),
          totalWagered: u.totalWagered,
          totalWon: u.totalWon,
          gamesPlayed: u.gamesPlayed,
          netProfit: u.totalWon - u.totalWagered,
        })),
      },
      range,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
