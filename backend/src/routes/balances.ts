import { Router } from 'express';
import { BalanceController } from '../controllers/BalanceController';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';

const router = Router();
const balanceController = new BalanceController();

// Get user balance (authenticated users)
router.get('/my-balance', authMiddleware, balanceController.getUserBalance);

// Get user transactions (authenticated users)
router.get('/my-transactions', authMiddleware, balanceController.getUserTransactions);

// Create transaction (admin only)
router.post('/transactions', authMiddleware, adminMiddleware, balanceController.createTransaction);

// Update transaction status (admin only)
router.put('/transactions/:transactionId/status', authMiddleware, adminMiddleware, balanceController.updateTransactionStatus);

// Get all user balances (admin only)
router.get('/all-balances', authMiddleware, adminMiddleware, balanceController.getAllUserBalances);

// Process earning when offer is selected (admin only)
router.post('/process-earning', authMiddleware, adminMiddleware, balanceController.processEarning);

export default router;
