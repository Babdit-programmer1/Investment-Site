
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { Money, MoneyInput } from '../utils/money';

interface LedgerEntry {
  userId: string;
  walletId: string;
  actionType: 'DEPOSIT' | 'WITHDRAWAL' | 'INVESTMENT' | 'DIVIDEND' | 'RETURN' | 'TRANSFER' | 'INVESTMENT_TOP_UP' | 'MONTHLY_INVESTMENT_PAYMENT' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'DEPOSIT_APPROVED' | 'DEPOSIT_REJECTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED';
  amount: MoneyInput;
  currency: string;
  referenceId: string;
  source: string;
  balanceBefore: MoneyInput;
  balanceAfter: MoneyInput;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'PENDING_APPROVAL' | 'ESCROWED' | 'REJECTED';
  metadata?: any;
}

export const ledgerService = {
  async recordEntry(tx: any, data: LedgerEntry) {
    try {
      const amount = Money.from(data.amount);
      const balanceBefore = Money.from(data.balanceBefore);
      const balanceAfter = Money.from(data.balanceAfter);

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
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          createdAt: new Date()
        }
      });

    } catch (error) {
      console.warn('Ledger logging skipped:', error);
    }
  }
};
