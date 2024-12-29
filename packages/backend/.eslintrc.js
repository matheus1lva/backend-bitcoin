module.exports = {
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
    },
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': 'error',
    'no-undef': 'error', // Reports undefined variables
    'no-unused-vars': 'error', // Reports unused variables
    'no-unused-imports': 'error', // Reports unused imports
  },
};
