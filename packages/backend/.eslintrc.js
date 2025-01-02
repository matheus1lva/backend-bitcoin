module.exports = {
  extends: [
    '../../.eslintrc.js',
    'plugin:node/recommended',
    'plugin:security/recommended',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['node', 'security', 'prettier'],
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
    },
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': 'error',
    'no-undef': 'error', // Reports undefined variables
    'no-unused-vars': 'error', // Reports unused variables
    'no-unused-imports': 'error', // Reports unused imports
    'node/exports-style': ['error', 'module.exports'],
    'node/file-extension-in-import': ['error', 'always'],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-require': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'no-process-exit': 'error',
    'no-sync': 'warn',
    'no-console': 'error',
  },
};
