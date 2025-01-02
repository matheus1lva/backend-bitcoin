import express from 'express';
import { PlaidController } from './plaid.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { PlaidService } from './plaid.service.js';
import { UserRepository } from '../user/user.repository.js';

const router = express.Router();
const userRepository = new UserRepository();
const plaidService = new PlaidService(userRepository);
const plaidController = new PlaidController(plaidService);

router.use(authMiddleware);

router.get('/balance', plaidController.getBalance);
router.post('/', plaidController.createPayment);
router.get('/:paymentId', plaidController.getPaymentStatus);

export { router as plaidRouter };
