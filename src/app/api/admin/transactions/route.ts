import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAdminSession } from '@/lib/adminAuth';

// GET - List transactions with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type'); // DEPOSIT or WITHDRAW
    const status = url.searchParams.get('status'); // PENDING, COMPLETED, FAILED
    const userId = url.searchParams.get('userId');
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    // Fetch transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
        include: {
          user: {
            select: {
              id: true,
              address: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        transactionHash: t.transactionHash,
        blockNumber: t.blockNumber,
        errorMessage: t.errorMessage,
        userId: t.userId,
        userAddress: t.user.address.slice(0, 10) + '...' + t.user.address.slice(-6),
        createdAt: t.createdAt,
        completedAt: t.completedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List transactions error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Perform actions on transaction (approve, reject withdrawal)
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { action, transactionId, data } = await request.json();

    if (!action || !transactionId) {
      return NextResponse.json({ success: false, error: 'Missing action or transactionId' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Transaction is not pending' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'approve':
        // For withdrawals, mark as completed
        // In production, this would trigger the actual payout
        result = await prisma.$transaction(async (tx) => {
          const updated = await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: 'COMPLETED',
              transactionHash: data?.txHash,
              completedAt: new Date(),
            },
          });

          // If it's a withdrawal, deduct from user balance (if not already done)
          if (transaction.type === 'WITHDRAW') {
            const balanceField = transaction.currency === 'WLD' ? 'wldBalance' : 'usdcBalance';
            await tx.user.update({
              where: { id: transaction.userId },
              data: { [balanceField]: { decrement: transaction.amount } },
            });
          }

          return updated;
        });
        break;

      case 'reject':
        result = await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'FAILED',
            errorMessage: data?.reason || 'Rejected by admin',
            completedAt: new Date(),
          },
        });

        // If it was a deposit that was rejected, no balance was added
        // If it was a withdrawal, the balance was already reserved, so we need to return it
        if (transaction.type === 'WITHDRAW') {
          // Balance was not yet deducted for pending withdrawals in this implementation
          // If your implementation pre-deducts, uncomment below:
          // const balanceField = transaction.currency === 'WLD' ? 'wldBalance' : 'usdcBalance';
          // await prisma.user.update({
          //   where: { id: transaction.userId },
          //   data: { [balanceField]: { increment: transaction.amount } },
          // });
        }
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: `transaction.${action}`,
        targetType: 'Transaction',
        targetId: transactionId,
        details: {
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          ...data,
        },
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${action}d successfully`,
      transaction: {
        id: result.id,
        status: result.status,
        transactionHash: result.transactionHash,
      },
    });
  } catch (error) {
    console.error('Transaction action error:', error);
    return NextResponse.json({ success: false, error: 'Action failed' }, { status: 500 });
  }
}
