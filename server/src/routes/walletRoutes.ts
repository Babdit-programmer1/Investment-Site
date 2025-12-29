import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getWallet, deposit, withdraw } from '../controllers/walletController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWallet);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);

export default router;