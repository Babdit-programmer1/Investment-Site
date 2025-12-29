// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory cache for user recommendations to reduce DB/AI load
const recommendationCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface SimulationResult {
  year: number;
  conservative: number;
  moderate: number;
  aggressive: number;
}

export const aiAdvisorService = {
  /**
   * Generates a personalized investment recommendation based on:
   * 1. User's stated interests (from onboarding)
   * 2. Current portfolio composition (diversification check)
   * 3. Investor type (Risk tolerance)
   */
  async generateRecommendation(userId: string) {
    const now = Date.now();
    const cached = recommendationCache.get(userId);
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
      return cached.data;
    }

    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        include: { portfolio: { include: { asset: true } } }
    });

    if (!user) throw new Error('User not found');

    const interests = user.interests ? JSON.parse(user.interests) : [];
    const portfolio = user.portfolio || [];
    
    // Determine under-represented categories
    const ownedCategories = new Set(portfolio.map((p: any) => p.asset.category));
    
    // Find assets that match interest but aren't owned
    const allAssets = await prisma.investment.findMany({ where: { status: 'ACTIVE' } });
    
    let candidates = allAssets.filter((asset: any) => 
        !ownedCategories.has(asset.category) && // Diversification
        (interests.includes(asset.category) || interests.length === 0) // Interest match
    );

    // If no direct matches, fallback to high-performing assets
    if (candidates.length === 0) {
        candidates = allAssets.filter((asset: any) => !portfolio.find((p: any) => p.assetId === asset.id));
    }

    // Scoring logic
    const scoredCandidates = candidates.map((asset: any) => {
        let score = 0;
        // Interest alignment
        if (interests.includes(asset.category)) score += 30;
        // Risk alignment
        if (user.investorType === 'Individual' && asset.riskLevel === 'Low') score += 20;
        if (user.investorType === 'High Net Worth' && asset.riskLevel === 'Medium') score += 20;
        if (user.investorType === 'Institutional' && asset.riskLevel === 'High') score += 20;
        // Return potential
        score += parseFloat(asset.returnRate) * 2;
        
        return { asset, score };
    });

    // Sort by score
    scoredCandidates.sort((a: any, b: any) => b.score - a.score);

    const topPick = scoredCandidates[0];

    const result = {
        recommendation: topPick ? topPick.asset : null,
        matchScore: topPick ? Math.min(99, Math.floor(topPick.score)) : 0,
        reason: topPick 
            ? `Matches your interest in ${topPick.asset.category} and fits your ${user.investorType} risk profile.` 
            : "Diversify your portfolio with high-yield assets."
    };

    recommendationCache.set(userId, { data: result, timestamp: now });
    return result;
  },

  /**
   * Runs a Monte Carlo-style simulation to predict portfolio growth
   * over 5 years under 3 scenarios.
   */
  async runPredictiveSimulation(userId: string): Promise<SimulationResult[]> {
    const portfolio = await prisma.userPortfolio.findMany({ where: { userId, status: 'ACTIVE' } });
    const currentVal = portfolio.reduce((acc: number, p: any) => acc + p.amount, 0) || 10000; // Default base for simulation if empty

    const data: SimulationResult[] = [];
    let cVal = currentVal;
    let mVal = currentVal;
    let aVal = currentVal;

    for (let year = 1; year <= 5; year++) {
        // Mock growth rates with compounding and volatility
        cVal = cVal * (1 + 0.05 + (Math.random() * 0.02)); // ~6%
        mVal = mVal * (1 + 0.10 + (Math.random() * 0.05)); // ~12%
        aVal = aVal * (1 + 0.18 + (Math.random() * 0.15)); // ~25% (High volatility)

        data.push({
            year: new Date().getFullYear() + year,
            conservative: Math.round(cVal),
            moderate: Math.round(mVal),
            aggressive: Math.round(aVal)
        });
    }

    return data;
  },

  async getMarketSentiment() {
      // Mocked data feed - could also be cached if fetched from external API
      return {
          score: 72, // 0-100 (Fear to Greed)
          label: "Greed",
          trend: "Bullish",
          sectorPerformance: [
              { sector: "Real Estate", change: 4.2 },
              { sector: "Fine Art", change: 12.5 },
              { sector: "Crypto", change: -2.1 },
              { sector: "Commodities", change: 1.8 }
          ]
      };
  }
};