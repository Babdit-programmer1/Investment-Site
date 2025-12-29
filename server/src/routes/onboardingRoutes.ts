import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { submitOnboarding, completeOnboarding } from '../controllers/onboardingController';

const router = express.Router();

router.use(authenticateToken);
router.post('/step', submitOnboarding);
router.post('/complete', completeOnboarding);

export default router;
