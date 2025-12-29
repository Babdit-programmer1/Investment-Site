// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type KycLevel = 'UNVERIFIED' | 'BASIC' | 'FULL';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEW';

interface KycData {
  step: number;
  identity?: { firstName: string; lastName: string; dob: string; nationality: string };
  document?: { type: string; number: string; expiry: string; frontUrl: string };
  address?: { street: string; city: string; country: string; proofUrl: string };
  selfie?: { url: string };
}

export const kycService = {
  async getKycProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    const profile = user.profileData ? JSON.parse(user.profileData) : {};
    return {
      status: user.kycStatus,
      level: profile.kycLevel || 'UNVERIFIED',
      currentStep: profile.kycStep || 1,
      riskScore: profile.riskScore || 0,
      details: profile.kycDetails || {}
    };
  },

  async submitStep(userId: string, step: number, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const profile = user.profileData ? JSON.parse(user.profileData) : {};
    const kycDetails = profile.kycDetails || {};

    // Merge new data
    const updatedDetails = { ...kycDetails, ...data };
    
    // Determine Status & Level updates
    let newStatus = user.kycStatus;
    let newLevel = profile.kycLevel || 'UNVERIFIED';

    if (step === 1) {
        newLevel = 'BASIC'; // Basic info provided
    }
    
    if (step === 4) {
        newStatus = 'PENDING'; // Fully submitted, awaiting admin
        // Run Mock AML Check on final submission
        const amlResult = await this.runAmlCheck(updatedDetails);
        if (amlResult.flagged) {
            newStatus = 'REVIEW'; // Flag for manual review
        }
    }

    // Update User
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: newStatus,
        profileData: JSON.stringify({
          ...profile,
          kycStep: step < 4 ? step + 1 : 4,
          kycLevel: newLevel,
          kycDetails: updatedDetails,
          lastKycUpdate: new Date()
        })
      }
    });

    return { status: newStatus, step: step < 4 ? step + 1 : 4 };
  },

  async runAmlCheck(data: any) {
    // Mock AML/Sanctions Screening
    console.log(`[AML] Screening user ${data.identity?.lastName}...`);
    
    const highRiskCountries = ['North Korea', 'Iran', 'Syria'];
    const isHighRiskCountry = highRiskCountries.includes(data.address?.country);
    
    // Mock PEP detection (Politically Exposed Person)
    const isPep = data.identity?.lastName?.toLowerCase() === 'doe'; // Example trigger

    return {
      flagged: isHighRiskCountry || isPep,
      reasons: [
        isHighRiskCountry ? 'High Risk Jurisdiction' : null,
        isPep ? 'Potential PEP Match' : null
      ].filter(Boolean)
    };
  },

  async calculateRiskScore(user: any): Promise<number> {
    let score = 10; // Base score
    const profile = user.profileData ? JSON.parse(user.profileData) : {};
    const country = profile.kycDetails?.address?.country;

    if (user.investorType === 'Institutional') score += 10;
    if (country === 'US' || country === 'UK') score -= 5;
    if (country === 'Cayman Islands') score += 20;

    // Transaction volume check (Mock)
    // if (totalVolume > 100000) score += 15;

    return Math.min(100, Math.max(0, score));
  },

  async logComplianceAction(userId: string, action: string, adminId?: string, reason?: string) {
    // Ideally this goes to a ComplianceLog table. 
    // For now, we log to console and could append to a JSON log file or DB field.
    console.log(`[COMPLIANCE] User: ${userId} | Action: ${action} | Admin: ${adminId} | Reason: ${reason}`);
  }
};