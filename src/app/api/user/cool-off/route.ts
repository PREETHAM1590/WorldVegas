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

// POST - Activate cooling off period
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
    const { hours } = body;

    // Validate hours
    const validHours = [24, 48, 72, 168, 336, 720]; // 1 day to 30 days
    if (!validHours.includes(hours)) {
      return NextResponse.json(
        { success: false, error: 'Invalid cooling off period.' },
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

    // Check if already in cooling off or self-excluded
    if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Account is self-excluded' },
        { status: 400 }
      );
    }

    if (user.coolingOffUntil && user.coolingOffUntil > new Date()) {
      return NextResponse.json(
        { success: false, error: 'Account is already in cooling off period' },
        { status: 400 }
      );
    }

    // Calculate cooling off end date
    const coolOffUntil = new Date();
    coolOffUntil.setHours(coolOffUntil.getHours() + hours);

    // Activate cooling off
    await prisma.user.update({
      where: { address: session.address },
      data: {
        coolingOffUntil: coolOffUntil,
      },
    });

    // Clear session cookie to force logout
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({
      success: true,
      message: `Cooling off period activated until ${coolOffUntil.toLocaleString()}`,
      coolingOffUntil: coolOffUntil.toISOString(),
    });
  } catch (error) {
    console.error('Cooling off error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate cooling off period' },
      { status: 500 }
    );
  }
}
