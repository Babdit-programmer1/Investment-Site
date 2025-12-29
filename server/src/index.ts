import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import investmentRoutes from './routes/investmentRoutes';
import adminRoutes from './routes/adminRoutes';
import onboardingRoutes from './routes/onboardingRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet() as any);
app.use(cors());
app.use(express.json() as any);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/investments', investmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Prestige Assets Backend running on port ${PORT}`);
});
