export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.json' }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/test/**/*.e2e.test.js'],
  verbose: true,
  testTimeout: 3600000,
  setupFilesAfterEnv: ['./setup.js'],
};
