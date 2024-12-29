import express from 'express';
import { PlaidController } from './plaid.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = express.Router();
const plaidController = new PlaidController();

router.use(authMiddleware);

router.get('/balance', plaidController.getBalance);
router.post('/', plaidController.createPayment);
router.get('/:paymentId', plaidController.getPaymentStatus);

export { router as plaidRouter };
