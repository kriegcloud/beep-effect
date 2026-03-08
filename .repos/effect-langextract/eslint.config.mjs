import tseslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import sortDestructureKeys from "eslint-plugin-sort-destructure-keys"

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".reference/**",
      ".cache/**",
      "scripts/**",
      "src/visualization/frontendBundle.generated.ts"
    ]
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "simple-import-sort": simpleImportSort,
      "sort-destructure-keys": sortDestructureKeys
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "sort-destructure-keys/sort-destructure-keys": "warn",
      "no-console": "warn"
    }
  },
  {
    files: ["test/**/*.ts"],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "sort-destructure-keys": sortDestructureKeys
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "sort-destructure-keys/sort-destructure-keys": "warn"
    }
  }
]
