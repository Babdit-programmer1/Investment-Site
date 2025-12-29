import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';
import { custodyService } from '../services/custodyService';
import { complianceService } from '../services/complianceService';
import { riskEngine } from '../services/riskEngine';

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
    // 1. AI Risk Engine Analysis
    const riskAnalysis = await riskEngine.analyzeTransaction(userId, 'DEPOSIT', amount, { currency, type });
    
    if (riskAnalysis.action === 'BLOCK') {
        return res.status(403).json({ 
            message: 'Transaction blocked by security engine.', 
            reason: riskAnalysis.reasons[0] 
        });
    }

    // 2. AML Compliance (Legacy check, usually covered by Risk Engine now, but kept for double safety)
    const amlCheck = await complianceService.checkAml(userId, amount, 'DEPOSIT');
    
    // Determine Status based on Risk & AML
    let status = 'COMPLETED';
    let warningMsg = undefined;

    if (riskAnalysis.action === 'REVIEW' || amlCheck.flagged) {
        status = 'PENDING_APPROVAL';
        warningMsg = 'Transaction queued for manual compliance review.';
        // In a real app, we might not credit the wallet yet. 
        // For this hybrid preview, we might credit but lock withdrawals, or hold it pending.
        // Let's hold it pending (no balance update).
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    await prisma.$transaction(async (tx: any) => {
      const ref = `DEP-${randomUUID().substring(0, 8).toUpperCase()}`;
      const balanceBefore = wallet.fiatBalance;
      let balanceAfter = balanceBefore;

      if (status === 'COMPLETED') {
          if (type === 'FIAT') {
            const updatedWallet = await tx.wallet.update({
              where: { id: wallet.id },
              data: { fiatBalance: { increment: amount } }
            });
            balanceAfter = updatedWallet.fiatBalance;
          } else {
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
      }

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

  try {
    // 1. AI Risk Engine Analysis
    const riskAnalysis = await riskEngine.analyzeTransaction(userId, 'WITHDRAWAL', amount, { currency });

    if (riskAnalysis.action === 'BLOCK') {
        return res.status(403).json({ 
            message: 'Withdrawal blocked due to security risk.', 
            reason: riskAnalysis.reasons[0] 
        });
    }

    if (riskAnalysis.action === 'REVIEW') {
         // Create a pending ledger entry but do not process via custody yet
         // Or tell custody to hold it. 
         // For simplicity, we return pending state to UI.
         return res.json({ 
             status: 'PENDING_APPROVAL', 
             message: 'Withdrawal flagged for manual review due to risk score.' 
         });
    }

    // 2. Custody Service (Hot/Warm/Cold logic)
    const result = await custodyService.requestWithdrawal(userId, amount, currency);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Withdrawal failed' });
  }
};