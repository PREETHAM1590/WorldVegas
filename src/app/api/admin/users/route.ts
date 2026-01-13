import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/adminAuth';

// GET - List users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const filter = url.searchParams.get('filter') || 'all';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.address = { contains: search, mode: 'insensitive' };
    }

    if (filter === 'locked') {
      where.isAccountLocked = true;
    } else if (filter === 'excluded') {
      where.selfExcludedUntil = { gte: new Date() };
    } else if (filter === 'active') {
      where.lastLoginAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    // Fetch users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          address: true,
          wldBalance: true,
          usdcBalance: true,
          totalWagered: true,
          totalWon: true,
          gamesPlayed: true,
          isAccountLocked: true,
          selfExcludedUntil: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              transactions: true,
              gameResults: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users: users.map((u) => ({
        ...u,
        address: u.address.slice(0, 10) + '...' + u.address.slice(-6),
        fullAddress: u.address,
        netProfit: u.totalWon - u.totalWagered,
        transactionCount: u._count.transactions,
        gameCount: u._count.gameResults,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Perform actions on user (lock, unlock, adjust balance)
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions (only ADMIN and SUPER_ADMIN can modify users)
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action, userId, data } = await request.json();

    if (!action || !userId) {
      return NextResponse.json({ success: false, error: 'Missing action or userId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'lock':
        result = await prisma.user.update({
          where: { id: userId },
          data: { isAccountLocked: true },
        });
        break;

      case 'unlock':
        result = await prisma.user.update({
          where: { id: userId },
          data: { isAccountLocked: false },
        });
        break;

      case 'adjustBalance':
        if (!data?.currency || data?.amount === undefined) {
          return NextResponse.json({ success: false, error: 'Missing currency or amount' }, { status: 400 });
        }
        const balanceField = data.currency === 'WLD' ? 'wldBalance' : 'usdcBalance';
        result = await prisma.user.update({
          where: { id: userId },
          data: { [balanceField]: { increment: data.amount } },
        });
        break;

      case 'removeSelfExclusion':
        if (session.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ success: false, error: 'Only SUPER_ADMIN can remove self-exclusion' }, { status: 403 });
        }
        result = await prisma.user.update({
          where: { id: userId },
          data: { selfExcludedUntil: null },
        });
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: `user.${action}`,
        targetType: 'User',
        targetId: userId,
        details: data,
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${action} successful`,
      user: {
        id: result.id,
        address: result.address,
        isAccountLocked: result.isAccountLocked,
        wldBalance: result.wldBalance,
        usdcBalance: result.usdcBalance,
      },
    });
  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
  }
}
