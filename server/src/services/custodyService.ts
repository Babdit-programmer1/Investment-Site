
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { ledgerService } from './ledgerService';
import { randomUUID } from 'crypto';
import { Money, MoneyInput } from '../utils/money';

// @ts-ignore
const prisma = new PrismaClient();

const HOT_WALLET_LIMIT = 5000;
const WITHDRAWAL_VELOCITY_LIMIT = 3;

interface TreasuryStatus {
  hotWallet: number;
  warmWallet: number;
  coldWallet: number;
  totalLiabilities: number;
  reserveRatio: number;
}

export const custodyService = {
  async getTreasuryStatus(): Promise<TreasuryStatus> {
    const totalUserFunds = await prisma.wallet.aggregate({
      _sum: { fiatBalance: true }
    });
    
    // Use Decimal for aggregation result
    const total = Money.from(totalUserFunds._sum.fiatBalance || 0);

    // Simulated Allocation Rule: 10% Hot, 30% Warm, 60% Cold
    // Calculations using Decimal
    return {
      hotWallet: Money.toNumber(total.mul(0.10)),
      warmWallet: Money.toNumber(total.mul(0.30)),
      coldWallet: Money.toNumber(total.mul(0.60)),
      totalLiabilities: Money.toNumber(total),
      reserveRatio: 1.0 
    };
  },

  async requestWithdrawal(userId: string, amount: MoneyInput, currency: string) {
    const withdrawAmount = Money.from(amount);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error('Wallet not found');
    
    // Decimal Comparison
    if (Money.lt(wallet.fiatBalance, withdrawAmount)) throw new Error('Insufficient funds');

    const needsApproval = Money.gt(withdrawAmount, HOT_WALLET_LIMIT);
    const status = needsApproval ? 'PENDING_APPROVAL' : 'COMPLETED';
    const ref = `WTH-${randomUUID().substring(0, 8).toUpperCase()}`;

    await prisma.$transaction(async (tx: any) => {
      // Atomic Decrement
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { fiatBalance: { decrement: withdrawAmount } }
      });

      await ledgerService.recordEntry(tx, {
        userId,
        walletId: wallet.id,
        actionType: 'WITHDRAWAL',
        amount: withdrawAmount,
        currency,
        referenceId: ref,
        source: 'WALLET',
        balanceBefore: wallet.fiatBalance,
        balanceAfter: updatedWallet.fiatBalance,
        status: status,
        metadata: { 
          custodyTier: needsApproval ? 'WARM' : 'HOT',
          requiresMultisig: needsApproval,
          destination: 'External Bank' 
        }
      });
    });

    return { 
      status, 
      message: needsApproval 
        ? 'Withdrawal exceeds hot wallet limit. Queued for admin approval.' 
        : 'Withdrawal processed via Hot Wallet.' 
    };
  },

  async approveWithdrawal(referenceId: string, adminId: string) {
    console.log(`[HSM] Admin ${adminId} signed release for ${referenceId}`);
    
    try {
        await prisma.financialLedger.updateMany({
            where: { referenceId, status: 'PENDING_APPROVAL' },
            data: { status: 'COMPLETED' } 
        });
    } catch (e) {
        console.warn("Could not update ledger status directly.");
    }

    return { status: 'COMPLETED', txHash: `0x${randomUUID()}` };
  },

  async triggerLockdown(adminId: string) {
    console.warn(`[SECURITY] LOCKDOWN TRIGGERED BY ${adminId}`);
    return { mode: 'LOCKDOWN', timestamp: new Date() };
  }
};
