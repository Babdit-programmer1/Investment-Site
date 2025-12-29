import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { initiateInvestment, verifyPayment, getMyInvestments } from '../controllers/paymentController';

const router = express.Router();

router.use(authenticateToken);

router.post('/initiate', initiateInvestment);
router.post('/verify', verifyPayment);
router.get('/my', getMyInvestments);

export default router;
