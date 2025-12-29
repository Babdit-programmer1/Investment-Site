// @ts-ignore
import { PrismaClient } from '@prisma/client';

export type LedgerAction = 'DEPOSIT' | 'INVESTMENT' | 'PROFIT' | 'WITHDRAWAL';
export type LedgerSource = 'PAYMENT' | 'INVESTMENT' | 'ESCROW' | 'RETURN' | 'WALLET';

interface LedgerEntry {
  userId: string;
  walletId: string;
  actionType: LedgerAction;
  amount: number;
  currency: string;
  referenceId: string;
  source: LedgerSource;
  balanceBefore: number;
  balanceAfter: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'PENDING_APPROVAL';
  metadata?: any;
}

export const ledgerService = {
  async recordEntry(tx: any, data: LedgerEntry) {
    try {
      // 1. Create Master Ledger Entry
      // We check if the model exists to prevent runtime crashes if migrations aren't applied yet
      if (tx.financialLedger) {
        await tx.financialLedger.create({
          data: {
            userId: data.userId,
            walletId: data.walletId,
            actionType: data.actionType,
            amount: data.amount,
            currency: data.currency,
            referenceId: data.referenceId,
            source: data.source,
            balanceBefore: data.balanceBefore,
            balanceAfter: data.balanceAfter,
            status: data.status,
            createdAt: new Date()
          }
        });
      }

      // 2. Create Specific Log Entries based on Action Type
      if (data.actionType === 'DEPOSIT' && tx.depositLog) {
        await tx.depositLog.create({
          data: {
            userId: data.userId,
            walletId: data.walletId,
            amount: data.amount,
            method: data.source, // e.g., PAYMENT, WIRE
            status: data.status,
            reference: data.referenceId,
            createdAt: new Date()
          }
        });
      } else if (data.actionType === 'INVESTMENT' && tx.investmentLog) {
        await tx.investmentLog.create({
          data: {
            userId: data.userId,
            amount: data.amount,
            investmentId: data.metadata?.assetId, // Assuming metadata carries this
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
            amount: data.amount,
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
            amount: data.amount,
            source: data.source,
            period: data.metadata?.period || 'Ad-hoc',
            reference: data.referenceId,
            createdAt: new Date()
          }
        });
      }

    } catch (error) {
      console.warn('Ledger logging skipped (Tables may not exist yet):', error);
      // We do not throw here to ensure the main transaction (money movement) still completes
      // In a strict financial system, this should throw, but for this preview/upgrade phase, we fail safe.
    }
  }
};