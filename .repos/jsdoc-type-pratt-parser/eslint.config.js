import love from 'eslint-config-love';

export default [
  {
    ignores: [
      '.idea',
      'benchmark',
      'coverage',
      'dist',
      'docs',
      '*.cjs',
      '*.js',

      'decs.d.ts'
    ]
  },
  love,
  {
    files: ['**/*.ts'],
    // languageOptions: {
    //   parserOptions: {
    //     project: './tsconfig.json',
    //     tsconfigRootDir: import.meta.dirname
    //   }
    // },
    rules: {
      // Disable for now
      '@typescript-eslint/init-declarations': 0,
      '@typescript-eslint/max-params': 0,
      '@typescript-eslint/no-magic-numbers': 0,
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/no-unnecessary-type-parameters': 0,
      '@typescript-eslint/no-unsafe-type-assertion': 0,
      '@typescript-eslint/non-nullable-type-assertion-style': 0,
      '@typescript-eslint/prefer-destructuring': 0,
      'complexity': 0,
      'max-lines': 0,
      'max-nested-callbacks': 0,
      'no-param-reassign': 0,
      'no-plusplus': 0,
      'no-negated-condition': 0,
      'no-lonely-if': 0
    }
  }
];

