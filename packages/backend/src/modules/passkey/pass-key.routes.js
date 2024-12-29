import { Router } from 'express';
import { PasskeyController } from './pass-key.controller';
import { validateRequest } from 'zod-express-middleware';

import registrationSchema from './dto/registration.dto.js';
import verifyRegistrationSchema from './dto/verify-registration.dto.js';
import authenticationSchema from './dto/authentication.dto.js';
import verifyAuthenticationSchema from './dto/verify-authentication.dto.js';

export const passKeyRouter = Router();

passKeyRouter.post(
  '/register/options',
  validateRequest(registrationSchema),
  PasskeyController.generateRegistrationOptions,
);

passKeyRouter.post(
  '/register/verify',
  validateRequest(verifyRegistrationSchema),
  PasskeyController.verifyRegistration,
);

passKeyRouter.post(
  '/authenticate/options',
  validateRequest(authenticationSchema),
  PasskeyController.generateAuthenticationOptions,
);

passKeyRouter.post(
  '/authenticate/verify',
  validateRequest(verifyAuthenticationSchema),
  PasskeyController.verifyAuthentication,
);
