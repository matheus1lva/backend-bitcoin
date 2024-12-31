import { logger } from '../../utils/logger';

export class PasskeyController {
  constructor(passkeyService) {
    this.passkeyService = passkeyService;
  }

  generateRegistrationOptions = async (req, res) => {
    try {
      const { userId, username } = req.body;
      const options = await this.passkeyService.generateRegistrationOptions(
        userId,
        username,
      );

      req.session.challenge = options.challenge;
      res.json(options);
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json({ error: 'Failed to generate registration options' });
    }
  };

  verifyRegistration = async (req, res) => {
    try {
      const { userId, credential } = req.body;
      const challenge = req.session.challenge;

      if (!challenge) {
        return res.status(400).json({ error: 'No challenge found in session' });
      }

      const verification = await this.passkeyService.verifyRegistration(
        userId,
        credential,
        challenge,
      );

      delete req.session.challenge;
      res.json({ verified: verification.verified });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Failed to verify registration' });
    }
  };

  generateAuthenticationOptions = async (req, res) => {
    try {
      const options = await this.passkeyService.generateAuthenticationOptions();
      req.session.challenge = options.challenge;
      res.json(options);
    } catch (error) {
      console.error(error);
      logger.error(error);
      res
        .status(500)
        .json({ error: 'Failed to generate authentication options' });
    }
  };

  verifyAuthentication = async (req, res) => {
    try {
      const { credential } = req.body;
      const challenge = req.session.challenge;

      if (!challenge) {
        return res
          .status(400)
          .json({ error: 'Failed to verify authentication' });
      }

      const verification = await this.passkeyService.verifyAuthentication(
        credential,
        challenge,
      );

      delete req.session.challenge;

      if (verification.verified) {
        req.session.userId = verification.user.id;
        res.json({
          verified: true,
          token: verification.token,
          user: verification.user,
        });
      } else {
        res.json({ verified: false });
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'Failed to verify authentication' });
    }
  };
}
