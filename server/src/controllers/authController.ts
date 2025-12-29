import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

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

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const role = data.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';

    // Use transaction to ensure wallet is created with user
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

      // Create Wallet
      await tx.wallet.create({
        data: { userId: user.id }
      });

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