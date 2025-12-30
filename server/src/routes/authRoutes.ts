
import express from 'express';
import { login, register, updateProfile, updatePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/me', authenticateToken, updateProfile);
router.put('/password', authenticateToken, updatePassword);

export default router;
