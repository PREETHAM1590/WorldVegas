import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { getAdminSession, AdminSession } from '@/lib/adminAuth';

// Admin session duration: 2 hours
const ADMIN_SESSION_DURATION = 2 * 60 * 60 * 1000;

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const { address, signature } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Find admin by address
    const admin = await prisma.admin.findUnique({
      where: { address: address.toLowerCase() },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Admin account is disabled' },
        { status: 403 }
      );
    }

    // TODO: In production, verify signature matches address
    // For now, we'll use World ID verification flow similar to user login

    // Create session
    const session: AdminSession = {
      adminId: admin.id,
      address: admin.address,
      role: admin.role,
      exp: Date.now() + ADMIN_SESSION_DURATION,
    };

    const sessionValue = Buffer.from(JSON.stringify(session)).toString('base64');

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Log the login
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'admin.login',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
      },
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ADMIN_SESSION_DURATION / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

// GET - Get current admin session
export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.adminId },
      select: {
        id: true,
        username: true,
        role: true,
        address: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error('Get admin session error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

// DELETE - Admin logout
export async function DELETE() {
  try {
    const session = await getAdminSession();

    if (session) {
      // Log the logout
      await prisma.auditLog.create({
        data: {
          adminId: session.adminId,
          action: 'admin.logout',
        },
      });
    }

    const cookieStore = await cookies();
    cookieStore.delete('admin_session');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}
