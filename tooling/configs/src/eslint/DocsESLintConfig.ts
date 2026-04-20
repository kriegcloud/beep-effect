import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import jsdoc from "eslint-plugin-jsdoc";
import tsdoc from "eslint-plugin-tsdoc";
import requireCategoryTagRule from "./RequireCategoryTagRule.ts";

const beepJsdoc = {
  rules: {
    "require-category-tag": requireCategoryTagRule,
  },
};

// Keep this list aligned with packages/common/ui/tsconfig.json excludes so
// type-aware lint does not parse files the UI project service excludes.
const uiTsconfigExcludedTypeAwareFiles = [
  "packages/common/ui/src/components/calendar.tsx",
  "packages/common/ui/src/components/carousel.tsx",
  "packages/common/ui/src/components/command.tsx",
  "packages/common/ui/src/components/drawer.tsx",
  "packages/common/ui/src/components/field.tsx",
  "packages/common/ui/src/components/input-otp.tsx",
  "packages/common/ui/src/components/orb.tsx",
  "packages/common/ui/src/components/resizable.tsx",
  "packages/common/ui/src/components/sonner.tsx",
  "packages/common/ui/src/components/speech-input.tsx",
  "packages/common/ui/src/components/toaster.tsx",
  "packages/common/ui/src/components/tour.tsx",
] as const;

const repoRootDirectory = fileURLToPath(new URL("../../../../", import.meta.url));

/**
 * Flat ESLint config array shape exported for repository documentation checks.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type DocsESLintConfigShape = ReadonlyArray<Linter.Config>;

/**
 * Docs-only ESLint configuration used by the repository root `lint:jsdoc` lane.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DocsESLintConfig: DocsESLintConfigShape = [
  {
    ignores: [
      ".next/**",
      "**/.next/**",
      ".repos/**",
      ".sst/**",
      "coverage/**",
      "**/coverage/**",
      "dist/**",
      "**/dist/**",
      "node_modules/**",
      "**/storybook-static/**",
      "**/.turbo/**",
      "**/src-tauri/target/**",
    ],
  },
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
        tsconfigRootDir: repoRootDirectory,
        warnOnUnsupportedTypeScriptVersion: false,
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
          domain: {
            name: "text",
            type: false,
          },
          provides: {
            name: "text",
            type: false,
          },
          depends: {
            name: "text",
            type: false,
          },
          errors: {
            name: "text",
            type: false,
          },
        },
      },
    },
    rules: {
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
      "jsdoc/informative-docs": "error",
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
      "jsdoc/check-param-names": [
        "error",
        {
          checkDestructured: false,
        },
      ],
      "beep-jsdoc/require-category-tag": "warn",
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
      "jsdoc/sort-tags": "warn",
      "jsdoc/multiline-blocks": "warn",
      "jsdoc/tag-lines": ["warn", "never", { startLines: 1 }],
    },
  },
  {
    files: ["tooling/*/src/**/tag-values/**/*.ts"],
    plugins: { jsdoc },
    rules: {
      "jsdoc/require-description": "off",
      "jsdoc/match-description": "off",
    },
  },
  {
    files: ["tooling/*/src/index.ts"],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: repoRootDirectory,
        warnOnUnsupportedTypeScriptVersion: false,
      },
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
  {
    files: [
      "apps/**/*.{ts,tsx}",
      "packages/**/*.{ts,tsx}",
      "tooling/**/*.{ts,tsx}",
      "infra/**/*.ts",
      ".claude/hooks/**/*.ts",
    ],
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
      "**/vitest.storybook.config.ts",
      "tooling/*/scripts/**",
      "tooling/*/src/internal/**",
      ...uiTsconfigExcludedTypeAwareFiles,
    ],
    plugins: {
      "eslint-plugin-tsdoc": tsdoc,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: repoRootDirectory,
        warnOnUnsupportedTypeScriptVersion: false,
      },
    },
    rules: {
      "eslint-plugin-tsdoc/syntax": "warn",
    },
  },
];

export default DocsESLintConfig;
