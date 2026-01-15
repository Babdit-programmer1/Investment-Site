import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import investmentRoutes from './routes/investmentRoutes';
import adminRoutes from './routes/adminRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import reportingRoutes from './routes/reportingRoutes';
import walletRoutes from './routes/walletRoutes';
import logRoutes from './routes/logRoutes';
import kycRoutes from './routes/kycRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { config } from './config/env';
import { rateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, 
}) as any);

// Enhanced CORS
app.use(cors({ 
  origin: true, 
  credentials: true 
}));

app.use(express.json({ limit: '10mb' }) as any);
app.use(rateLimiter);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: (process as any).uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reporting', reportingRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/kyc', kycRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Detailed 404 for API Debugging
app.use('/api/v1/*', (req, res) => {
    res.status(404).json({ 
        error: 'Route Not Found',
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist on the Prestige Assets server.`,
        hint: 'Check your frontend config.ts API_BASE_URL setting.'
    });
});

// Global Error Handler
app.use(errorHandler);

const PORT = config.port || 3001;
app.listen(PORT, () => {
  console.log(`[SYSTEM] Prestige Assets Backend Operational on Port ${PORT}`);
});