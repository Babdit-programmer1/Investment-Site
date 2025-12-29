import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends ExpressRequest {
  user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const authenticateToken = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authHeader = (req as any).headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    (res as any).status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    (req as AuthRequest).user = user;
    next();
  } catch (err) {
    (res as any).status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const requireAdmin = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const user = (req as AuthRequest).user;
  if (!user || user.role !== 'ADMIN') {
    (res as any).status(403).json({ message: 'Access denied: Admins only' });
    return;
  }
  next();
};