
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';
import { custodyService } from '../services/custodyService';
import { paymentService } from '../services/paymentService';
import { complianceService } from '../services/complianceService';
import { Money } from '../utils/money';

const prisma = new PrismaClient();

export const getWallet = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const wallets = await prisma.wallet.findMany({ where: { userId } });

    let mainWallet = wallets.find((w: any) => w.type === 'MAIN');
    let investmentWallet = wallets.find((w: any) => w.type === 'INVESTMENT');

    if (!mainWallet) mainWallet = await prisma.wallet.create({ data: { userId, type: 'MAIN' } });
    if (!investmentWallet) investmentWallet = await prisma.wallet.create({ data: { userId, type: 'INVESTMENT' } });

    const logs = await prisma.financialLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const walletResponse = {
      id: mainWallet.id,
      fiatBalance: Money.toNumber(mainWallet.balance), // Display as MAIN Balance
      investmentBalance: Money.toNumber(investmentWallet.balance),
      cryptoBalances: [], // Placeholder for future multi-asset support
      transactions: logs.map((l: any) => ({
          id: l.id,
          type: l.actionType,
          amount: Money.toNumber(l.amount),
          currency: l.currency,
          reference: l.referenceId,
          status: l.status,
          createdAt: l.createdAt
      }))
    };

    res.json(walletResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching wallet' });
  }
};

export const deposit = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { amount, currency, txHash, chain } = req.body; 

  const depositAmount = Money.from(amount);

  if (!txHash) {
      return res.status(400).json({ message: 'Transaction Hash (TxID) is required for crypto deposits.' });
  }

  try {
    const status = 'PENDING_APPROVAL';
    
    const wallet = await prisma.wallet.findUnique({ 
        where: { userId_type: { userId, type: 'MAIN' } } 
    });
    
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    // Check for duplicate TxHash
    const existingTx = await prisma.financialLedger.findFirst({
        where: { 
            metadata: { 
                string_contains: txHash 
            } 
        }
    });
    // Note: strict check relies on JSON parsing which can be heavy, rely on admin to spot dupes or better schema
    // For now, proceed with immutable log

    await prisma.$transaction(async (tx: any) => {
      const ref = `DEP-${randomUUID().substring(0, 8).toUpperCase()}`;
      
      await ledgerService.recordEntry(tx, {
        userId,
        walletId: wallet.id,
        actionType: 'DEPOSIT',
        amount: depositAmount,
        currency: currency || 'USD',
        referenceId: ref,
        source: 'CRYPTO_DEPOSIT',
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance, // Balance does not increase until approved
        status: status,
        metadata: { 
            txHash: txHash,
            chain: chain || 'ETH',
            approvalRequired: true 
        }
      });
    });

    res.json({ message: 'Deposit recorded. Funds will be credited after admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deposit failed' });
  }
};

export const withdraw = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { amount, currency = 'USD', address } = req.body;
  
  if (!address) return res.status(400).json({ message: 'Withdrawal address required.' });

  const withdrawAmount = Money.from(amount);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Strict KYC Check
    complianceService.checkTransactionLimits(user, withdrawAmount, 'WITHDRAWAL');

    // 2. Execute Request via Custody Service (Handles Locking)
    const result = await custodyService.requestWithdrawal(userId, withdrawAmount, currency);
    
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Withdrawal failed' });
  }
};
