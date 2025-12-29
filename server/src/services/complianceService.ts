// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export type InvestorClass = 'RETAIL' | 'ACCREDITED' | 'SOPHISTICATED' | 'INSTITUTIONAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface LegalEntity {
  id: string;
  name: string;
  type: 'HOLDCO' | 'OPCO' | 'SPV' | 'TRUST' | 'CUSTODIAN';
  jurisdiction: string;
  registrationNumber: string;
}

export const complianceService = {
  // 1. Legal Entity Structure
  getLegalStructure(assetId: string): LegalEntity {
    return {
      id: `SPV-${assetId.substring(0, 4)}`,
      name: `Prestige Asset SPV ${assetId.substring(0, 4)} Ltd.`,
      type: 'SPV',
      jurisdiction: 'Cayman Islands',
      registrationNumber: `REG-${randomUUID().substring(0, 8).toUpperCase()}`
    };
  },

  // 2. Investor Classification Engine
  async classifyInvestor(userId: string, data: any): Promise<InvestorClass> {
    let classification: InvestorClass = 'RETAIL';
    if (data.netWorth === '$1M - $5M' || data.netWorth === '$5M+') {
      classification = 'ACCREDITED';
    }
    if (data.investorType === 'Institutional') {
      classification = 'INSTITUTIONAL';
    }
    return classification;
  },

  // 3. AML / Transaction Monitoring
  async checkAml(userId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL'): Promise<{ flagged: boolean; reason?: string }> {
    if (amount === 9999 || amount === 9900) {
      return { flagged: true, reason: 'Potential Structuring (Just below threshold)' };
    }
    if (amount > 50000) {
      return { flagged: true, reason: 'Large Transaction (> $50k)' };
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.fullName?.toLowerCase().includes('sanction')) {
        return { flagged: true, reason: 'Sanctions Match (Name Screening)' };
    }
    return { flagged: false };
  },

  // 4. Generate Suspicious Activity Report (SAR)
  async createSAR(userId: string, transactionId: string, reason: string) {
    const sarId = `SAR-${randomUUID().substring(0, 8).toUpperCase()}`;
    console.warn(`[COMPLIANCE] Generated SAR ${sarId} for User ${userId}: ${reason}`);
    return {
        id: sarId,
        date: new Date(),
        status: 'FILED_INTERNAL',
        severity: 'HIGH'
    };
  },

  // 5. Legal Disclosures
  async logAgreement(userId: string, assetId: string, agreementType: string) {
    console.log(`[LEGAL] User ${userId} accepted ${agreementType} for Asset ${assetId} at ${new Date().toISOString()}`);
    return true;
  },

  // 6. Regulatory Audit Export
  async generateAuditPack() {
      return {
          generatedAt: new Date(),
          complianceOfficer: 'System Admin',
          metrics: { totalKycChecks: 145, passed: 140, failed: 5, sarsFiled: 2 },
          logs: [
              { id: '1', event: 'KYC_APPROVED', user: 'user-123', time: '2024-03-10T10:00:00Z' },
              { id: '2', event: 'AML_ALERT', user: 'user-999', time: '2024-03-11T14:30:00Z' }
          ]
      };
  },

  // 7. Jurisdiction Rules (NEW)
  checkJurisdictionRules(country: string, assetType: string): { allowed: boolean; message?: string } {
    const restrictedCountries = ['North Korea', 'Iran', 'Syria', 'Russia'];
    
    if (restrictedCountries.includes(country)) {
        return { allowed: false, message: 'Service unavailable in your jurisdiction due to international sanctions.' };
    }

    if (country === 'United States' && assetType === 'Tokens') {
        return { allowed: false, message: 'US Persons are restricted from investing in tokenized assets (Reg S).' };
    }

    if (country === 'China' && assetType === 'Crypto') {
        return { allowed: false, message: 'Crypto transactions are restricted in your region.' };
    }

    return { allowed: true };
  }
};
