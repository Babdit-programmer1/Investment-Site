
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

// Performance Metrics Store
const metrics = {
  requests: 0,
  errors: 0,
  avgLatency: 0
};

// Security Middleware
app.use(helmet() as any);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '10kb' }) as any); // Limit body size

// Monitoring Middleware
app.use((req, res, next) => {
  const start = Date.now();
  metrics.requests++;
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Simple moving average for latency
    metrics.avgLatency = (metrics.avgLatency * (metrics.requests - 1) + duration) / metrics.requests;
    if (res.statusCode >= 400) metrics.errors++;
  });
  next();
});

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
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    services: {
      db: 'connected', // In real implementation, check prisma connection
      cache: 'active'
    }
  });
});

// Metrics Endpoint (Protected in real world, public for demo)
app.get('/metrics', (req, res) => {
  res.json({
    uptime: (process as any).uptime(),
    ...metrics,
    errorRate: metrics.requests > 0 ? (metrics.errors / metrics.requests).toFixed(4) : 0,
    memoryUsage: (process as any).memoryUsage()
  });
});

// Root endpoint for testing
app.get('/', (req, res) => {
  res.send('Prestige Assets API Running (Hardened & Optimized)');
});

// Global Error Handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Prestige Assets Backend running on port ${config.port} in ${config.nodeEnv} mode`);
});
