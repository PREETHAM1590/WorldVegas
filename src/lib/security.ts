/**
 * Security Middleware for WorldVegas
 *
 * This module provides server-side security measures including:
 * - Request validation
 * - Rate limiting
 * - Input sanitization
 * - World ID verification
 * - Anti-tampering measures
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Types
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface SecurityConfig {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  maxPayloadSize: number;
}

// Default security configuration
const DEFAULT_CONFIG: SecurityConfig = {
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // Max 100 requests per minute
  },
  maxPayloadSize: 1024 * 1024, // 1MB
};

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a value using SHA-256
 */
export function secureHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Generate HMAC for message authentication
 */
export function generateHMAC(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Verify HMAC
 */
export function verifyHMAC(message: string, hmac: string, secret: string): boolean {
  const expectedHmac = generateHMAC(message, secret);
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'));
}

/**
 * Rate limiting check
 */
export function checkRateLimit(
  identifier: string,
  config: SecurityConfig['rateLimit'] = DEFAULT_CONFIG.rateLimit
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Clean up old entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const currentEntry = rateLimitStore.get(identifier);

  if (!currentEntry) {
    // First request from this identifier
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  if (currentEntry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetIn: currentEntry.resetTime - now,
    };
  }

  // Increment count
  currentEntry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - currentEntry.count,
    resetIn: currentEntry.resetTime - now,
  };
}

/**
 * Validate request payload structure
 */
export function validatePayload<T extends Record<string, unknown>>(
  payload: unknown,
  requiredFields: (keyof T)[],
  fieldValidators?: Partial<Record<keyof T, (value: unknown) => boolean>>
): { isValid: boolean; error?: string } {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, error: 'Invalid payload format' };
  }

  const obj = payload as Record<string, unknown>;

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in obj) || obj[field as string] === undefined || obj[field as string] === null) {
      return { isValid: false, error: `Missing required field: ${String(field)}` };
    }
  }

  // Run field validators
  if (fieldValidators) {
    for (const [field, validator] of Object.entries(fieldValidators)) {
      if (validator && !validator(obj[field])) {
        return { isValid: false, error: `Invalid value for field: ${field}` };
      }
    }
  }

  return { isValid: true };
}

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML
    .trim();
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate hex string
 */
export function isValidHexString(value: string, expectedLength?: number): boolean {
  if (typeof value !== 'string') return false;
  if (!/^[a-fA-F0-9]+$/.test(value)) return false;
  if (expectedLength && value.length !== expectedLength) return false;
  return true;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && value > 0 && Number.isFinite(value);
}

/**
 * Validate integer in range
 */
export function isIntegerInRange(value: unknown, min: number, max: number): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/**
 * Get client IP from request (handles proxies)
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Security response headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * Create secure response with headers
 */
export function createSecureResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  const response = NextResponse.json(data, { status });

  // Add security headers
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}

/**
 * Error response with security in mind (no stack traces)
 */
export function createErrorResponse(
  error: string,
  status: number = 400
): NextResponse<{ success: false; error: string }> {
  return createSecureResponse({ success: false, error }, status);
}

/**
 * Validate request origin (CORS check)
 */
export function isValidOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // Same-origin requests don't have Origin header

  return allowedOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed === origin) return true;
    // Support wildcard subdomains
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return false;
  });
}

/**
 * Validate World ID proof structure
 */
export function isValidWorldIDProof(proof: unknown): boolean {
  if (!proof || typeof proof !== 'object') return false;

  const p = proof as Record<string, unknown>;

  return (
    typeof p.proof === 'string' &&
    typeof p.merkle_root === 'string' &&
    typeof p.nullifier_hash === 'string' &&
    typeof p.verification_level === 'string'
  );
}

/**
 * Anti-replay protection using nonces
 */
const usedNonces = new Set<string>();
const NONCE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function validateNonce(nonce: string, timestamp: number): boolean {
  // Check if nonce was already used
  if (usedNonces.has(nonce)) {
    return false;
  }

  // Check timestamp is recent (within 5 minutes)
  const now = Date.now();
  if (Math.abs(now - timestamp) > NONCE_EXPIRY_MS) {
    return false;
  }

  // Mark nonce as used
  usedNonces.add(nonce);

  // Clean up old nonces periodically
  if (usedNonces.size > 10000) {
    usedNonces.clear();
  }

  return true;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}
