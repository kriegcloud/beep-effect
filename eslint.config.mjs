// eslint.config.mjs

import tsParser from "@typescript-eslint/parser";
import jsdoc from "eslint-plugin-jsdoc";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // JSDoc Documentation Rules - main enforcement
  {
    files: ["tooling/*/src/**/*.ts"],
    ignores: ["tooling/*/src/internal/**", "tooling/*/src/**/*.test.ts", "tooling/*/src/**/*.spec.ts", "**/*.d.ts"],
    plugins: {
      jsdoc,
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
        "error",
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
          definedTags: ["domain", "provides", "depends", "errors", "packageDocumentation", "internal", "alpha", "beta"],
        },
      ],
      "jsdoc/check-param-names": "error",

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
            since: {
              initialCommentsOnly: true,
              mustExist: true,
            },
          },
        },
      ],
    },
  },
];
