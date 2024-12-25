const { UserService } = require('./user.service');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  signup = async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await this.userService.signup({ name, email, password });
      res.status(201).json(user);
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await this.userService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error logging in' });
    }
  };

  async createPlaidToken(req, res) {
    try {
      const token = await this.userService.createPlaidToken(req.body);
      res.json(token)
    }catch(err) {
      res.status(500).json({ message: 'failed to create token'})
    }
  }

  async exchangePublicToken(req, res) {
    try {
      const exchange = await this.userService.exchangePublicToken(data);
      res.json(exchange)
    }catch(err) {
      res.status(500).json({ message: 'failed to create token'})
    }
  }
}

module.exports = { UserController }; 