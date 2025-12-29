import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';
import { custodyService } from '../services/custodyService';

const prisma = new PrismaClient();

export const getWallet = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { 
        transactions: { orderBy: { createdAt: 'desc' } },
        cryptoBalances: true
      }
    });

    // Create if missing (migration for existing users)
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
        include: { transactions: true, cryptoBalances: true }
      });
    }

    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching wallet' });
  }
};

export const deposit = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { amount, currency, type } = req.body; // type = 'FIAT' or 'CRYPTO'

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    await prisma.$transaction(async (tx: any) => {
      const ref = `DEP-${randomUUID().substring(0, 8).toUpperCase()}`;
      const balanceBefore = wallet.fiatBalance;
      let balanceAfter = balanceBefore;

      if (type === 'FIAT') {
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: { fiatBalance: { increment: amount } }
        });
        balanceAfter = updatedWallet.fiatBalance;
      } else {
        // Find or create crypto balance
        const existingCrypto = await tx.cryptoBalance.findFirst({
            where: { walletId: wallet.id, asset: currency }
        });
        
        if (existingCrypto) {
            await tx.cryptoBalance.update({
                where: { id: existingCrypto.id },
                data: { balance: { increment: amount } }
            });
        } else {
            await tx.cryptoBalance.create({
                data: { walletId: wallet.id, asset: currency, balance: amount }
            });
        }
      }

      // Legacy Transaction Log
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount,
          currency,
          reference: ref,
          status: 'COMPLETED'
        }
      });

      // Unified Ledger Log
      await ledgerService.recordEntry(tx, {
        userId,
        walletId: wallet.id,
        actionType: 'DEPOSIT',
        amount,
        currency,
        referenceId: ref,
        source: 'PAYMENT',
        balanceBefore,
        balanceAfter: type === 'FIAT' ? balanceAfter : balanceBefore,
        status: 'COMPLETED',
        metadata: { type }
      });
    });

    res.json({ message: 'Deposit successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deposit failed' });
  }
};

export const withdraw = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { amount, currency = 'USD' } = req.body;

  try {
    const result = await custodyService.requestWithdrawal(userId, amount, currency);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Withdrawal failed' });
  }
};