
import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware';
import { 
  getOverview,
  getUsers,
  getUserDetails,
  verifyInvestor, 
  rejectInvestor,
  createAsset,
  createPlan,
  getPendingInvestments,
  approveInvestment,
  refundInvestment,
  getTreasury,
  getMultisigRequests,
  approveMultisig,
  getComplianceAlerts,
  getAuditLogs,
  runDiagnostics,
  triggerTestNotification,
  getPendingDeposits,
  approveDeposit,
  rejectDeposit,
  getPendingWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  creditUserWallet,
  debitUserWallet,
  getSystemLogs,
  getPlatformWallets,
  addPlatformWallet
} from '../controllers/adminController';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard Overview
router.get('/overview', getOverview);
router.get('/stats', getOverview); // Alias for legacy frontend

// User Management
router.get('/investors', getUsers); // Alias
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.patch('/investors/:id/verify', verifyInvestor);
router.patch('/investors/:id/reject', rejectInvestor);

// Admin Wallet Control (Secure)
router.post('/wallets/:userId/credit', creditUserWallet);
router.post('/wallets/:userId/debit', debitUserWallet);

// Assets
router.post('/assets', createAsset);
router.post('/plans', createPlan);

// Platform Wallets
router.get('/platform-wallets', getPlatformWallets);
router.post('/platform-wallets', addPlatformWallet);

// Investment Approvals (Escrow)
router.get('/approvals', getPendingInvestments);
router.post('/approvals/:id/approve', approveInvestment);
router.post('/approvals/:id/refund', refundInvestment);

// Deposit Approvals
router.get('/deposits/pending', getPendingDeposits);
router.post('/deposits/:id/approve', approveDeposit);
router.post('/deposits/:id/reject', rejectDeposit);

// Withdrawal Approvals
router.get('/withdrawals/pending', getPendingWithdrawals);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

// Treasury & Custody (Multisig)
router.get('/treasury', getTreasury);
router.get('/multisig', getMultisigRequests);
router.post('/multisig/:referenceId/approve', approveMultisig);

// Compliance & Audit
router.get('/compliance/alerts', getComplianceAlerts);
router.get('/compliance/audit', getAuditLogs);

// System Logs
router.get('/logs', getSystemLogs);

// System Diagnostics
router.get('/diagnostics/run', runDiagnostics);
router.post('/diagnostics/notify', triggerTestNotification);

export default router;
