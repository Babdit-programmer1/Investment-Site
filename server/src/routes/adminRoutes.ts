import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { 
  getDashboardStats, 
  getInvestors, 
  verifyInvestor, 
  rejectInvestor,
  createAsset,
  getPendingInvestments,
  approveInvestment,
  refundInvestment,
  getTreasury,
  getMultisigRequests,
  approveMultisig,
  getComplianceAlerts,
  getAuditLogs
} from '../controllers/adminController';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// Stats & Users
router.get('/stats', getDashboardStats);
router.get('/investors', getInvestors);
router.patch('/investors/:id/verify', verifyInvestor);
router.patch('/investors/:id/reject', rejectInvestor);

// Assets
router.post('/assets', createAsset);

// Investment Approvals (Escrow)
router.get('/approvals', getPendingInvestments);
router.post('/approvals/:id/approve', approveInvestment);
router.post('/approvals/:id/refund', refundInvestment);

// Treasury & Custody (Multisig)
router.get('/treasury', getTreasury);
router.get('/multisig', getMultisigRequests);
router.post('/multisig/:referenceId/approve', approveMultisig);

// Compliance & Audit
router.get('/compliance/alerts', getComplianceAlerts);
router.get('/compliance/audit', getAuditLogs);

export default router;