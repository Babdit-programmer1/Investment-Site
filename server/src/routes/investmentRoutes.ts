
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { 
    getAllInvestments, 
    getInvestmentById, 
    sellAsset,
    topUpInvestment,
    payMonthlyInstallment 
} from '../controllers/investmentController';

const router = express.Router();

// Public: Get all investments
router.get('/', getAllInvestments);
router.get('/:id', getInvestmentById);

// Private Routes
router.post('/invest', authenticateToken, (req, res) => {
  res.json({ message: "Use /payments/initiate for investments" });
});

router.post('/sell', authenticateToken, sellAsset);

// New Feature Routes
router.post('/:id/top-up', authenticateToken, topUpInvestment);
router.post('/:id/pay-installment', authenticateToken, payMonthlyInstallment);

export default router;
