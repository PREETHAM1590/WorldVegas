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

// POST - Activate self-exclusion
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
    const { days } = body;

    // Validate days
    const validDays = [30, 90, 180, 365];
    if (!validDays.includes(days)) {
      return NextResponse.json(
        { success: false, error: 'Invalid exclusion period. Choose 30, 90, 180, or 365 days.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already self-excluded
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Account is already self-excluded' },
        { status: 400 }
      );
    }

    // Calculate exclusion end date
    const excludedUntil = new Date();
    excludedUntil.setDate(excludedUntil.getDate() + days);

    // Activate self-exclusion
    await prisma.user.update({
      where: { address: session.address },
      data: {
        selfExcludedUntil: excludedUntil,
        isAccountLocked: true,
      },
    });

    // Clear session cookie to force logout
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({
      success: true,
      message: `Self-exclusion activated until ${excludedUntil.toLocaleDateString()}`,
      excludedUntil: excludedUntil.toISOString(),
    });
  } catch (error) {
    console.error('Self-exclusion error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate self-exclusion' },
      { status: 500 }
    );
  }
}
