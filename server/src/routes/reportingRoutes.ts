import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
    getStatements, 
    downloadStatementPdf, 
    getPerformance,
    getTransactions,
    getProfitLoss,
    getTaxSummary
} from '../controllers/statementController';
import { getPlans, subscribePlan } from '../controllers/planController';

const router = express.Router();

router.use(authenticateToken);

// Statements
router.get('/statements', getStatements);
router.get('/statements/:id/download', downloadStatementPdf);

// Performance & P&L
router.get('/performance', getPerformance);
router.get('/pnl', getProfitLoss);

// Transactions & Tax
router.get('/transactions', getTransactions);
router.get('/tax', getTaxSummary);

// Plans
router.get('/plans', getPlans);
router.post('/plans/subscribe', subscribePlan);

export default router;