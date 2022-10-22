module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  // `prettier` goes last so it can turn off rules that clash with formatting.
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    eqeqeq: ['error', 'smart'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
  ignorePatterns: ['dist/'],
  overrides: [
    {
      // Tooling config runs in Node as CommonJS.
      files: ['.eslintrc.js', '*.config.js', 'webpack.*.js'],
      env: {
        browser: false,
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['**/*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
};
