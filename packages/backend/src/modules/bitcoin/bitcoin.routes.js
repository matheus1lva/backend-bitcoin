import express from 'express';
import { BitcoinController } from './bitcoin.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = express.Router();
const bitcoinController = new BitcoinController();

router.get('/price', bitcoinController.getCurrentPrice);
router.use(authMiddleware);

router.post('/purchase', bitcoinController.purchaseBitcoin);
router.get('/balance', bitcoinController.getBalance);

export { router as bitcoinRouter };
