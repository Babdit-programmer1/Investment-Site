import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export const submitOnboarding = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id;
  const { stepData } = (req as any).body; // Expect aggregated data or handle steps

  try {
    // Merge existing profile data with new step data
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const currentProfile = (user?.profileData as object) || {};
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileData: { ...currentProfile, ...stepData }
      }
    });
    (res as any).json(updatedUser);
  } catch (error) {
    (res as any).status(500).json({ message: 'Error saving onboarding data' });
  }
};

export const completeOnboarding = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user.id;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        kycStatus: 'PENDING' // Set to pending for admin review
      }
    });
    (res as any).json(updatedUser);
  } catch (error) {
    (res as any).status(500).json({ message: 'Error completing onboarding' });
  }
};