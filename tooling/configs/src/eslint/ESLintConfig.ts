import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import jsdoc from "eslint-plugin-jsdoc";
import effectImportStyleRule from "./EffectImportStyleRule.ts";
import noNativeRuntimeRule from "./NoNativeRuntimeRule.ts";
import requireCategoryTagRule from "./RequireCategoryTagRule.ts";
import schemaFirstRule from "./SchemaFirstRule.ts";
import terseEffectStyleRule from "./TerseEffectStyleRule.ts";

const beepJsdoc = {
  rules: {
    "require-category-tag": requireCategoryTagRule,
  },
};

const beepLaws = {
  rules: {
    "effect-import-style": effectImportStyleRule,
    "no-native-runtime": noNativeRuntimeRule,
    "schema-first": schemaFirstRule,
    "terse-effect-style": terseEffectStyleRule,
  },
};

/**
 * Shared flat ESLint configuration used by the repository root.
 *
 * @since 0.0.0
 * @category Configuration
 */
export type ESLintConfigShape = ReadonlyArray<Linter.Config>;

/**
 * Shared flat ESLint configuration used by the repository root.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const ESLintConfig: ESLintConfigShape = [
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
      "**/lostpixel.config.ts",
      "**/vitest.storybook.config.ts",
      "tooling/*/scripts/**",
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
      "beep-laws/schema-first": "warn",
      "beep-laws/terse-effect-style": "warn",
    },
  },
  {
    files: [
      "tooling/cli/src/**/*.ts",
      "tooling/repo-utils/src/FsUtils.ts",
      "tooling/repo-utils/src/UniqueDeps.ts",
      "tooling/repo-utils/src/schemas/WorkspaceDeps.ts",
      "packages/ai/sdk/src/core/Schema/Session.ts",
      "packages/ai/sdk/src/core/Storage/SessionIndexStore.ts",
      "packages/ai/sdk/src/core/Storage/StorageConfig.ts",
    ],
    ignores: ["**/*.d.ts"],
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
      "beep-laws/schema-first": "error",
    },
  },
  {
    files: [
      "packages/ai/sdk/src/core/AgentSdkConfig.ts",
      "packages/ai/sdk/src/core/SessionConfig.ts",
      "packages/ai/sdk/src/core/Diagnose.ts",
      "packages/ai/sdk/src/core/Storage/SessionIndexStore.ts",
      "tooling/cli/src/commands/DocsAggregate.ts",
      "tooling/cli/src/commands/Lint/index.ts",
      "tooling/cli/src/commands/Laws/index.ts",
      "tooling/cli/src/commands/Laws/EffectImports.ts",
      "tooling/cli/src/commands/Graphiti/internal/ProxyConfig.ts",
      "tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts",
      "tooling/cli/src/commands/Graphiti/internal/ProxyRuntime.ts",
      ".claude/hooks/schemas/index.ts",
      ".claude/hooks/skill-suggester/index.ts",
      ".claude/hooks/subagent-init/index.ts",
      ".claude/hooks/agent-init/index.ts",
      ".claude/hooks/pattern-detector/core.ts",
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
      "beep-laws/no-native-runtime": "error",
    },
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

export default ESLintConfig;
