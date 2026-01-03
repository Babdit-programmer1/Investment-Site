
// @ts-ignore
import { Prisma } from '@prisma/client';

export type MoneyInput = number | string | Prisma.Decimal;

/**
 * Money Utility
 * Ensures all platform calculations use Prisma.Decimal (big-number logic)
 * to prevent floating point inaccuracies in fractional shares.
 */
export const Money = {
  from: (value: MoneyInput): Prisma.Decimal => {
    if (value instanceof Prisma.Decimal) return value;
    return new Prisma.Decimal(value || 0);
  },

  add: (a: MoneyInput, b: MoneyInput): Prisma.Decimal => {
    return Money.from(a).plus(Money.from(b));
  },

  sub: (a: MoneyInput, b: MoneyInput): Prisma.Decimal => {
    return Money.from(a).minus(Money.from(b));
  },

  mul: (a: MoneyInput, b: MoneyInput): Prisma.Decimal => {
    return Money.from(a).mul(Money.from(b));
  },

  div: (a: MoneyInput, b: MoneyInput): Prisma.Decimal => {
    const divisor = Money.from(b);
    if (divisor.isZero()) return new Prisma.Decimal(0);
    return Money.from(a).div(divisor);
  },

  lt: (a: MoneyInput, b: MoneyInput): boolean => Money.from(a).lessThan(Money.from(b)),
  gt: (a: MoneyInput, b: MoneyInput): boolean => Money.from(a).greaterThan(Money.from(b)),
  lte: (a: MoneyInput, b: MoneyInput): boolean => Money.from(a).lessThanOrEqualTo(Money.from(b)),
  gte: (a: MoneyInput, b: MoneyInput): boolean => Money.from(a).greaterThanOrEqualTo(Money.from(b)),

  toNumber: (a: MoneyInput): number => Money.from(a).toNumber(),

  format: (a: MoneyInput, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(Money.toNumber(a));
  },
  
  ZERO: new Prisma.Decimal(0)
};
