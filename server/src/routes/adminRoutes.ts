import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { 
  getDashboardStats, 
  getInvestors, 
  verifyInvestor, 
  createAsset,
  getPendingInvestments,
  approveInvestment,
  refundInvestment
} from '../controllers/adminController';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/investors', getInvestors);
router.patch('/investors/:id/verify', verifyInvestor);
router.post('/assets', createAsset);

// Payment Approvals
router.get('/approvals', getPendingInvestments);
router.post('/approvals/:id/approve', approveInvestment);
router.post('/approvals/:id/refund', refundInvestment);

export default router;
