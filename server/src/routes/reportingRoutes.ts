import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getStatements, downloadStatementPdf, getPerformance } from '../controllers/statementController';
import { getPlans, subscribePlan } from '../controllers/planController';

const router = express.Router();

router.use(authenticateToken);

// Statements
router.get('/statements', getStatements);
router.get('/statements/:id/download', downloadStatementPdf);

// Performance
router.get('/performance', getPerformance);

// Plans
router.get('/plans', getPlans);
router.post('/plans/subscribe', subscribePlan);

export default router;