import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  checkRateLimit,
  validatePayload,
  getClientIP,
  createSecureResponse,
  createErrorResponse,
  isValidAddress,
  isPositiveNumber,
} from '@/lib/security';
import {
  generateServerSeed,
  hashServerSeed,
  generateSlotOutcome,
  generateShuffledDeck,
  generateOutcome,
  hashDeck,
} from '@/lib/provablyFair';

// Secure session storage (use Redis/database in production)
interface GameSession {
  serverSeed: string;
  serverSeedHash: string;
  nonce: number;
  gameType: 'slots' | 'blackjack' | 'prediction';
  userId: string;
  createdAt: number;
  lastActivity: number;
  betHistory: Array<{
    nonce: number;
    betAmount: number;
    outcome: unknown;
    timestamp: number;
  }>;
}

const gameSessions = new Map<string, GameSession>();

// Session configuration
const SESSION_CONFIG = {
  maxAge: 60 * 60 * 1000, // 1 hour
  maxBetsPerSession: 1000,
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
};

// Periodic cleanup of expired sessions
let lastCleanup = Date.now();
function cleanupSessions() {
  const now = Date.now();
  if (now - lastCleanup < SESSION_CONFIG.cleanupInterval) return;

  lastCleanup = now;
  const expiredTime = now - SESSION_CONFIG.maxAge;

  for (const [id, session] of gameSessions.entries()) {
    if (session.lastActivity < expiredTime) {
      gameSessions.delete(id);
    }
  }
}

export interface StartGameResult {
  success: boolean;
  sessionId?: string;
  serverSeedHash?: string;
  error?: string;
}

// POST: Start a new game session
export async function POST(request: NextRequest): Promise<NextResponse<StartGameResult>> {
  try {
    cleanupSessions();

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`game:start:${clientIP}`, {
      windowMs: 60 * 1000,
      maxRequests: 30,
    });

    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON', 400);
    }

    // Validate required fields
    const validation = validatePayload<{
      userId: string;
      gameType: string;
      clientSeed: string;
    }>(body, ['userId', 'gameType', 'clientSeed'], {
      gameType: (v) => ['slots', 'blackjack', 'prediction'].includes(v as string),
      clientSeed: (v) => typeof v === 'string' && v.length >= 16 && v.length <= 64,
    });

    if (!validation.isValid) {
      return createErrorResponse(validation.error || 'Invalid request', 400);
    }

    const { userId, gameType, clientSeed } = body as {
      userId: string;
      gameType: 'slots' | 'blackjack' | 'prediction';
      clientSeed: string;
    };

    // Generate cryptographically secure server seed
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashServerSeed(serverSeed);

    // Create unique session ID
    const sessionId = crypto.randomUUID();

    // Store session securely
    const now = Date.now();
    gameSessions.set(sessionId, {
      serverSeed,
      serverSeedHash,
      nonce: 0,
      gameType,
      userId,
      createdAt: now,
      lastActivity: now,
      betHistory: [],
    });

    // Return only the hash (commitment), NOT the seed
    return createSecureResponse({
      success: true,
      sessionId,
      serverSeedHash, // This is the cryptographic commitment
    });
  } catch (error) {
    console.error('Start game error:', error instanceof Error ? error.message : 'Unknown');
    return createErrorResponse('Failed to start game', 500);
  }
}

export interface PlayResult {
  success: boolean;
  outcome?: unknown;
  serverSeed?: string;
  nonce?: number;
  error?: string;
}

// PUT: Play a round
export async function PUT(request: NextRequest): Promise<NextResponse<PlayResult>> {
  try {
    cleanupSessions();

    // Rate limiting per client
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`game:play:${clientIP}`, {
      windowMs: 60 * 1000,
      maxRequests: 120, // Allow rapid play
    });

    if (!rateLimit.allowed) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON', 400);
    }

    // Validate
    const validation = validatePayload<{
      sessionId: string;
      clientSeed: string;
      betAmount: number;
    }>(body, ['sessionId', 'clientSeed'], {
      sessionId: (v) => typeof v === 'string' && v.length > 0,
      clientSeed: (v) => typeof v === 'string' && v.length >= 16,
    });

    if (!validation.isValid) {
      return createErrorResponse(validation.error || 'Invalid request', 400);
    }

    const { sessionId, clientSeed, betAmount } = body as {
      sessionId: string;
      clientSeed: string;
      betAmount?: number;
    };

    // Get session
    const session = gameSessions.get(sessionId);
    if (!session) {
      return createErrorResponse('Session not found or expired', 404);
    }

    // Check session age
    const now = Date.now();
    if (now - session.createdAt > SESSION_CONFIG.maxAge) {
      gameSessions.delete(sessionId);
      return createErrorResponse('Session expired', 410);
    }

    // Check max bets
    if (session.nonce >= SESSION_CONFIG.maxBetsPerSession) {
      return createErrorResponse('Session bet limit reached. Please start a new session.', 400);
    }

    // Increment nonce (prevents replay)
    session.nonce += 1;
    session.lastActivity = now;
    const currentNonce = session.nonce;

    // Generate outcome based on game type
    let outcome: unknown;
    const { serverSeed, gameType } = session;

    switch (gameType) {
      case 'slots':
        outcome = generateSlotOutcome(serverSeed, clientSeed, currentNonce);
        break;

      case 'blackjack':
        const deck = generateShuffledDeck(serverSeed, clientSeed, currentNonce);
        outcome = {
          deck: deck.slice(0, 10), // Only reveal first 10 cards
          deckHash: hashDeck(deck), // Full deck hash for verification
        };
        break;

      case 'prediction':
        const result = generateOutcome(serverSeed, clientSeed, currentNonce, 100);
        outcome = {
          value: result.outcome,
          hmac: result.hmac,
        };
        break;

      default:
        return createErrorResponse('Invalid game type', 400);
    }

    // Log bet for audit trail
    session.betHistory.push({
      nonce: currentNonce,
      betAmount: betAmount || 0,
      outcome,
      timestamp: now,
    });

    // IMPORTANT: Reveal server seed after play
    // This allows the player to verify the outcome
    return createSecureResponse({
      success: true,
      outcome,
      serverSeed: session.serverSeed, // Revealed for verification
      nonce: currentNonce,
    });
  } catch (error) {
    console.error('Play game error:', error instanceof Error ? error.message : 'Unknown');
    return createErrorResponse('Failed to process game', 500);
  }
}

// GET: Get session info (for debugging/verification)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return createErrorResponse('Session ID required', 400);
  }

  const session = gameSessions.get(sessionId);
  if (!session) {
    return createErrorResponse('Session not found', 404);
  }

  // Return public info only (no server seed until game ends)
  return createSecureResponse({
    success: true,
    gameType: session.gameType,
    nonce: session.nonce,
    serverSeedHash: session.serverSeedHash,
    createdAt: session.createdAt,
    betCount: session.betHistory.length,
  });
}
