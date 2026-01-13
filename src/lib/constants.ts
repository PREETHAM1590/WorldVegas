// Action IDs for different verification contexts
// These must match EXACTLY what you created in the Developer Portal
export const VERIFY_ACTIONS = {
  LOGIN: 'worldvegas-login',
  HIGH_STAKES: 'worldvegas-high-stakes',
  WITHDRAWAL: 'world-vegas-withdrawal',
} as const;

export type VerifyAction = typeof VERIFY_ACTIONS[keyof typeof VERIFY_ACTIONS];

// Token addresses on World Chain
export const TOKEN_ADDRESSES = {
  WLD: '0x2cFc85d8E48F8EAB294be644d9E25C3030863003', // WLD on World Chain
  USDC: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1', // USDC on World Chain
} as const;
