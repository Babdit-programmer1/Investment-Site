import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
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

export const register = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const data = registerSchema.parse((req as any).body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return (res as any).status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Auto-assign ADMIN role if email contains 'admin' (DEMO ONLY)
    const role = data.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        country: data.country,
        investorType: data.investorType,
        interests: data.interests || [],
        role,
        onboardingCompleted: false
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userProfile } = user;
    (res as any).status(201).json({ user: userProfile, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return (res as any).status(400).json({ message: 'Validation Error', errors: error.issues || (error as any).errors });
    }
    console.error(error);
    (res as any).status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const data = loginSchema.parse((req as any).body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return (res as any).status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      return (res as any).status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { passwordHash: _, ...userProfile } = user;
    (res as any).json({ user: userProfile, token });
  } catch (error) {
    (res as any).status(500).json({ message: 'Internal Server Error' });
  }
};