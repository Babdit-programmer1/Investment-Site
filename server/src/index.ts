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
import { config } from './config/env';
import { rateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security Middleware
app.use(helmet() as any);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }) as any); // Limit body size
app.use(rateLimiter); // Apply rate limiting

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reporting', reportingRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/logs', logRoutes);
app.use('/api/v1/kyc', kycRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: config.nodeEnv 
  });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('Prestige Assets API Running (Hardened)');
});

// Global Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Prestige Assets Backend running on port ${config.port} in ${config.nodeEnv} mode`);
});