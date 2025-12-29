// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { currencyService } from './currencyService';

const prisma = new PrismaClient();

interface PnLSummary {
  totalInvested: number;
  currentValue: number;
  realizedGains: number;
  unrealizedGains: number;
  totalRoi: number;
  currency: string;
}

export const reportingService = {
  /**
   * Generates a comprehensive P&L analysis for the user in their preferred currency.
   */
  async getPnL(userId: string, targetCurrency: string = 'USD'): Promise<PnLSummary> {
    // 1. Get Active Portfolio (Unrealized)
    const portfolio = await prisma.userPortfolio.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { asset: true }
    });

    // Base amounts are in USD (stored in DB)
    const investedUnrealizedUSD = portfolio.reduce((acc: number, item: any) => acc + item.amount, 0);
    const currentValuationUSD = Math.floor(investedUnrealizedUSD * 1.05); // Mock 5% appreciation
    const unrealizedGainsUSD = currentValuationUSD - investedUnrealizedUSD;

    // 2. Get Realized History
    const realizedProfits = await prisma.financialLedger.aggregate({
      where: { userId, actionType: 'PROFIT' },
      _sum: { amount: true }
    });
    
    const realizedGainsUSD = realizedProfits._sum.amount || 0;
    const totalInvestedUSD = investedUnrealizedUSD; 
    const totalGainUSD = realizedGainsUSD + unrealizedGainsUSD;
    const totalRoi = totalInvestedUSD > 0 ? (totalGainUSD / totalInvestedUSD) * 100 : 0;

    // 3. Convert to Target Currency
    return {
      totalInvested: currencyService.convert(totalInvestedUSD, 'USD', targetCurrency),
      currentValue: currencyService.convert(currentValuationUSD, 'USD', targetCurrency),
      realizedGains: currencyService.convert(realizedGainsUSD, 'USD', targetCurrency),
      unrealizedGains: currencyService.convert(unrealizedGainsUSD, 'USD', targetCurrency),
      totalRoi,
      currency: targetCurrency
    };
  },

  /**
   * Fetches raw transaction history.
   */
  async getTransactionHistory(userId: string, filterType?: string) {
    const where: any = { userId };
    if (filterType && filterType !== 'ALL') {
      where.actionType = filterType;
    }

    const transactions = await prisma.financialLedger.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return transactions;
  }
};
