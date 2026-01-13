/**
 * Provably Fair Randomness System
 *
 * SECURITY ARCHITECTURE:
 * ----------------------
 * This system implements a commit-reveal scheme that ensures:
 * 1. The house cannot manipulate outcomes after seeing player bets
 * 2. Players can verify all outcomes independently
 * 3. No backdoors - all randomness is deterministic and verifiable
 *
 * PROCESS:
 * 1. Server generates a cryptographically secure random seed BEFORE game starts
 * 2. Server commits to this seed by showing its SHA-256 hash to the player
 * 3. Player provides (or generates) their own seed
 * 4. Outcome is determined by: HMAC-SHA256(serverSeed, clientSeed:nonce)
 * 5. After game, server reveals original seed - player verifies hash matches
 *
 * CRYPTOGRAPHIC PRIMITIVES:
 * - SHA-256 for commitment hashing
 * - HMAC-SHA256 for outcome generation (provides better security than plain hash)
 * - Web Crypto API for cryptographically secure random number generation
 */

import CryptoJS from 'crypto-js';

// Type definitions for provably fair system
export interface FairRandomResult {
  outcome: number;
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  hmac: string;
}

export interface VerificationData {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  claimedOutcome: number;
}

export interface SlotOutcome {
  reels: [number, number, number];
  isWin: boolean;
  multiplier: number;
  hmac: string;
}

// Constants for security
const SEED_LENGTH_BYTES = 32; // 256 bits of entropy
const CLIENT_SEED_LENGTH_BYTES = 16; // 128 bits for client seed

/**
 * Generate a cryptographically secure server seed
 * Uses Web Crypto API (crypto.getRandomValues) which is CSPRNG
 * This is the only source of randomness - everything else is deterministic
 */
export function generateServerSeed(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const array = new Uint8Array(SEED_LENGTH_BYTES);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Node.js environment
    const crypto = require('crypto');
    return crypto.randomBytes(SEED_LENGTH_BYTES).toString('hex');
  }
}

/**
 * Hash the server seed using SHA-256
 * This creates a cryptographic commitment that binds the server
 * to its chosen seed BEFORE seeing the player's choices
 */
export function hashServerSeed(serverSeed: string): string {
  return CryptoJS.SHA256(serverSeed).toString(CryptoJS.enc.Hex);
}

/**
 * Generate a cryptographically secure client seed
 */
export function generateClientSeed(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(CLIENT_SEED_LENGTH_BYTES);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } else {
    const crypto = require('crypto');
    return crypto.randomBytes(CLIENT_SEED_LENGTH_BYTES).toString('hex');
  }
}

/**
 * Generate outcome using HMAC-SHA256
 *
 * HMAC provides better security properties than plain concatenation+hash:
 * - Protects against length extension attacks
 * - Provides authentication of the message
 * - Industry standard for provably fair systems
 *
 * @param serverSeed - The server's secret seed (used as HMAC key)
 * @param clientSeed - The player's seed
 * @param nonce - Incrementing counter for each bet (prevents replay)
 * @param maxValue - Maximum value for the outcome range
 */
export function generateOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  maxValue: number = 10000
): FairRandomResult {
  // Message format: clientSeed:nonce
  // Server seed is used as the HMAC key
  const message = `${clientSeed}:${nonce}`;
  const hmac = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);

  // Use first 8 characters (32 bits) to generate outcome
  // This provides sufficient entropy for most game outcomes
  const hexSlice = hmac.slice(0, 8);
  const decimalValue = parseInt(hexSlice, 16);

  // Use modulo for fair distribution
  // For very large maxValue, consider rejection sampling for perfect uniformity
  const outcome = decimalValue % (maxValue + 1);

  return {
    outcome,
    serverSeed,
    serverSeedHash: hashServerSeed(serverSeed),
    clientSeed,
    nonce,
    hmac,
  };
}

/**
 * Verify that an outcome was fairly generated
 * This is the CRITICAL function players use to verify fairness
 *
 * Verification steps:
 * 1. Verify server seed hashes to the committed hash
 * 2. Regenerate the outcome using the same inputs
 * 3. Compare regenerated outcome to claimed outcome
 */
export function verifyOutcome(data: VerificationData, maxValue: number = 10000): {
  isValid: boolean;
  regeneratedOutcome: number;
  hashMatch: boolean;
  reason?: string;
} {
  // Step 1: Verify the server seed matches its hash (commitment verification)
  const computedHash = hashServerSeed(data.serverSeed);
  const hashMatch = computedHash === data.serverSeedHash;

  if (!hashMatch) {
    return {
      isValid: false,
      regeneratedOutcome: -1,
      hashMatch: false,
      reason: 'Server seed does not match committed hash - possible tampering',
    };
  }

  // Step 2: Regenerate the outcome
  const result = generateOutcome(data.serverSeed, data.clientSeed, data.nonce, maxValue);

  // Step 3: Compare outcomes
  const outcomeMatch = result.outcome === data.claimedOutcome;

  return {
    isValid: hashMatch && outcomeMatch,
    regeneratedOutcome: result.outcome,
    hashMatch,
    reason: outcomeMatch ? undefined : 'Regenerated outcome does not match claimed outcome',
  };
}

