// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { complianceService } from './complianceService';

const prisma = new PrismaClient();

export type RiskAction = 'ALLOW' | 'REVIEW' | 'BLOCK';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface RiskAnalysisResult {
  score: number;
  level: RiskLevel;
  action: RiskAction;
  reasons: string[];
  requiresManualReview: boolean;
}

export const riskEngine = {
  async analyzeTransaction(userId: string, type: string, amount: number, metadata: any = {}): Promise<RiskAnalysisResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const reasons: string[] = [];
    let score = 0; // 0-100

    // 1. Base Score from User Profile (KYC/AML)
    if (user.kycStatus === 'REJECTED') score += 100;
    else if (user.kycStatus === 'PENDING') score += 20;
    else if (user.kycStatus === 'REVIEW') score += 40;

    // Admin Override
    if (user.role === 'ADMIN') score = 0;

    // 2. Velocity Check (Simulated)
    // In production: Query DB for recent transactions
    if (amount === 3333) {
        score += 45;
        reasons.push('Velocity Alert: Abnormal frequency detected');
    }

    // 3. Large Amount Anomalies
    if (amount > 100000) {
        score += 35;
        reasons.push('High Value: Exceeds automated clearance threshold');
    }

    // 4. Geolocation / Network Mismatch (Simulated via metadata)
    if (metadata.ipCountry && user.country && metadata.ipCountry !== user.country) {
        score += 25;
        reasons.push(`Geo Mismatch: IP (${metadata.ipCountry}) != Profile (${user.country})`);
    }

    // 5. Investment Pattern Analysis (AI Mock)
    if (type === 'INVESTMENT' && user.investorType === 'Individual' && amount > 50000) {
        score += 30;
        reasons.push('Pattern Mismatch: Large investment for profile type');
    }

    // 6. Integrate Compliance AML Check
    const amlCheck = await complianceService.checkAml(userId, amount, type as any);
    if (amlCheck.flagged) {
        score += 50;
        reasons.push(`AML Engine: ${amlCheck.reason}`);
    }

    // Cap Score
    score = Math.min(100, score);

    // Determine Level & Action
    let level: RiskLevel = 'LOW';
    let action: RiskAction = 'ALLOW';

    if (score >= 80) {
        level = 'HIGH';
        action = 'BLOCK';
    } else if (score >= 40) {
        level = 'MEDIUM';
        action = 'REVIEW';
    }

    // Log the risk event
    console.log(`[RISK ENGINE] User: ${userId} | Type: ${type} | Score: ${score} (${level}) | Action: ${action}`);

    // If High Risk, auto-file SAR
    if (level === 'HIGH') {
        await complianceService.createSAR(userId, `${type}_ATTEMPT`, `High Risk Score (${score}): ${reasons.join(', ')}`);
    }

    return {
        score,
        level,
        action,
        reasons,
        requiresManualReview: action === 'REVIEW'
    };
  },

  async getRecentAlerts() {
      // Mock data for admin dashboard visualization
      return [
          { id: 'r1', user: 'James Sterling', type: 'WITHDRAWAL', score: 45, level: 'MEDIUM', action: 'REVIEW', reasons: ['Velocity Limit'], timestamp: new Date() },
          { id: 'r2', user: 'Sarah Connor', type: 'DEPOSIT', score: 85, level: 'HIGH', action: 'BLOCK', reasons: ['Sanctions Match', 'Geo Mismatch'], timestamp: new Date(Date.now() - 3600000) },
          { id: 'r3', user: 'Marcus Thorne', type: 'INVESTMENT', score: 35, level: 'MEDIUM', action: 'REVIEW', reasons: ['Large First Investment'], timestamp: new Date(Date.now() - 7200000) },
          { id: 'r4', user: 'Guest User', type: 'KYC_SUBMISSION', score: 90, level: 'HIGH', action: 'BLOCK', reasons: ['Fake ID Detected'], timestamp: new Date(Date.now() - 14400000) },
      ];
  }
};