import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getLogs } from '../controllers/logController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getLogs);

export default router;