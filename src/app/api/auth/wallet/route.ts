import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from '@worldcoin/minikit-js';
import {
  checkRateLimit,
  getClientIP,
  createSecureResponse,
  createErrorResponse,
} from '@/lib/security';

export interface WalletAuthResult {
  success: boolean;
  isValid?: boolean;
  address?: string;
  error?: string;
}

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<WalletAuthResult>> {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`wallet-auth:${clientIP}`, {
      windowMs: 60 * 1000,
      maxRequests: 10,
    });

    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Parse request body
    let body: IRequestPayload;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON body', 400);
    }

    const { payload, nonce } = body;

    if (!payload || !nonce) {
      return createErrorResponse('Missing payload or nonce', 400);
    }

    // Validate nonce matches the one stored in cookie
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get('siwe_nonce')?.value;

    if (!storedNonce) {
      return createErrorResponse('No nonce found. Please request a new nonce.', 400);
    }

    if (nonce !== storedNonce) {
      return createErrorResponse('Invalid nonce', 401);
    }

    // Clear the used nonce to prevent replay attacks
    cookieStore.delete('siwe_nonce');

    // Verify the SIWE message using MiniKit's verification function
    try {
      const validMessage = await verifySiweMessage(payload, nonce);

      if (!validMessage.isValid) {
        console.error('SIWE verification failed:', {
          timestamp: new Date().toISOString(),
        });
        return createErrorResponse('Invalid signature', 401);
      }

      // Set session cookie for the authenticated user
      cookieStore.set('session_address', payload.address, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      // Log successful auth (for audit trail)
      console.log('Wallet auth successful:', {
        addressPrefix: payload.address.slice(0, 10) + '...',
        timestamp: new Date().toISOString(),
      });

      return createSecureResponse({
        success: true,
        isValid: true,
        address: payload.address,
      });
    } catch (verifyError) {
      console.error('SIWE verification error:', verifyError);
      return createErrorResponse('Signature verification failed', 401);
    }
  } catch (error) {
    console.error('Wallet auth error:', error instanceof Error ? error.message : 'Unknown');
    return createErrorResponse('Authentication failed', 500);
  }
}
