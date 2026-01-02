
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { maintenanceMode } from '../middleware/maintenanceMode';
import { initiateInvestment, verifyPayment, getMyInvestments, getDepositConfig } from '../controllers/paymentController';

const router = express.Router();

router.use(authenticateToken);

// Mutating actions blocked during maintenance
router.post('/initiate', maintenanceMode, initiateInvestment);
router.post('/verify', verifyPayment); // Verify usually read-only check or callback, safe to leave active or block if strict. Leaving open for status checks.

router.get('/my', getMyInvestments);
router.get('/config', getDepositConfig);

export default router;
