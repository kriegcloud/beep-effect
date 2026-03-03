// eslint.config.mjs

import tsParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";
import effectImportStyleRule from "./eslint-rules/effect-import-style.mjs";
import noNativeRuntimeRule from "./eslint-rules/no-native-runtime.mjs";
import requireCategoryTagRule from "./eslint-rules/require-category-tag.mjs";

const beepJsdoc = {
  rules: {
    "require-category-tag": requireCategoryTagRule,
  },
};

const beepLaws = {
  rules: {
    "effect-import-style": effectImportStyleRule,
    "no-native-runtime": noNativeRuntimeRule,
  },
};

/** @type {import("eslint").Linter.Config[]} */
export default [
  // Global ignores — build artifacts and external repos
  {
    ignores: [
      ".next/**",
      "**/.next/**",
      ".repos/**",
      ".sst/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "**/storybook-static/**",
      "**/.turbo/**",
    ],
  },
  // Effect Laws v1 Rules - phased rollout (warn now, escalate to error after cleanup)
  {
    files: ["apps/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}", "tooling/**/*.{ts,tsx}", "infra/**/*.ts"],
    ignores: [
      "**/*.d.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/*.stories.tsx",
      "**/test/**",
      "**/tests/**",
      "**/dtslint/**",
      "**/.storybook/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/.next/**",
      "**/lostpixel.config.ts",
      "**/vitest.storybook.config.ts",
      "tooling/*/src/internal/**",
    ],
    plugins: {
      "beep-laws": beepLaws,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "beep-laws/effect-import-style": "warn",
      "beep-laws/no-native-runtime": "warn",
    },
  },
  // JSDoc Documentation Rules - main enforcement
  {
    files: ["tooling/*/src/**/*.ts"],
    ignores: ["tooling/*/src/internal/**", "tooling/*/src/**/*.test.ts", "tooling/*/src/**/*.spec.ts", "**/*.d.ts"],
    plugins: {
      jsdoc,
      "beep-jsdoc": beepJsdoc,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
    settings: {
      jsdoc: {
        mode: "typescript",
        tagNamePreference: {
          returns: "returns",
          augments: "extends",
        },
        structuredTags: {
          domain: { name: "text", type: false },
          provides: { name: "text", type: false },
          depends: { name: "text", type: false },
          errors: { name: "text", type: false },
        },
      },
    },
    rules: {
      // --- Presence Rules (Error) ---
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
          contexts: [
            "ExportNamedDeclaration > TSTypeAliasDeclaration",
            "ExportNamedDeclaration > TSInterfaceDeclaration",
            "ExportNamedDeclaration > VariableDeclaration",
          ],
          checkConstructors: false,
        },
      ],
      "jsdoc/require-description": [
        "warn",
        {
          contexts: [
            "ExportNamedDeclaration > FunctionDeclaration",
            "ExportNamedDeclaration > VariableDeclaration",
            "ExportNamedDeclaration > TSTypeAliasDeclaration",
            "ExportNamedDeclaration > TSInterfaceDeclaration",
            "ExportNamedDeclaration > ClassDeclaration",
          ],
        },
      ],
      "jsdoc/require-param": ["warn", { checkDestructured: false }],
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns": "warn",
      "jsdoc/require-returns-description": "warn",

      // --- Quality Rules ---
      "jsdoc/informative-docs": "error",
      "jsdoc/no-types": "error",
      "jsdoc/no-blank-block-descriptions": "error",
      "jsdoc/check-tag-names": [
        "error",
        {
          definedTags: [
            "domain",
            "provides",
            "depends",
            "errors",
            "packageDocumentation",
            "internal",
            "alpha",
            "beta",
            "ignore",
          ],
        },
      ],
      "jsdoc/check-param-names": "error",
      "beep-jsdoc/require-category-tag": "warn",

      // --- Phase 1 Overrides (Gradual Adoption) ---
      "jsdoc/match-description": [
        "warn",
        {
          matchDescription: ".{20,}",
          tags: {
            param: {
              match: ".{5,}",
              message: "Parameter description must be at least 5 characters.",
            },
            returns: {
              match: ".{5,}",
              message: "Returns description must be at least 5 characters.",
            },
          },
        },
      ],
      "jsdoc/sort-tags": "off",

      // --- Style Rules ---
      "jsdoc/multiline-blocks": "warn",
      "jsdoc/tag-lines": ["warn", "never", { startLines: 1 }],
    },
  },

  // Tag-value schema models — descriptions live in $I.annote(), not JSDoc prose
  {
    files: ["tooling/*/src/**/tag-values/**/*.ts"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-description": "off",
      "jsdoc/match-description": "off",
    },
  },

  // File Overview Rules - barrel files
  {
    files: ["tooling/*/src/index.ts"],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "jsdoc/require-file-overview": [
        "warn",
        {
          tags: {
            packageDocumentation: {
              initialCommentsOnly: true,
              mustExist: true,
            },
          },
        },
      ],
    },
  },
];
