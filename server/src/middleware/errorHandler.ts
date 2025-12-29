import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[Error] ${err.message}`);
  
  // In production, we do not send the stack trace
  const isProd = process.env.NODE_ENV === 'production';
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  (res as any).status(statusCode).json({
    message: message,
    ...(isProd ? {} : { stack: err.stack })
  });
};