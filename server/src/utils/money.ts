
// @ts-ignore
import { Prisma } from '@prisma/client';

export type MoneyInput = number | string | Prisma.Decimal;

export const Money = {
  /**
   * Safe conversion to Prisma Decimal
   */
  from: (value: MoneyInput): Prisma.Decimal => {
    if (value instanceof Prisma.Decimal) return value;
    return new Prisma.Decimal(value);
  },

  /**
   * Arithmetic Helpers
   */
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
    return Money.from(a).div(Money.from(b));
  },

  /**
   * Comparison Helpers
   */
  equals: (a: MoneyInput, b: MoneyInput): boolean => {
    return Money.from(a).equals(Money.from(b));
  },

  gt: (a: MoneyInput, b: MoneyInput): boolean => {
    return Money.from(a).greaterThan(Money.from(b));
  },

  lt: (a: MoneyInput, b: MoneyInput): boolean => {
    return Money.from(a).lessThan(Money.from(b));
  },

  gte: (a: MoneyInput, b: MoneyInput): boolean => {
    return Money.from(a).greaterThanOrEqualTo(Money.from(b));
  },

  /**
   * Output Helpers
   */
  toNumber: (a: MoneyInput): number => {
    return Money.from(a).toNumber();
  },

  format: (a: MoneyInput, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(Money.toNumber(a));
  },
  
  ZERO: new Prisma.Decimal(0)
};