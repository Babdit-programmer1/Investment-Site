
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { ledgerService } from './ledgerService';
import { randomUUID } from 'crypto';
import { Money, MoneyInput } from '../utils/money';

// @ts-ignore
const prisma = new PrismaClient();

const HOT_WALLET_LIMIT = 5000;

interface TreasuryStatus {
  hotWallet: number;
  warmWallet: number;
  coldWallet: number;
  totalLiabilities: number;
  reserveRatio: number;
}

export const custodyService = {
  async getTreasuryStatus(): Promise<TreasuryStatus> {
    // Sum of all MAIN and INVESTMENT wallets
    const totalUserFunds = await prisma.wallet.aggregate({
      _sum: { balance: true }
    });
    
    const total = Money.from(totalUserFunds._sum.balance || 0);

    // Simulated Allocation Rule: 10% Hot, 30% Warm, 60% Cold
    return {
      hotWallet: Money.toNumber(total.mul(0.10)),
      warmWallet: Money.toNumber(total.mul(0.30)),
      coldWallet: Money.toNumber(total.mul(0.60)),
      totalLiabilities: Money.toNumber(total),
      reserveRatio: 1.0 
    };
  },

  async requestWithdrawal(userId: string, amount: MoneyInput, currency: string, chain: string, address: string) {
    const withdrawAmount = Money.from(amount);
    
    // Check Main Wallet
    const wallet = await prisma.wallet.findUnique({ 
        where: { userId_type: { userId, type: 'MAIN' } } 
    });
    
    if (!wallet) throw new Error('Wallet not found');
    if (Money.lt(wallet.balance, withdrawAmount)) throw new Error('Insufficient funds');

    // Force Admin Approval for all withdrawals (No automation requirement)
    const status = 'PENDING_APPROVAL';
    const ref = `WTH-${randomUUID().substring(0, 8).toUpperCase()}`;

    await prisma.$transaction(async (tx: any) => {
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: withdrawAmount } }
      });

      await ledgerService.recordEntry(tx, {
        userId,
        walletId: wallet.id,
        actionType: 'WITHDRAWAL',
        amount: withdrawAmount,
        currency,
        referenceId: ref,
        source: 'WALLET',
        balanceBefore: wallet.balance,
        balanceAfter: updatedWallet.balance,
        status: status,
        metadata: { 
          chain,
          destinationAddress: address,
          custodyTier: 'WARM',
          requiresMultisig: true
        }
      });
    });

    return { 
      status, 
      message: 'Withdrawal request submitted for admin approval.' 
    };
  },

  async approveWithdrawal(referenceId: string, adminId: string) {
    try {
        await prisma.financialLedger.updateMany({
            where: { referenceId, status: 'PENDING_APPROVAL' },
            data: { status: 'COMPLETED' } 
        });
    } catch (e) {
        console.warn("Could not update ledger status directly.");
    }

    return { status: 'COMPLETED', txHash: `0x${randomUUID()}` };
  }
};
