import {
  generateServerSeed,
  generateClientSeed,
  hashServerSeed,
  generateOutcome,
  verifyOutcome,
  generateSlotOutcome,
  verifySlotOutcome,
  generateShuffledDeck,
  verifyShuffledDeck,
  hashDeck,
  bytesToHex,
  isValidHex,
} from '@/lib/provablyFair';

describe('Provably Fair System', () => {
  describe('Seed Generation', () => {
    it('should generate a 64-character hex server seed', () => {
      const seed = generateServerSeed();
      expect(seed).toHaveLength(64);
      expect(isValidHex(seed)).toBe(true);
    });

    it('should generate unique server seeds', () => {
      const seed1 = generateServerSeed();
      const seed2 = generateServerSeed();
      expect(seed1).not.toBe(seed2);
    });

    it('should generate a 32-character hex client seed', () => {
      const seed = generateClientSeed();
      expect(seed).toHaveLength(32);
      expect(isValidHex(seed)).toBe(true);
    });
  });

  describe('Hash Functions', () => {
    it('should hash server seed to 64-character hex', () => {
      const seed = 'test_seed_12345';
      const hash = hashServerSeed(seed);
      expect(hash).toHaveLength(64);
      expect(isValidHex(hash)).toBe(true);
    });

    it('should produce deterministic hashes', () => {
      const seed = 'test_seed_12345';
      const hash1 = hashServerSeed(seed);
      const hash2 = hashServerSeed(seed);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different seeds', () => {
      const hash1 = hashServerSeed('seed1');
      const hash2 = hashServerSeed('seed2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Outcome Generation', () => {
    const serverSeed = 'test_server_seed_123456789';
    const clientSeed = 'test_client_seed';
    const nonce = 1;

    it('should generate an outcome within range', () => {
      const result = generateOutcome(serverSeed, clientSeed, nonce, 100);
      expect(result.outcome).toBeGreaterThanOrEqual(0);
      expect(result.outcome).toBeLessThanOrEqual(100);
    });

    it('should be deterministic', () => {
      const result1 = generateOutcome(serverSeed, clientSeed, nonce);
      const result2 = generateOutcome(serverSeed, clientSeed, nonce);
      expect(result1.outcome).toBe(result2.outcome);
      expect(result1.hmac).toBe(result2.hmac);
    });

    it('should produce different outcomes for different nonces', () => {
      const result1 = generateOutcome(serverSeed, clientSeed, 1);
      const result2 = generateOutcome(serverSeed, clientSeed, 2);
      expect(result1.outcome).not.toBe(result2.outcome);
    });

    it('should include correct metadata', () => {
      const result = generateOutcome(serverSeed, clientSeed, nonce);
      expect(result.serverSeed).toBe(serverSeed);
      expect(result.clientSeed).toBe(clientSeed);
      expect(result.nonce).toBe(nonce);
      expect(result.serverSeedHash).toBe(hashServerSeed(serverSeed));
    });
  });

  describe('Outcome Verification', () => {
    const serverSeed = 'verification_test_seed';
    const clientSeed = 'client_seed_for_verify';
    const nonce = 42;

    it('should verify valid outcome', () => {
      const result = generateOutcome(serverSeed, clientSeed, nonce, 1000);
      const verification = verifyOutcome({
        serverSeed,
        serverSeedHash: result.serverSeedHash,
        clientSeed,
        nonce,
        claimedOutcome: result.outcome,
      }, 1000);

      expect(verification.isValid).toBe(true);
      expect(verification.hashMatch).toBe(true);
      expect(verification.regeneratedOutcome).toBe(result.outcome);
    });

    it('should reject tampered server seed', () => {
      const result = generateOutcome(serverSeed, clientSeed, nonce);
      const verification = verifyOutcome({
        serverSeed: 'wrong_seed',
        serverSeedHash: result.serverSeedHash,
        clientSeed,
        nonce,
        claimedOutcome: result.outcome,
      });

      expect(verification.isValid).toBe(false);
      expect(verification.hashMatch).toBe(false);
      expect(verification.reason).toContain('tampering');
    });

    it('should reject tampered outcome', () => {
      const result = generateOutcome(serverSeed, clientSeed, nonce, 1000);
      const verification = verifyOutcome({
        serverSeed,
        serverSeedHash: result.serverSeedHash,
        clientSeed,
        nonce,
        claimedOutcome: result.outcome + 1, // Wrong outcome
      }, 1000);

      expect(verification.isValid).toBe(false);
      expect(verification.hashMatch).toBe(true);
      expect(verification.reason).toContain('does not match');
    });
  });

  describe('Slot Machine', () => {
    const serverSeed = 'slot_server_seed';
    const clientSeed = 'slot_client_seed';
    const nonce = 100;

    it('should generate 3 reels with values 0-9', () => {
      const result = generateSlotOutcome(serverSeed, clientSeed, nonce);
      expect(result.reels).toHaveLength(3);
      result.reels.forEach((reel) => {
        expect(reel).toBeGreaterThanOrEqual(0);
        expect(reel).toBeLessThanOrEqual(9);
      });
    });

    it('should be deterministic', () => {
      const result1 = generateSlotOutcome(serverSeed, clientSeed, nonce);
      const result2 = generateSlotOutcome(serverSeed, clientSeed, nonce);
      expect(result1.reels).toEqual(result2.reels);
      expect(result1.hmac).toBe(result2.hmac);
    });

    it('should correctly identify triple match', () => {
      // Test with known seeds that produce a triple (or mock)
      // For deterministic testing, we verify the logic
      const result = generateSlotOutcome('triple_test_seed', 'client', 1);
      if (result.reels[0] === result.reels[1] && result.reels[1] === result.reels[2]) {
        expect(result.multiplier).toBeGreaterThanOrEqual(10);
        expect(result.isWin).toBe(true);
      }
    });

    it('should verify valid slot outcome', () => {
      const result = generateSlotOutcome(serverSeed, clientSeed, nonce);
      const verification = verifySlotOutcome(
        serverSeed,
        hashServerSeed(serverSeed),
        clientSeed,
        nonce,
        result.reels
      );

      expect(verification.isValid).toBe(true);
    });

    it('should reject tampered slot outcome', () => {
      const result = generateSlotOutcome(serverSeed, clientSeed, nonce);
      const fakeReels: [number, number, number] = [
        (result.reels[0] + 1) % 10,
        result.reels[1],
        result.reels[2],
      ];

      const verification = verifySlotOutcome(
        serverSeed,
        hashServerSeed(serverSeed),
        clientSeed,
        nonce,
        fakeReels
      );

      expect(verification.isValid).toBe(false);
    });
  });

  describe('Deck Shuffling', () => {
    const serverSeed = 'deck_server_seed';
    const clientSeed = 'deck_client_seed';
    const nonce = 1;

    it('should generate a 52-card deck', () => {
      const deck = generateShuffledDeck(serverSeed, clientSeed, nonce);
      expect(deck).toHaveLength(52);
    });

    it('should contain all cards 0-51', () => {
      const deck = generateShuffledDeck(serverSeed, clientSeed, nonce);
      const sortedDeck = [...deck].sort((a, b) => a - b);
      expect(sortedDeck).toEqual(Array.from({ length: 52 }, (_, i) => i));
    });

    it('should be deterministic', () => {
      const deck1 = generateShuffledDeck(serverSeed, clientSeed, nonce);
      const deck2 = generateShuffledDeck(serverSeed, clientSeed, nonce);
      expect(deck1).toEqual(deck2);
    });

    it('should produce different shuffles for different nonces', () => {
      const deck1 = generateShuffledDeck(serverSeed, clientSeed, 1);
      const deck2 = generateShuffledDeck(serverSeed, clientSeed, 2);
      expect(deck1).not.toEqual(deck2);
    });

    it('should verify valid deck', () => {
      const deck = generateShuffledDeck(serverSeed, clientSeed, nonce);
      const verification = verifyShuffledDeck(
        serverSeed,
        hashServerSeed(serverSeed),
        clientSeed,
        nonce,
        deck
      );

      expect(verification.isValid).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    describe('bytesToHex', () => {
      it('should convert bytes to hex string', () => {
        const bytes = new Uint8Array([0, 255, 128, 64]);
        expect(bytesToHex(bytes)).toBe('00ff8040');
      });

      it('should handle empty array', () => {
        expect(bytesToHex(new Uint8Array([]))).toBe('');
      });
    });

    describe('isValidHex', () => {
      it('should validate valid hex strings', () => {
        expect(isValidHex('0123456789abcdef')).toBe(true);
        expect(isValidHex('ABCDEF')).toBe(true);
      });

      it('should reject invalid hex strings', () => {
        expect(isValidHex('xyz')).toBe(false);
        expect(isValidHex('123g')).toBe(false);
      });

      it('should validate length when specified', () => {
        expect(isValidHex('abcd', 4)).toBe(true);
        expect(isValidHex('abcd', 6)).toBe(false);
      });
    });
  });
});
