module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest', // Allows the use of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: ['plugin:@typescript-eslint/recommended'], // Uses the linting rules from @typescript-eslint/eslint-plugin
  env: {
    node: true, // Enable Node.js global variables
  },
  rules: {
    // quotes: [1, 'single', { 'avoidEscape': true }],
    indent: [1, 2],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [1]
  },
  ignorePatterns: ['node_modules', 'data', 'plando-random-settings']
};