/**
 * Generate slot machine outcome
 * Each reel is generated independently using different sub-nonces
 * This prevents correlation between reels
 */
export function generateSlotOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): SlotOutcome {
  const reels: number[] = [];

  // Generate each reel independently
  for (let i = 0; i < 3; i++) {
    // Use sub-nonce to ensure each reel is independent
    const message = `${clientSeed}:${nonce}:reel${i}`;
    const hmac = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);
    const value = parseInt(hmac.slice(0, 2), 16) % 10; // 0-9
    reels.push(value);
  }

  const typedReels = reels as [number, number, number];

  // Symbol multipliers (must match frontend SYMBOLS array)
  const SYMBOL_MULTIPLIERS = [2, 3, 4, 5, 6, 8, 15, 25, 50, 100];

  // Calculate win conditions
  const allSame = typedReels[0] === typedReels[1] && typedReels[1] === typedReels[2];
  const twoSame =
    typedReels[0] === typedReels[1] ||
    typedReels[1] === typedReels[2] ||
    typedReels[0] === typedReels[2];

  let multiplier = 0;
  if (allSame) {
    // Triple match - use symbol-specific multiplier
    multiplier = SYMBOL_MULTIPLIERS[typedReels[0]] || 10;
  } else if (twoSame) {
    multiplier = 2;
  }

  // Generate verification HMAC for the entire spin
  const fullMessage = `${clientSeed}:${nonce}:slots`;
  const fullHmac = CryptoJS.HmacSHA256(fullMessage, serverSeed).toString(CryptoJS.enc.Hex);

  return {
    reels: typedReels,
    isWin: multiplier > 0,
    multiplier,
    hmac: fullHmac,
  };
}

/**
 * Verify slot outcome
 */
export function verifySlotOutcome(
  serverSeed: string,
  serverSeedHash: string,
  clientSeed: string,
  nonce: number,
  claimedReels: [number, number, number]
): { isValid: boolean; reason?: string } {
  // Verify commitment
  if (hashServerSeed(serverSeed) !== serverSeedHash) {
    return { isValid: false, reason: 'Server seed hash mismatch' };
  }

  // Regenerate outcome
  const result = generateSlotOutcome(serverSeed, clientSeed, nonce);

  // Compare reels
  const reelsMatch =
    result.reels[0] === claimedReels[0] &&
    result.reels[1] === claimedReels[1] &&
    result.reels[2] === claimedReels[2];

  return {
    isValid: reelsMatch,
    reason: reelsMatch ? undefined : 'Reel values do not match',
  };
}

/**
 * Generate a shuffled deck using Fisher-Yates algorithm
 * Each swap decision is determined by provably fair randomness
 */
export function generateShuffledDeck(
  serverSeed: string,
  clientSeed: string,
  nonce: number
): number[] {
  const deck = Array.from({ length: 52 }, (_, i) => i);

  // Fisher-Yates shuffle with provably fair random swaps
  for (let i = deck.length - 1; i > 0; i--) {
    const message = `${clientSeed}:${nonce}:shuffle${i}`;
    const hmac = CryptoJS.HmacSHA256(message, serverSeed).toString(CryptoJS.enc.Hex);
    const j = parseInt(hmac.slice(0, 8), 16) % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

/**
 * Generate a hash of the deck for commitment
 * Players can verify the deck wasn't changed mid-game
 */
export function hashDeck(deck: number[]): string {
  return CryptoJS.SHA256(deck.join(',')).toString(CryptoJS.enc.Hex);
}

/**
 * Verify a shuffled deck
 */
export function verifyShuffledDeck(
  serverSeed: string,
  serverSeedHash: string,
  clientSeed: string,
  nonce: number,
  claimedDeck: number[]
): { isValid: boolean; reason?: string } {
  // Verify commitment
  if (hashServerSeed(serverSeed) !== serverSeedHash) {
    return { isValid: false, reason: 'Server seed hash mismatch' };
  }

  // Regenerate deck
  const regeneratedDeck = generateShuffledDeck(serverSeed, clientSeed, nonce);

  // Compare decks
  const deckMatch = regeneratedDeck.every((card, index) => card === claimedDeck[index]);

  return {
    isValid: deckMatch,
    reason: deckMatch ? undefined : 'Deck does not match',
  };
}

/**
 * Utility: Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Utility: Validate hex string format
 */
export function isValidHex(str: string, expectedLength?: number): boolean {
  const hexRegex = /^[0-9a-fA-F]+$/;
  if (!hexRegex.test(str)) return false;
  if (expectedLength && str.length !== expectedLength) return false;
  return true;
}
