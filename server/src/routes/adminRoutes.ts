import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { getDashboardStats, getInvestors, verifyInvestor, createAsset } from '../controllers/adminController';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/investors', getInvestors);
router.patch('/investors/:id/verify', verifyInvestor);
router.post('/assets', createAsset);

export default router;
