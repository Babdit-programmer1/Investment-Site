import { Request, Response } from 'express';
import { kycService } from '../services/kycService';

export const getKycStatus = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const status = await kycService.getKycProfile(userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching KYC status' });
  }
};

export const submitKycStep = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { step, data } = req.body;

  try {
    const result = await kycService.submitStep(userId, step, data);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting KYC data' });
  }
};
