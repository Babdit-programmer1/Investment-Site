import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getKycStatus, submitKycStep } from '../controllers/kycController';

const router = express.Router();

router.use(authenticateToken);

router.get('/status', getKycStatus);
router.post('/submit', submitKycStep);

export default router;