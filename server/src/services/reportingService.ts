
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { currencyService } from './currencyService';
import { Money } from '../utils/money';

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
  async getPnL(userId: string, targetCurrency: string = 'USD'): Promise<PnLSummary> {
    const portfolio = await prisma.userPortfolio.findMany({
      where: { userId, status: 'ACTIVE' },
      include: { asset: true }
    });

    // Sum using Decimal
    const investedUnrealizedUSD = portfolio.reduce((acc: any, item: any) => 
        Money.add(acc, item.amount), Money.ZERO);
    
    // Mock 5% appreciation using Decimal multiplication
    const currentValuationUSD = Money.mul(investedUnrealizedUSD, 1.05); 
    const unrealizedGainsUSD = Money.sub(currentValuationUSD, investedUnrealizedUSD);

    const realizedProfits = await prisma.financialLedger.aggregate({
      where: { userId, actionType: 'PROFIT' },
      _sum: { amount: true }
    });
    
    const realizedGainsUSD = Money.from(realizedProfits._sum.amount || 0);
    const totalInvestedUSD = investedUnrealizedUSD; 
    const totalGainUSD = Money.add(realizedGainsUSD, unrealizedGainsUSD);
    
    let totalRoi = 0;
    if (Money.gt(totalInvestedUSD, 0)) {
        // (Gain / Invested) * 100
        totalRoi = Money.toNumber(Money.div(totalGainUSD, totalInvestedUSD).mul(100));
    }

    return {
      totalInvested: currencyService.convert(Money.toNumber(totalInvestedUSD), 'USD', targetCurrency),
      currentValue: currencyService.convert(Money.toNumber(currentValuationUSD), 'USD', targetCurrency),
      realizedGains: currencyService.convert(Money.toNumber(realizedGainsUSD), 'USD', targetCurrency),
      unrealizedGains: currencyService.convert(Money.toNumber(unrealizedGainsUSD), 'USD', targetCurrency),
      totalRoi,
      currency: targetCurrency
    };
  },

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
