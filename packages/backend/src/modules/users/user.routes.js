import express from 'express';
import { validateRequestBody } from 'zod-express-middleware';
import { UserController } from './user.controller.js';
import { signupSchema } from './dtos/validate-signup.dto.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = express.Router();
const userController = new UserController();

router.post(
  '/signup',
  validateRequestBody(signupSchema),
  userController.signup,
);
router.post('/login', userController.login);

// Protected routes
router.use(authMiddleware);
router.post('/create-plaid-token', userController.createPlaidToken);
router.post('/exchange-public-token', userController.exchangePublicToken);

export { router as userRouter };
