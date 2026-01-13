import { NextRequest, NextResponse } from 'next/server';
import {
  MiniAppVerifyActionSuccessPayload,
  verifyCloudProof,
  IVerifyResponse,
} from '@worldcoin/minikit-js';
import {
  checkRateLimit,
  validatePayload,
  getClientIP,
  createSecureResponse,
  createErrorResponse,
  isValidWorldIDProof,
} from '@/lib/security';
import { VERIFY_ACTIONS } from '@/lib/constants';
import prisma from '@/lib/db';

interface VerifyActionResult {
  success: boolean;
  nullifierHash?: string;
  verificationLevel?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyActionResult>> {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`verify:${clientIP}`, {
      windowMs: 60 * 1000,
      maxRequests: 10, // Stricter limit for verification
    });

    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded. Try again later.', 429);
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON body', 400);
    }

    // Validate payload structure
    const validation = validatePayload<{
      payload: MiniAppVerifyActionSuccessPayload;
      action: string;
      signal?: string;
    }>(body, ['payload', 'action']);

    if (!validation.isValid) {
      return createErrorResponse(validation.error || 'Invalid request', 400);
    }

    const { payload, action, signal } = body as {
      payload: MiniAppVerifyActionSuccessPayload;
      action: string;
      signal?: string;
    };

    // Validate action is one of our known actions
    const validActions = Object.values(VERIFY_ACTIONS);
    if (!validActions.includes(action as (typeof validActions)[number])) {
      return createErrorResponse('Invalid action', 400);
    }

    // Validate proof structure
    if (!isValidWorldIDProof(payload)) {
      return createErrorResponse('Invalid proof structure', 400);
    }

    // Get app ID from environment
    const appId = process.env.APP_ID;
    if (!appId) {
      console.error('CRITICAL: APP_ID environment variable not set');
      return createErrorResponse('Server configuration error', 500);
    }

    // Verify the proof using World ID cloud verification
    // This is the critical security check - it validates:
    // 1. The proof is cryptographically valid
    // 2. The user has been verified by World ID
    // 3. The proof was generated for our app
    const verifyResult: IVerifyResponse = await verifyCloudProof(
      payload,
      appId as `app_${string}`,
      action,
      signal
    );

    if (!verifyResult.success) {
      console.error('World ID verification failed:', {
        action,
        error: verifyResult,
        timestamp: new Date().toISOString(),
      });
      return createErrorResponse('World ID verification failed', 401);
    }

    // Extract verification data
    const { nullifier_hash, verification_level } = payload;

    // Check for nullifier reuse in database (Sybil protection)
    // For unique actions (like one-time bonuses), check if nullifier was used
    const existingNullifier = await prisma.usedNullifier.findFirst({
      where: {
        nullifierHash: nullifier_hash,
        action: action,
      },
    });

    if (existingNullifier) {
      // For login actions, allow reuse
      // For one-time actions, reject
      if (action !== VERIFY_ACTIONS.LOGIN) {
        return createErrorResponse('This verification has already been used for this action', 400);
      }
    }

    // Store nullifier usage in database
    // For non-login actions, always create a new record
    // For login actions, only create if it doesn't exist
    if (!existingNullifier || action !== VERIFY_ACTIONS.LOGIN) {
      await prisma.usedNullifier.upsert({
        where: { nullifierHash: nullifier_hash },
        update: {
          action,
          usedAt: new Date(),
        },
        create: {
          nullifierHash: nullifier_hash,
          action,
        },
      });
    }

    // Log successful verification (for audit trail)
    console.log('World ID verification successful:', {
      action,
      verificationLevel: verification_level,
      nullifierHashPrefix: nullifier_hash.slice(0, 10) + '...',
      timestamp: new Date().toISOString(),
    });

    return createSecureResponse({
      success: true,
      nullifierHash: nullifier_hash,
      verificationLevel: verification_level,
    });
  } catch (error) {
    // Log error securely (no sensitive data in logs)
    console.error('Verify action error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    // Return generic error to client (don't expose internal details)
    return createErrorResponse('Verification failed', 500);
  }
}
