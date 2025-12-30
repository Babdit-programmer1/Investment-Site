
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getAllInvestments, getInvestmentById, sellAsset } from '../controllers/investmentController';

const router = express.Router();

// Public: Get all investments
router.get('/', getAllInvestments);
router.get('/:id', getInvestmentById);

// Private: Invest in an asset
router.post('/invest', authenticateToken, (req, res) => {
  res.json({ message: "Investment processed successfully" });
});

router.post('/sell', authenticateToken, sellAsset);

export default router;
