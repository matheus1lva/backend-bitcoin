import { logger } from '../../utils/logger.js';
import { JwtService } from '../jwt/jtw.service.js';
import { PlaidService } from '../plaid/plaid.service.js';
import { UserService } from './user.service.js';
import { UserRepository } from './user.repository.js';

export class UserController {
  constructor() {
    const userRepository = new UserRepository();
    const jwtService = new JwtService();
    const plaidService = new PlaidService(userRepository);
    this.userService = new UserService(userRepository, jwtService);
    this.plaidService = plaidService;
  }

  signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.userService.signup({ name, email, password });
      res.status(201).json(user);
    } catch (error) {
      logger.error(error);
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }

      console.log(error);

      res.status(500).json({ message: 'Error creating user' });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);
      res.json(result);
    } catch (error) {
      logger.error(error);
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error logging in' });
    }
  };

  createPlaidToken = async (req, res) => {
    try {
      const token = await this.plaidService.createPlaidToken(req.body);
      res.json(token);
    } catch (error) {
      console.log(error);
      logger.error(error);
      res.status(500).json({ message: 'failed to create token' });
    }
  };

  exchangePublicToken = async (req, res) => {
    try {
      const exchange = await this.plaidService.exchangePublicToken(req.body);
      res.json(exchange);
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'failed to create token' });
    }
  };
}
