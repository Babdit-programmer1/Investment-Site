
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { Money } from '../utils/money';

const prisma = new PrismaClient();

interface TaxYearSummary {
  year: number;
  totalIncome: number; 
  shortTermCapitalGains: number;
  longTermCapitalGains: number; 
  totalLiability: number;
  currency: string;
  generatedAt: Date;
}

export const taxEngine = {
  async generateTaxSummary(userId: string, year: number): Promise<TaxYearSummary> {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const incomeEvents = await prisma.financialLedger.findMany({
      where: {
        userId,
        actionType: 'PROFIT',
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Sum Income
    const totalIncome = incomeEvents.reduce((acc: any, tx: any) => Money.add(acc, tx.amount), Money.ZERO);

    const capitalEvents = await prisma.financialLedger.findMany({
      where: {
        userId,
        actionType: 'RETURN',
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    let shortTermCapitalGains = Money.ZERO;
    let longTermCapitalGains = Money.ZERO;

    capitalEvents.forEach((tx: any) => {
        const proceeds = Money.from(tx.amount);
        const estimatedBasis = Money.mul(proceeds, 0.8); // 20% margin
        const gain = Money.sub(proceeds, estimatedBasis);
        
        const isLongTerm = Math.random() > 0.5; // Mock logic
        
        if (isLongTerm) {
            longTermCapitalGains = Money.add(longTermCapitalGains, gain);
        } else {
            shortTermCapitalGains = Money.add(shortTermCapitalGains, gain);
        }
    });

    // Calculate Liability
    const taxIncome = Money.mul(totalIncome, 0.30);
    const taxShort = Money.mul(shortTermCapitalGains, 0.30);
    const taxLong = Money.mul(longTermCapitalGains, 0.20);
    
    const liability = Money.add(taxIncome, Money.add(taxShort, taxLong));

    return {
      year,
      totalIncome: Money.toNumber(totalIncome),
      shortTermCapitalGains: Money.toNumber(shortTermCapitalGains),
      longTermCapitalGains: Money.toNumber(longTermCapitalGains),
      totalLiability: Money.toNumber(liability),
      currency: 'USD',
      generatedAt: new Date()
    };
  }
};
