import { Request, Response } from 'express';
import { aiAdvisorService } from '../services/aiAdvisorService';

export const getSmartRecommendation = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const result = await aiAdvisorService.generateRecommendation(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating recommendation' });
  }
};

export const getPredictiveModel = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const simulation = await aiAdvisorService.runPredictiveSimulation(userId);
    const sentiment = await aiAdvisorService.getMarketSentiment();
    res.json({ simulation, sentiment });
  } catch (error) {
    res.status(500).json({ message: 'Error running prediction model' });
  }
};