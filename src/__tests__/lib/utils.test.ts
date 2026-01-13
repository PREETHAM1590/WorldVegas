import { cn, formatCurrency, shortenAddress } from '@/lib/utils';

describe('utils', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should handle empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
    });

    it('should handle arrays', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar');
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers with default 2 decimals', () => {
      expect(formatCurrency(1234.56)).toBe('1,234.56');
      expect(formatCurrency(0)).toBe('0.00');
    });

    it('should format with custom decimal places', () => {
      expect(formatCurrency(1234.5678, 4)).toBe('1,234.5678');
      expect(formatCurrency(1234, 0)).toBe('1,234');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567890.12)).toBe('1,234,567,890.12');
    });

    it('should handle small numbers', () => {
      expect(formatCurrency(0.001, 4)).toBe('0.0010');
    });
  });

  describe('shortenAddress', () => {
    it('should shorten ethereum addresses with default chars', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(shortenAddress(address)).toBe('0x1234...5678');
    });

    it('should shorten with custom chars', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(shortenAddress(address, 6)).toBe('0x123456...345678');
    });

    it('should handle short addresses', () => {
      const address = '0x1234';
      expect(shortenAddress(address, 2)).toBe('0x12...34');
    });
  });
});
