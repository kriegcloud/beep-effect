module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    node: true
  },
  extends: [
    'digitalbazaar',
    'digitalbazaar/jsdoc'
  ],
  rules: {
    'jsdoc/require-description-complete-sentence': 'off'
  },
  ignorePatterns: [
    'test-suites'
  ]
};
