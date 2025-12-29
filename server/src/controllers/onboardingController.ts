import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitOnboarding = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { stepData } = req.body; 

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Parse existing profileData
    const currentProfile = user.profileData ? JSON.parse(user.profileData) : {};
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        profileData: JSON.stringify({ ...currentProfile, ...stepData })
      }
    });

    // Return parsed user
    const responseUser = {
      ...updatedUser,
      interests: JSON.parse(updatedUser.interests || '[]'),
      profileData: JSON.parse(updatedUser.profileData || '{}')
    };

    res.json(responseUser);
  } catch (error) {
    console.error(error);
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

    const responseUser = {
      ...updatedUser,
      interests: JSON.parse(updatedUser.interests || '[]'),
      profileData: updatedUser.profileData ? JSON.parse(updatedUser.profileData) : {}
    };

    res.json(responseUser);
  } catch (error) {
    res.status(500).json({ message: 'Error completing onboarding' });
  }
};