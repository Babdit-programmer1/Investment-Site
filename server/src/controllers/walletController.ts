
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';
import { custodyService } from '../services/custodyService';
import { complianceService } from '../services/complianceService';
import { riskEngine } from '../services/riskEngine';
import { Money } from '../utils/money';

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

  // Input sanitization: Convert input to Decimal immediately
  const depositAmount = Money.from(amount);

  try {
    // 1. AI Risk Engine Analysis (Convert back to number for legacy risk scoring)
    const riskAnalysis = await riskEngine.analyzeTransaction(userId, 'DEPOSIT', Money.toNumber(depositAmount), { currency, type });
    
    if (riskAnalysis.action === 'BLOCK') {
        return res.status(403).json({ 
            message: 'Transaction blocked by security engine.', 
            reason: riskAnalysis.reasons[0] 
        });
    }

    // 2. AML Compliance
    const amlCheck = await complianceService.checkAml(userId, Money.toNumber(depositAmount), 'DEPOSIT');
    
    let status = 'COMPLETED';
    let warningMsg = undefined;

    if (riskAnalysis.action === 'REVIEW' || amlCheck.flagged) {
        status = 'PENDING_APPROVAL';
        warningMsg = 'Transaction queued for manual compliance review.';
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    await prisma.$transaction(async (tx: any) => {
      const ref = `DEP-${randomUUID().substring(0, 8).toUpperCase()}`;
      
      // Capture current balance as Decimal
      const balanceBefore = Money.from(wallet.fiatBalance);
      let balanceAfter = balanceBefore;

      if (status === 'COMPLETED') {
          if (type === 'FIAT') {
            const updatedWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: { fiatBalance: { increment: depositAmount } } // Prisma handles Decimal atomic increment
            });
            balanceAfter = updatedWallet.fiatBalance;
          } else {
            const existingCrypto = await tx.cryptoBalance.findFirst({
                where: { walletId: wallet.id, asset: currency }
            });
            
            if (existingCrypto) {
                await tx.cryptoBalance.update({
                    where: { id: existingCrypto.id },
                    data: { balance: { increment: depositAmount } }
                });
            } else {
                await tx.cryptoBalance.create({
                    data: { walletId: wallet.id, asset: currency, balance: depositAmount }
                });
            }
          }
      }

      await ledgerService.recordEntry(tx, {
        userId,
        walletId: wallet.id,
        actionType: 'DEPOSIT',
        amount: depositAmount,
        currency,
        referenceId: ref,
        source: 'PAYMENT',
        balanceBefore,
        balanceAfter: type === 'FIAT' && status === 'COMPLETED' ? balanceAfter : balanceBefore,
        status: status as any,
        metadata: { type, riskScore: riskAnalysis.score, riskReasons: riskAnalysis.reasons }
      });
    });

    if (status === 'PENDING_APPROVAL') {
        return res.json({ status: 'PENDING_APPROVAL', message: warningMsg });
    }

    res.json({ message: 'Deposit successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deposit failed' });
  }
};

export const withdraw = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { amount, currency = 'USD' } = req.body;
  
  const withdrawAmount = Money.from(amount);

  try {
    const riskAnalysis = await riskEngine.analyzeTransaction(userId, 'WITHDRAWAL', Money.toNumber(withdrawAmount), { currency });

    if (riskAnalysis.action === 'BLOCK') {
        return res.status(403).json({ 
            message: 'Withdrawal blocked due to security risk.', 
            reason: riskAnalysis.reasons[0] 
        });
    }

    if (riskAnalysis.action === 'REVIEW') {
         return res.json({ 
             status: 'PENDING_APPROVAL', 
             message: 'Withdrawal flagged for manual review due to risk score.' 
         });
    }

    // 2. Custody Service
    const result = await custodyService.requestWithdrawal(userId, withdrawAmount, currency);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Withdrawal failed' });
  }
};
