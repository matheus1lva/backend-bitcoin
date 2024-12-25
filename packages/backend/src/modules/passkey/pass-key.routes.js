const { Router } = require('express');
const { PasskeyController } = require('./pass-key.controller');
const { validateRequest } = require('zod-express-middleware');
const { z } = require('zod');

const router = Router();

const registrationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    username: z.string(),
  }),
});

const verifyRegistrationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    credential: z.any(),
  }),
});

const authenticationSchema = z.object({
  body: z.object({
    username: z.string(),
  }),
});

const verifyAuthenticationSchema = z.object({
  body: z.object({
    credential: z.any(),
  }),
});

router.post(
  '/register/options',
  validateRequest(registrationSchema),
  PasskeyController.generateRegistrationOptions,
);

router.post(
  '/register/verify',
  validateRequest(verifyRegistrationSchema),
  PasskeyController.verifyRegistration,
);

router.post(
  '/authenticate/options',
  validateRequest(authenticationSchema),
  PasskeyController.generateAuthenticationOptions,
);

router.post(
  '/authenticate/verify',
  validateRequest(verifyAuthenticationSchema),
  PasskeyController.verifyAuthentication,
);

module.exports = { passKeyRouter: router };
