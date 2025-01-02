import { Router } from 'express';
import { PasskeyController } from './pass-key.controller';
import { validateRequest } from 'zod-express-middleware';
import registrationSchema from './dto/registration.dto.js';
import { AuthenticatorRepository } from '../authenticator/authenticator.repository.js';
import { PasskeyService } from './pass-key.service.js';
import { UserRepository } from '../user/user.repository.js';
import { JwtService } from '../jwt/jtw.service.js';

export const passKeyRouter = Router();

const authenticatorRepository = new AuthenticatorRepository();
const userRepository = new UserRepository();
const jwtService = new JwtService();
const passkeyService = new PasskeyService(
  authenticatorRepository,
  userRepository,
  jwtService,
);
const passkeyController = new PasskeyController(passkeyService);

passKeyRouter.post(
  '/register/options',
  validateRequest(registrationSchema),
  passkeyController.generateRegistrationOptions,
);

passKeyRouter.post('/register/verify', passkeyController.verifyRegistration);

passKeyRouter.post(
  '/authenticate/options',
  passkeyController.generateAuthenticationOptions,
);

passKeyRouter.post(
  '/authenticate/verify',
  passkeyController.verifyAuthentication,
);
