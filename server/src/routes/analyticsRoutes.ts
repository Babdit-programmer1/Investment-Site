import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getSmartRecommendation, getPredictiveModel } from '../controllers/analyticsController';

const router = express.Router();

router.use(authenticateToken);

router.get('/recommendation', getSmartRecommendation);
router.get('/predict', getPredictiveModel);

export default router;