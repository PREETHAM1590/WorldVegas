import prisma from '@/lib/db';
import { Currency, TransactionType, TransactionStatus, GameType, GameOutcome } from '@prisma/client';

/**
 * User Service - handles user CRUD operations
 */
export const UserService = {
  /**
   * Find or create a user by wallet address
   */
  async findOrCreateByAddress(address: string, nullifierHash?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { address },
    });

    if (existingUser) {
      // Update last login
      return prisma.user.update({
        where: { id: existingUser.id },
        data: {
          lastLoginAt: new Date(),
          ...(nullifierHash && { nullifierHash }),
        },
      });
    }

    // Create new user
    return prisma.user.create({
      data: {
        address,
        nullifierHash,
        lastLoginAt: new Date(),
      },
    });
  },

  /**
   * Get user by address
   */
  async getByAddress(address: string) {
    return prisma.user.findUnique({
      where: { address },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        gameResults: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });
  },

  /**
   * Update user balance
   */
  async updateBalance(
    userId: string,
    currency: 'wld' | 'usdc',
    amount: number,
    operation: 'add' | 'subtract'
  ) {
    const field = currency === 'wld' ? 'wldBalance' : 'usdcBalance';
    const increment = operation === 'add' ? amount : -amount;

    return prisma.user.update({
      where: { id: userId },
      data: {
        [field]: { increment },
      },
    });
  },

  /**
   * Get user balance
   */
  async getBalance(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { wldBalance: true, usdcBalance: true },
    });
    return {
      wld: user?.wldBalance ?? 0,
      usdc: user?.usdcBalance ?? 0,
    };
  },

  /**
   * Update user stats after a game
   */
  async updateStats(userId: string, betAmount: number, payout: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        totalWagered: { increment: betAmount },
        totalWon: { increment: payout },
        gamesPlayed: { increment: 1 },
      },
    });
  },
};

/**
 * Transaction Service - handles deposit/withdraw history
 */
export const TransactionService = {
  /**
   * Create a pending transaction
   */
  async createPending(
    userId: string,
    type: 'deposit' | 'withdraw',
    amount: number,
    currency: 'wld' | 'usdc'
  ) {
    return prisma.transaction.create({
      data: {
        userId,
        type: type === 'deposit' ? TransactionType.DEPOSIT : TransactionType.WITHDRAW,
        amount,
        currency: currency === 'wld' ? Currency.WLD : Currency.USDC,
        status: TransactionStatus.PENDING,
      },
    });
  },

  /**
   * Complete a transaction
   */
  async complete(id: string, transactionHash?: string) {
    return prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.COMPLETED,
        transactionHash,
        completedAt: new Date(),
      },
    });
  },

  /**
   * Fail a transaction
   */
  async fail(id: string, errorMessage: string) {
    return prisma.transaction.update({
      where: { id },
      data: {
        status: TransactionStatus.FAILED,
        errorMessage,
        completedAt: new Date(),
      },
    });
  },

  /**
   * Get user transactions
   */
  async getByUserId(userId: string, limit = 50) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};

/**
 * Game Service - handles game sessions and results
 */
export const GameService = {
  /**
   * Create a new game session
   */
  async createSession(
    userId: string,
    gameType: 'slots' | 'blackjack' | 'prediction',
    serverSeed: string,
    serverSeedHash: string,
    clientSeed: string
  ) {
    const gameTypeEnum =
      gameType === 'slots'
        ? GameType.SLOTS
        : gameType === 'blackjack'
        ? GameType.BLACKJACK
        : GameType.PREDICTION;

    // Expire old sessions
    await prisma.gameSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return prisma.gameSession.create({
      data: {
        userId,
        gameType: gameTypeEnum,
        serverSeed,
        serverSeedHash,
        clientSeed,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
  },

  /**
   * Get active session
   */
  async getActiveSession(userId: string, gameType: 'slots' | 'blackjack' | 'prediction') {
    const gameTypeEnum =
      gameType === 'slots'
        ? GameType.SLOTS
        : gameType === 'blackjack'
        ? GameType.BLACKJACK
        : GameType.PREDICTION;

    return prisma.gameSession.findFirst({
      where: {
        userId,
        gameType: gameTypeEnum,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    });
  },

  /**
   * Increment nonce and return session
   */
  async incrementNonce(sessionId: string) {
    return prisma.gameSession.update({
      where: { id: sessionId },
      data: { nonce: { increment: 1 } },
    });
  },

  /**
   * Record a game result
   */
  async recordResult(
    userId: string,
    sessionId: string | null,
    game: 'slots' | 'blackjack' | 'prediction',
    betAmount: number,
    currency: 'wld' | 'usdc',
    outcome: 'win' | 'lose' | 'push',
    payout: number,
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    gameData?: object,
    multiplier?: number
  ) {
    const gameEnum =
      game === 'slots'
        ? GameType.SLOTS
        : game === 'blackjack'
        ? GameType.BLACKJACK
        : GameType.PREDICTION;

    const outcomeEnum =
      outcome === 'win'
        ? GameOutcome.WIN
        : outcome === 'lose'
        ? GameOutcome.LOSE
        : GameOutcome.PUSH;

    const currencyEnum = currency === 'wld' ? Currency.WLD : Currency.USDC;

    // Create game result
    const result = await prisma.gameResult.create({
      data: {
        userId,
        sessionId,
        game: gameEnum,
        betAmount,
        currency: currencyEnum,
        outcome: outcomeEnum,
        payout,
        multiplier,
        serverSeed,
        clientSeed,
        nonce,
        gameData: gameData ?? undefined,
      },
    });

    // Update user stats
    await UserService.updateStats(userId, betAmount, payout);

    return result;
  },

  /**
   * Get user game history
   */
  async getHistory(userId: string, limit = 100) {
    return prisma.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};

/**
 * Pending Game Service - for crash protection
 */
export const PendingGameService = {
  /**
   * Create a pending game
   */
  async create(
    userId: string,
    game: 'slots' | 'blackjack' | 'prediction',
    betAmount: number,
    currency: 'wld' | 'usdc',
    clientSeed: string,
    sessionId?: string
  ) {
    const gameEnum =
      game === 'slots'
        ? GameType.SLOTS
        : game === 'blackjack'
        ? GameType.BLACKJACK
        : GameType.PREDICTION;

    const currencyEnum = currency === 'wld' ? Currency.WLD : Currency.USDC;

    return prisma.pendingGame.create({
      data: {
        userId,
        sessionId,
        game: gameEnum,
        betAmount,
        currency: currencyEnum,
        clientSeed,
      },
    });
  },

  /**
   * Get unresolved pending games for user
   */
  async getUnresolved(userId: string) {
    return prisma.pendingGame.findMany({
      where: { userId, resolved: false },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Resolve a pending game (refund or complete)
   */
  async resolve(id: string) {
    return prisma.pendingGame.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });
  },

  /**
   * Delete by session ID when game completes normally
   */
  async deleteBySession(sessionId: string) {
    return prisma.pendingGame.deleteMany({
      where: { sessionId },
    });
  },
};
