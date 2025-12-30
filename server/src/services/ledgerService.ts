
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { Money, MoneyInput } from '../utils/money';

export type LedgerAction = 'DEPOSIT' | 'INVESTMENT' | 'PROFIT' | 'WITHDRAWAL' | 'RETURN';
export type LedgerSource = 'PAYMENT' | 'INVESTMENT' | 'ESCROW' | 'RETURN' | 'WALLET';

interface LedgerEntry {
  userId: string;
  walletId: string;
  actionType: LedgerAction;
  amount: MoneyInput;
  currency: string;
  referenceId: string;
  source: LedgerSource;
  balanceBefore: MoneyInput;
  balanceAfter: MoneyInput;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'PENDING_APPROVAL';
  metadata?: any;
}

export const ledgerService = {
  async recordEntry(tx: any, data: LedgerEntry) {
    try {
      const amount = Money.from(data.amount);
      const balanceBefore = Money.from(data.balanceBefore);
      const balanceAfter = Money.from(data.balanceAfter);

      // 1. Create Master Ledger Entry
      if (tx.financialLedger) {
        await tx.financialLedger.create({
          data: {
            userId: data.userId,
            walletId: data.walletId,
            actionType: data.actionType,
            amount: amount,
            currency: data.currency,
            referenceId: data.referenceId,
            source: data.source,
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            status: data.status,
            createdAt: new Date()
          }
        });
      }

      // 2. Create Specific Log Entries (Legacy Support)
      if (data.actionType === 'DEPOSIT' && tx.depositLog) {
        await tx.depositLog.create({
          data: {
            userId: data.userId,
            walletId: data.walletId,
            amount: amount,
            method: data.source,
            status: data.status,
            reference: data.referenceId,
            createdAt: new Date()
          }
        });
      } else if (data.actionType === 'INVESTMENT' && tx.investmentLog) {
        await tx.investmentLog.create({
          data: {
            userId: data.userId,
            amount: amount,
            investmentId: data.metadata?.assetId,
            status: data.status,
            reference: data.referenceId,
            createdAt: new Date()
          }
        });
      } else if (data.actionType === 'WITHDRAWAL' && tx.withdrawalLog) {
         await tx.withdrawalLog.create({
          data: {
            userId: data.userId,
            walletId: data.walletId,
            amount: amount,
            destination: data.metadata?.destination || 'External',
            status: data.status,
            reference: data.referenceId,
            createdAt: new Date()
          }
        });
      } else if (data.actionType === 'PROFIT' && tx.profitLog) {
        await tx.profitLog.create({
          data: {
            userId: data.userId,
            amount: amount,
            source: data.source,
            period: data.metadata?.period || 'Ad-hoc',
            reference: data.referenceId,
            createdAt: new Date()
          }
        });
      }

    } catch (error) {
      console.warn('Ledger logging skipped:', error);
    }
  }
};