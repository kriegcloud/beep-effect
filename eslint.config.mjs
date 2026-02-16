import tsParser from "@typescript-eslint/parser";
import enforceReactNamespace from "./scripts/eslint-rules/enforce-react-namespace.mjs";
import noDeepRelativeImports from "./scripts/eslint-rules/no-deep-relative-imports.mjs";
import noRelativeImportOutsidePackage from "./scripts/eslint-rules/no-relative-import-outside-package.mjs";

export default [
  {
    ignores: [
      "**/dist",
      "**/build",
      "**/docs",
      "**/*.md",
      "**/vitest.config.ts",
      "**/vitest.workspace.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "no-relative-import-outside-package": {
        rules: {
          "no-relative-import-outside-package": noRelativeImportOutsidePackage,
        },
      },
      "enforce-react-namespace": {
        rules: {
          "enforce-react-namespace": enforceReactNamespace,
        },
      },
      "no-deep-relative-imports": {
        rules: {
          "no-deep-relative-imports": noDeepRelativeImports,
        },
      },
    },
    rules: {
      "no-relative-import-outside-package/no-relative-import-outside-package": "error",
      "enforce-react-namespace/enforce-react-namespace": "error",
      "no-deep-relative-imports/no-deep-relative-imports": "error",
    },
  },
];
