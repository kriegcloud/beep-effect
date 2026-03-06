import effectImportStyleRule from "@beep/repo-configs/eslint/EffectImportStyleRule";
import { resetAllowlistCache } from "@beep/repo-configs/eslint/EffectLawsAllowlist";
import { ESLintConfig } from "@beep/repo-configs/eslint/ESLintConfig";
import noNativeRuntimeRule from "@beep/repo-configs/eslint/NoNativeRuntimeRule";
import requireCategoryTagRule from "@beep/repo-configs/eslint/RequireCategoryTagRule";
import terseEffectStyleRule from "@beep/repo-configs/eslint/TerseEffectStyleRule";
import tsParser from "@typescript-eslint/parser";
import { Linter, type Linter as LinterTypes } from "eslint";
import { beforeEach, describe, expect, it } from "vitest";

const verify = (source: string, config: LinterTypes.Config | Array<LinterTypes.Config>, filename: string) =>
  new Linter({ configType: "flat" }).verify(source, config, filename);

const effectImportStyleConfig: Array<LinterTypes.Config> = [
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

const noNativeRuntimeConfig: Array<LinterTypes.Config> = [
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

const requireCategoryConfig: Array<LinterTypes.Config> = [
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

const terseEffectStyleConfig: Array<LinterTypes.Config> = [
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
          "terse-effect-style": terseEffectStyleRule,
        },
      },
    },
    rules: {
      "beep-laws/terse-effect-style": "error",
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

  it("flags trivial helper wrapper lambdas for direct helper references", () => {
    const messages = verify(
      ['import * as A from "effect/Array";', "export const value = { onNone: () => A.empty<string>() };"].join("\n"),
      terseEffectStyleConfig,
      "tooling/configs/src/TerseHelpers.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/terse-effect-style" && message.message.includes("A.empty")
      )
    ).toBe(true);
  });

  it("flags one-argument wrappers that can use direct helper references", () => {
    const messages = verify(
      ['import * as A from "effect/Array";', "export const value = { onSome: (reference) => A.make(reference) };"].join(
        "\n"
      ),
      terseEffectStyleConfig,
      "tooling/configs/src/TerseOnSome.ts"
    );

    expect(
      messages.some((message) => message.ruleId === "beep-laws/terse-effect-style" && message.message.includes("A.of"))
    ).toBe(true);
  });

  it("flags passthrough pipe callbacks that should use flow", () => {
    const messages = verify(
      [
        'import { pipe } from "effect";',
        'import * as O from "effect/Option";',
        "declare const parse: (value: string) => O.Option<string>;",
        "export const value = (input) => pipe(input, parse, O.getOrElse(() => input));",
      ].join("\n"),
      terseEffectStyleConfig,
      "tooling/configs/src/TerseFlow.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/terse-effect-style" && message.message.includes("flow(...)")
      )
    ).toBe(true);
  });

  it("does not flag annotated wrappers that may affect inference", () => {
    const messages = verify(
      [
        'import * as A from "effect/Array";',
        "export const value = { onSome: (reference: string) => A.make(reference) };",
      ].join("\n"),
      terseEffectStyleConfig,
      "tooling/configs/src/TerseAnnotated.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/terse-effect-style")).toBe(false);
  });

  it("flags trivial literal thunks only when the shared helper is already imported", () => {
    const messages = verify(
      ['import { thunkUndefined } from "@beep/utils";', "export const value = { onNone: () => undefined };"].join("\n"),
      terseEffectStyleConfig,
      "tooling/configs/src/TerseThunk.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/terse-effect-style" && message.message.includes("thunkUndefined")
      )
    ).toBe(true);
  });

  it("exports a root ESLintConfig array with beep-laws plugin registration", () => {
    expect(ESLintConfig.length).toBeGreaterThan(0);
    expect(ESLintConfig.some((entry) => entry.plugins !== undefined && "beep-laws" in entry.plugins)).toBe(true);
  });
});
