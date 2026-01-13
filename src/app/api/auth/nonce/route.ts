import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Generate a cryptographically secure nonce for SIWE
 * The nonce must be at least 8 alphanumeric characters
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Generate a secure random nonce (32 bytes = 64 hex chars)
    const nonce = crypto.randomBytes(32).toString('hex');

    // Store nonce in HTTP-only cookie for later verification
    const cookieStore = await cookies();
    cookieStore.set('siwe_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return NextResponse.json({ nonce });
  } catch (error) {
    console.error('Nonce generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate nonce' },
      { status: 500 }
    );
  }
}
