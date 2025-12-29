import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getAllInvestments, getInvestmentById } from '../controllers/investmentController';

const router = express.Router();

// Public: Get all investments
router.get('/', getAllInvestments);
router.get('/:id', getInvestmentById);

// Private: Invest in an asset
router.post('/invest', authenticateToken, (req, res) => {
  res.json({ message: "Investment processed successfully" });
});

export default router;
