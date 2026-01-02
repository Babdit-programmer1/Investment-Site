
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';

const JWT_SECRET = config.jwtSecret;

export const authenticateToken = (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decodedUser = jwt.verify(token, JWT_SECRET);
    req.user = decodedUser;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const requireAdmin = (req: any, res: any, next: NextFunction) => {
  const user = req.user;
  
  if (!user || typeof user === 'string' || (user as any).role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }

  // Hard-restriction: If OWNER_EMAIL is set in env, only that email can access admin routes
  if (config.ownerEmail && user.email !== config.ownerEmail) {
      console.warn(`[Security] Unauthorized admin access attempt by ${user.email}`);
      return res.status(403).json({ message: 'Access denied: Restricted to Platform Owner' });
  }

  next();
};
