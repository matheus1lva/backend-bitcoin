const { PasskeyController } = require('./pass-key.controller');
const { PasskeyService } = require('./pass-key.service');
const { authenticators } = require('./schemas/schema');
const routes = require('./pass-key.routes');

module.exports = {
  PasskeyController,
  PasskeyService,
  authenticators,
  routes,
};
