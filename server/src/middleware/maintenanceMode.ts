
import { Request, Response, NextFunction } from 'express';

export const maintenanceMode = (req: any, res: any, next: NextFunction) => {
  if (process.env.MAINTENANCE_MODE === 'true') {
    console.warn(`[SECURITY] Blocked ${req.method} ${req.path} due to Maintenance Mode.`);
    return res.status(503).json({ 
      message: 'System is currently under maintenance. Financial actions are temporarily paused.',
      code: 'MAINTENANCE_MODE'
    });
  }
  next();
};
