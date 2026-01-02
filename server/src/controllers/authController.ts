
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/env';

const prisma = new PrismaClient();
const JWT_SECRET = config.jwtSecret;

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string(),
  investorType: z.enum(['Individual', 'High Net Worth', 'Institutional']),
  interests: z.array(z.string()).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const register = async (req: any, res: any) => {
  try {
    const data = registerSchema.parse(req.body);

    // Prevent registration of the Owner email via public route
    if (config.ownerEmail && data.email === config.ownerEmail) {
        return res.status(403).json({ message: 'Reserved email address' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const role = 'USER'; // Default role

    // Use transaction to ensure wallets are created with user
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          passwordHash,
          country: data.country,
          investorType: data.investorType,
          interests: JSON.stringify(data.interests || []), 
          role,
          onboardingCompleted: false
        }
      });

      // Create Dual Wallets
      await tx.wallet.create({
        data: { userId: user.id, type: 'MAIN', balance: 0 }
      });
      
      await tx.wallet.create({
        data: { userId: user.id, type: 'INVESTMENT', balance: 0 }
      });

      // Welcome Notification
      if (tx.notification) {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: 'Welcome to Prestige Assets',
            message: 'Your account has been created. Please complete your KYC verification.',
            type: 'INFO'
          }
        });
      }

      return user;
    });

    const token = jwt.sign(
      { id: result.id, email: result.email, role: result.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userProfile = {
      ...result,
      interests: JSON.parse(result.interests || '[]'),
      profileData: result.profileData ? JSON.parse(result.profileData) : {}
    };
    delete (userProfile as any).passwordHash;

    res.status(201).json({ user: userProfile, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation Error', errors: error.issues || (error as any).errors });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const data = loginSchema.parse(req.body);

    // 1. Check for Owner Login (Env Var based)
    if (config.ownerEmail && data.email === config.ownerEmail) {
        let isOwnerMatch = false;
        
        // If hash provided in env, use it. Otherwise fallback to DB check (less secure for owner)
        if (config.ownerPasswordHash) {
            isOwnerMatch = await bcrypt.compare(data.password, config.ownerPasswordHash);
        } else {
            console.warn("Owner password hash not set in env. Using DB fallback (less secure).");
        }

        if (isOwnerMatch) {
            // Ensure Owner exists in DB for ID consistency
            let ownerUser = await prisma.user.findUnique({ where: { email: config.ownerEmail } });
            
            if (!ownerUser) {
                // Auto-seed owner if verified via Env Credentials
                ownerUser = await prisma.user.create({
                    data: {
                        email: config.ownerEmail,
                        fullName: 'Platform Owner',
                        role: 'ADMIN',
                        passwordHash: config.ownerPasswordHash || 'invalid_db_hash', // Should not be usable via standard db auth
                        country: 'System',
                        investorType: 'Institutional',
                        onboardingCompleted: true,
                        kycStatus: 'APPROVED'
                    }
                });
                // Create wallet for admin ops
                await prisma.wallet.create({ data: { userId: ownerUser.id, type: 'MAIN', balance: 0 } });
            }

            const token = jwt.sign(
                { id: ownerUser.id, email: ownerUser.email, role: 'ADMIN' },
                JWT_SECRET,
                { expiresIn: '4h' } // Shorter session for admin
            );

            const userProfile = { ...ownerUser, role: 'ADMIN' };
            delete (userProfile as any).passwordHash;
            
            return res.json({ user: userProfile, token });
        } else if (config.ownerPasswordHash) {
             return res.status(401).json({ message: 'Invalid credentials' });
        }
    }

    // 2. Standard User Login
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userProfile = {
      ...user,
      interests: JSON.parse(user.interests || '[]'),
      profileData: user.profileData ? JSON.parse(user.profileData) : {}
    };
    delete (userProfile as any).passwordHash;

    res.json({ user: userProfile, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProfile = async (req: any, res: any) => {
  const userId = req.user.id;
  const { fullName, phone, emailAlerts, pushAlerts, twoFactor } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentProfile = user.profileData ? JSON.parse(user.profileData) : {};
    
    // Merge new preferences into profileData JSON
    const newProfileData = {
      ...currentProfile,
      phone,
      emailAlerts,
      pushAlerts,
      twoFactor
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        profileData: JSON.stringify(newProfileData)
      }
    });

    const userProfile = {
      ...updated,
      interests: JSON.parse(updated.interests || '[]'),
      profileData: newProfileData
    };
    delete (userProfile as any).passwordHash;

    res.json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const updatePassword = async (req: any, res: any) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    // Send notification
    if (prisma.notification) {
        // @ts-ignore
        await prisma.notification.create({
            data: {
                userId,
                title: 'Security Alert',
                message: 'Your password was changed successfully.',
                type: 'WARNING'
            }
        });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password' });
  }
};
