
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
    let score = 0; 

    if (user.kycStatus === 'REJECTED') score += 100;
    else if (user.kycStatus === 'PENDING') score += 20;

    if (amount > 100000) {
        score += 35;
        reasons.push('High Value: Exceeds automated clearance threshold');
    }

    const amlCheck = await complianceService.checkAml(userId, amount, type as any);
    if (amlCheck.flagged) {
        score += 50;
        reasons.push(`AML Engine: ${amlCheck.reason}`);
    }

    score = Math.min(100, score);

    let level: RiskLevel = 'LOW';
    let action: RiskAction = 'ALLOW';

    if (score >= 80) {
        level = 'HIGH';
        action = 'BLOCK';
    } else if (score >= 40) {
        level = 'MEDIUM';
        action = 'REVIEW';
    }

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
      // In production, this would query a dedicated Alerts table or AuditLog
      return []; 
  }
};
