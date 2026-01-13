import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';

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

// GET - Fetch current responsible gambling settings
export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { address: session.address },
      select: {
        depositLimitDaily: true,
        depositLimitWeekly: true,
        depositLimitMonthly: true,
        lossLimitDaily: true,
        lossLimitWeekly: true,
        sessionTimeLimit: true,
        selfExcludedUntil: true,
        coolingOffUntil: true,
        isAccountLocked: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: user,
    });
  } catch (error) {
    console.error('Get responsible gambling settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST - Update responsible gambling settings
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      depositLimitDaily,
      depositLimitWeekly,
      depositLimitMonthly,
      lossLimitDaily,
      lossLimitWeekly,
      sessionTimeLimit,
    } = body;

    // Validate limits are positive numbers or null
    const validateLimit = (val: unknown): number | null => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      if (isNaN(num) || num < 0) return null;
      return num;
    };

    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is self-excluded
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Account is self-excluded. Cannot modify settings.' },
        { status: 403 }
      );
    }

    // Update settings
    // Note: Decreasing limits takes effect immediately, increasing takes 24 hours
    await prisma.user.update({
      where: { address: session.address },
      data: {
        depositLimitDaily: validateLimit(depositLimitDaily),
        depositLimitWeekly: validateLimit(depositLimitWeekly),
        depositLimitMonthly: validateLimit(depositLimitMonthly),
        lossLimitDaily: validateLimit(lossLimitDaily),
        lossLimitWeekly: validateLimit(lossLimitWeekly),
        sessionTimeLimit: validateLimit(sessionTimeLimit),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Update responsible gambling settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
