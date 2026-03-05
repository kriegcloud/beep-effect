import tsParser from "@typescript-eslint/parser";
import { Linter, type Linter as LinterTypes } from "eslint";
import { beforeEach, describe, expect, it } from "vitest";
import effectImportStyleRule from "../src/eslint/EffectImportStyleRule.ts";
import { resetAllowlistCache } from "../src/eslint/EffectLawsAllowlist.ts";
import { ESLintConfig } from "../src/eslint/ESLintConfig.ts";
import noNativeRuntimeRule from "../src/eslint/NoNativeRuntimeRule.ts";
import requireCategoryTagRule from "../src/eslint/RequireCategoryTagRule.ts";

const verify = (source: string, config: LinterTypes.Config | ReadonlyArray<LinterTypes.Config>, filename: string) =>
  new Linter({ configType: "flat" }).verify(source, config, filename);

const effectImportStyleConfig: ReadonlyArray<LinterTypes.Config> = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "beep-laws": {
        rules: {
          "effect-import-style": effectImportStyleRule,
        },
      },
    },
    rules: {
      "beep-laws/effect-import-style": "error",
    },
  },
];

const noNativeRuntimeConfig: ReadonlyArray<LinterTypes.Config> = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "beep-laws": {
        rules: {
          "no-native-runtime": noNativeRuntimeRule,
        },
      },
    },
    rules: {
      "beep-laws/no-native-runtime": "error",
    },
  },
];

const requireCategoryConfig: ReadonlyArray<LinterTypes.Config> = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "beep-jsdoc": {
        rules: {
          "require-category-tag": requireCategoryTagRule,
        },
      },
    },
    rules: {
      "beep-jsdoc/require-category-tag": "error",
    },
  },
];

describe("eslint rule migration", () => {
  beforeEach(() => {
    resetAllowlistCache();
  });

  it("flags alias mismatches for Effect namespace imports", () => {
    const messages = verify(
      ['import * as ArrayAlias from "effect/Array";', "export const value = 1;"].join("\n"),
      effectImportStyleConfig,
      "tooling/configs/src/AliasMismatch.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/effect-import-style" && message.message.includes("Use alias A")
      )
    ).toBe(true);
  });

  it("flags stable Effect submodule imports that should come from root effect", () => {
    const messages = verify(
      ['import * as Str from "effect/String";', "export const value = 1;"].join("\n"),
      effectImportStyleConfig,
      "tooling/configs/src/RootImport.ts"
    );

    expect(
      messages.some(
        (message) =>
          message.ruleId === "beep-laws/effect-import-style" &&
          message.message.includes('Prefer root imports from "effect"')
      )
    ).toBe(true);
  });

  it("flags new Date in non-allowlisted files", () => {
    const messages = verify(
      "export const value = new Date();",
      noNativeRuntimeConfig,
      "tooling/configs/src/NewDate.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/no-native-runtime")).toBe(true);
  });

  it("suppresses allowlisted violations for exact file and kind matches", () => {
    const messages = verify("export const value = new Date();", noNativeRuntimeConfig, "apps/web/src/lib/db/schema.ts");

    expect(messages.some((message) => message.ruleId === "beep-laws/no-native-runtime")).toBe(false);
  });

  it("does not flag literal equality when typeof is absent", () => {
    const messages = verify(
      'export const value = "string" === "number";',
      noNativeRuntimeConfig,
      "tooling/configs/src/LiteralEquality.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "typeofRuntime"
      )
    ).toBe(false);
  });

  it("requires @category on exported symbols", () => {
    const messages = verify(
      "/** Description */\nexport const Value = 1;",
      requireCategoryConfig,
      "tooling/configs/src/MissingCategory.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-jsdoc/require-category-tag")).toBe(true);
  });

  it("accepts exported symbols with @category", () => {
    const messages = verify(
      ["/**", " * @category Configuration", " */", "export const Value = 1;"].join("\n"),
      requireCategoryConfig,
      "tooling/configs/src/WithCategory.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-jsdoc/require-category-tag")).toBe(false);
  });

  it("exports a root ESLintConfig array with beep-laws plugin registration", () => {
    expect(ESLintConfig.length).toBeGreaterThan(0);
    expect(ESLintConfig.some((entry) => entry.plugins !== undefined && "beep-laws" in entry.plugins)).toBe(true);
  });
});
