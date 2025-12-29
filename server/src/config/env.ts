import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_fallback_do_not_use_in_prod',
  
  // Database
  // In preview, we might not have a DB, allowing services to degrade gracefully
  dbUrl: process.env.DATABASE_URL,

  // Payment Gateways
  paystackSecret: process.env.PAYSTACK_SECRET_KEY,
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  
  // KYC
  sumsubToken: process.env.SUMSUB_APP_TOKEN,
  
  // Security
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100 // Limit each IP to 100 requests per windowMs
};