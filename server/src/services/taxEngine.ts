// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TaxYearSummary {
  year: number;
  totalIncome: number; // Dividends/Yields
  shortTermCapitalGains: number;
  longTermCapitalGains: number; // > 1 year holding
  totalLiability: number;
  currency: string;
  generatedAt: Date;
}

export const taxEngine = {
  /**
   * Calculates estimated tax liability for a given year based on ledger activity.
   * Logic:
   * - PROFIT events are treated as Ordinary Income (Yields/Dividends).
   * - RETURN events (Asset Sales/Exits) calculate Capital Gains (Proceeds - Cost Basis).
   */
  async generateTaxSummary(userId: string, year: number): Promise<TaxYearSummary> {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    // 1. Fetch Income Events (Yields/Dividends)
    const incomeEvents = await prisma.financialLedger.findMany({
      where: {
        userId,
        actionType: 'PROFIT',
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const totalIncome = incomeEvents.reduce((acc: number, tx: any) => acc + tx.amount, 0);

    // 2. Fetch Capital Events (Exits)
    // In a full implementation, we'd match these against the original INVESTMENT entry to find Cost Basis.
    // For this engine, we mock the gain portion as 20% of any 'RETURN' action.
    const capitalEvents = await prisma.financialLedger.findMany({
      where: {
        userId,
        actionType: 'RETURN', // Implies asset liquidation/exit
        status: 'COMPLETED',
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    // Mock Capital Gains Logic
    let shortTermCapitalGains = 0;
    let longTermCapitalGains = 0;

    capitalEvents.forEach((tx: any) => {
        const proceeds = tx.amount;
        const estimatedBasis = proceeds * 0.8; // Assume 20% profit margin
        const gain = proceeds - estimatedBasis;
        
        // Mock holding period check
        const isLongTerm = Math.random() > 0.5; 
        
        if (isLongTerm) {
            longTermCapitalGains += gain;
        } else {
            shortTermCapitalGains += gain;
        }
    });

    // 3. Calculate Liability (Mock Rates)
    // Income: 30%, Short Term CG: 30%, Long Term CG: 20%
    const liability = (totalIncome * 0.30) + (shortTermCapitalGains * 0.30) + (longTermCapitalGains * 0.20);

    return {
      year,
      totalIncome,
      shortTermCapitalGains,
      longTermCapitalGains,
      totalLiability: liability,
      currency: 'USD',
      generatedAt: new Date()
    };
  }
};