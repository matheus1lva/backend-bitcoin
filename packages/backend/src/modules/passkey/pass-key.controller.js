const { PasskeyService } = require('./pass-key.service');

class PasskeyController {
  static async generateRegistrationOptions(req, res) {
    try {
      const { userId, username } = req.body;
      const options = await PasskeyService.generateRegistrationOptions(
        userId,
        username,
      );

      // Store challenge in session for verification
      req.session.challenge = options.challenge;

      res.json(options);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Failed to generate registration options' });
    }
  }

  static async verifyRegistration(req, res) {
    try {
      const { userId, credential } = req.body;
      const challenge = req.session.challenge;

      if (!challenge) {
        return res.status(400).json({ error: 'No challenge found in session' });
      }

      const verification = await PasskeyService.verifyRegistration(
        userId,
        credential,
        challenge,
      );

      // Clear challenge from session
      delete req.session.challenge;

      res.json({ verified: verification.verified });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to verify registration' });
    }
  }

  static async generateAuthenticationOptions(req, res) {
    try {
      const { username } = req.body;
      const options =
        await PasskeyService.generateAuthenticationOptions(username);

      // Store challenge in session for verification
      req.session.challenge = options.challenge;

      res.json(options);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: 'Failed to generate authentication options' });
    }
  }

  static async verifyAuthentication(req, res) {
    try {
      const { credential } = req.body;
      const challenge = req.session.challenge;

      if (!challenge) {
        return res.status(400).json({ error: 'No challenge found in session' });
      }

      const verification = await PasskeyService.verifyAuthentication(
        credential,
        challenge,
      );

      // Clear challenge from session
      delete req.session.challenge;

      res.json({ verified: verification.verified });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to verify authentication' });
    }
  }
}

module.exports = { PasskeyController };
