
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getNotifications, markAllRead } from '../controllers/notificationController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.post('/read', markAllRead);

export default router;
