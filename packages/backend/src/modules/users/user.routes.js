const express = require('express');
const { validateRequestBody} = require('zod-express-middleware')
const { UserController } = require('./user.controller');
const { signupSchema } = require('./dtos/validate-signup.dto');

const router = express.Router();
const userController = new UserController();

router.post('/signup', validateRequestBody(signupSchema), userController.signup);
router.post('/login', userController.login);
router.post('/create-plaid-token', userController.createPlaidToken);
router.post('/exchange-public-token', userController.exchangePublicToken)

module.exports = { userRouter: router }; 