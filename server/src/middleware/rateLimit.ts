import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

// Simple in-memory store for preview/single-instance deployments.
// For scaled production, use Redis.
const hits = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = (req as any).ip || 'unknown';
  const now = Date.now();
  
  const record = hits.get(ip);

  // If no record or expired, reset
  if (!record || now > record.resetTime) {
    hits.set(ip, {
      count: 1,
      resetTime: now + config.rateLimitWindowMs
    });
    return next();
  }

  // Increment
  record.count += 1;

  if (record.count > config.rateLimitMax) {
    return (res as any).status(429).json({
      message: 'Too many requests from this IP, please try again later.'
    });
  }

  next();
};