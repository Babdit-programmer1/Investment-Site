import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitOnboarding = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { stepData } = req.body; 

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentProfile = (user?.profileData as object) || {};
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileData: { ...currentProfile, ...stepData }
      }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error saving onboarding data' });
  }
};

export const completeOnboarding = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        kycStatus: 'PENDING'
      }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error completing onboarding' });
  }
};