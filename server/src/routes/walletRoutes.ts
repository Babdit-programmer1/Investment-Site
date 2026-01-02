
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { maintenanceMode } from '../middleware/maintenanceMode';
import { getWallet, deposit, withdraw } from '../controllers/walletController';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWallet);
// Mutating actions blocked during maintenance
router.post('/deposit', maintenanceMode, deposit);
router.post('/withdraw', maintenanceMode, withdraw);

export default router;
