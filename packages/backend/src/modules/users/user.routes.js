import express from 'express';
import { validateRequestBody } from 'zod-express-middleware';
import { UserController } from './user.controller.js';
import { signupSchema } from './dtos/validate-signup.dto.js';
import { loginSchema } from './dtos/login.dto.js';
import { exchangeTokenSchema } from './dtos/exchangeTokenSchema.dto.js';

const router = express.Router();
const userController = new UserController();

router.post(
  '/signup',
  validateRequestBody(signupSchema),
  userController.signup,
);
router.post('/login', validateRequestBody(loginSchema), userController.login);

router.post('/create-plaid-token', userController.createPlaidToken);
router.post(
  '/exchange-public-token',
  validateRequestBody(exchangeTokenSchema),
  userController.exchangePublicToken,
);

export { router as userRouter };
