import { readFileSync } from "node:fs";
import effectImportStyleRule from "@beep/repo-configs/eslint/EffectImportStyleRule";
import { resetAllowlistCache } from "@beep/repo-configs/eslint/EffectLawsAllowlist";
import { ESLintConfig } from "@beep/repo-configs/eslint/ESLintConfig";
import noNativeRuntimeRule from "@beep/repo-configs/eslint/NoNativeRuntimeRule";
import requireCategoryTagRule from "@beep/repo-configs/eslint/RequireCategoryTagRule";
import schemaFirstRule from "@beep/repo-configs/eslint/SchemaFirstRule";
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

const schemaFirstConfig: Array<LinterTypes.Config> = [
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
          "schema-first": schemaFirstRule,
        },
      },
    },
    rules: {
      "beep-laws/schema-first": "error",
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

  it("flags exported pure-data interfaces for schema-first modeling", () => {
    const messages = verify(
      ["export interface StorageConfigShape {", "  readonly enabled: boolean;", "}"].join("\n"),
      schemaFirstConfig,
      "tooling/cli/src/SchemaFirstFixture.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/schema-first")).toBe(true);
  });

  it("ignores exported service interfaces with function members", () => {
    const messages = verify(
      ["export interface StorageService {", "  readonly get: (key: string) => Promise<string>;", "}"].join("\n"),
      schemaFirstConfig,
      "tooling/cli/src/StorageServiceFixture.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/schema-first")).toBe(false);
  });

  it("accepts helper namespace imports with canonical aliases", () => {
    const messages = verify(
      ['import * as Str from "effect/String";', "export const value = 1;"].join("\n"),
      effectImportStyleConfig,
      "tooling/configs/src/StringImport.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/effect-import-style")).toBe(false);
  });

  it("accepts Function helpers that are not root effect exports", () => {
    const messages = verify(
      [
        'import { dual } from "effect/Function";',
        "export const value = dual(2, (self: string, suffix: string) => self + suffix);",
      ].join("\n"),
      effectImportStyleConfig,
      "tooling/configs/src/FunctionDualImport.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/effect-import-style")).toBe(false);
  });

  it("flags Function helpers that should come from root effect exports", () => {
    const messages = verify(
      ['import { pipe } from "effect/Function";', 'export const value = pipe("a", (value) => value);'].join("\n"),
      effectImportStyleConfig,
      "tooling/configs/src/FunctionPipeImport.ts"
    );

    expect(
      messages.some(
        (message) =>
          message.ruleId === "beep-laws/effect-import-style" &&
          message.message.includes('Prefer root imports from "effect"')
      )
    ).toBe(true);
  });

  it("flags canonical alias imports from root effect that should use namespaces", () => {
    const messages = verify(
      ['import { pipe, String as Str } from "effect";', "export const value = pipe('a', Str.toUpperCase);"].join("\n"),
      effectImportStyleConfig,
      "tooling/configs/src/RootImport.ts"
    );

    expect(
      messages.some(
        (message) =>
          message.ruleId === "beep-laws/effect-import-style" &&
          message.message.includes("Use namespace import with alias Str for effect/String")
      )
    ).toBe(true);
  });

  it("ignores type-only canonical alias imports from mixed root effect imports", () => {
    const messages = verify(
      ['import { type String as Str, pipe } from "effect";', 'export const value = pipe("a", (value) => value);'].join(
        "\n"
      ),
      effectImportStyleConfig,
      "tooling/configs/src/MixedTypeRootImport.ts"
    );

    expect(
      messages.some(
        (message) =>
          message.ruleId === "beep-laws/effect-import-style" &&
          message.message.includes("Use namespace import with alias Str for effect/String")
      )
    ).toBe(false);
  });

  it("flags new Date in non-allowlisted files", () => {
    const messages = verify(
      "export const value = new Date();",
      noNativeRuntimeConfig,
      "tooling/configs/src/NewDate.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/no-native-runtime")).toBe(true);
  });

  it("flags native Error construction in non-allowlisted files", () => {
    const messages = verify(
      'export const fail = () => { throw new Error("boom"); };',
      noNativeRuntimeConfig,
      "apps/desktop/src/Main.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "nativeError"
      )
    ).toBe(true);
  });

  it("flags global native Error calls in non-allowlisted files", () => {
    const messages = verify(
      'export const capture = () => globalThis.Error("boom");',
      noNativeRuntimeConfig,
      "packages/shared/domain/src/errors/DbError/Formatter.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "nativeError"
      )
    ).toBe(true);
  });

  it("flags native error subclasses in identifier form", () => {
    const messages = verify(
      'export const fail = () => { throw new TypeError("boom"); };',
      noNativeRuntimeConfig,
      "apps/desktop/src/TypeErrorFixture.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "nativeError"
      )
    ).toBe(true);
  });

  it("flags native error subclasses in globalThis form", () => {
    const messages = verify(
      'export const capture = () => globalThis.RangeError("boom");',
      noNativeRuntimeConfig,
      "packages/shared/domain/src/errors/RangeErrorFixture.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "nativeError"
      )
    ).toBe(true);
  });

  it("flags native error subclasses in globalThis bracket-call form", () => {
    const messages = verify(
      'export const capture = () => globalThis["RangeError"]("boom");',
      noNativeRuntimeConfig,
      "packages/shared/domain/src/RangeErrorBracketCallFixture.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "nativeError"
      )
    ).toBe(true);
  });

  it("flags native error subclasses in globalThis bracket-constructor form", () => {
    const messages = verify(
      'export const fail = () => { throw new globalThis["TypeError"]("boom"); };',
      noNativeRuntimeConfig,
      "apps/desktop/src/TypeErrorBracketFixture.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/no-native-runtime" && message.messageId === "nativeError"
      )
    ).toBe(true);
  });

  it("does not suppress violations after the allowlist entry is removed", () => {
    const messages = verify(
      "export const value = new Date();",
      noNativeRuntimeConfig,
      "apps/editor-app/src/lib/db/schema.ts"
    );

    expect(messages.some((message) => message.ruleId === "beep-laws/no-native-runtime")).toBe(true);
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

  it("ignores type-only thunk helper imports from mixed @beep/utils imports", () => {
    const messages = verify(
      [
        'import { type thunkUndefined, thunk0 } from "@beep/utils";',
        "export const keep = thunk0;",
        "export const value = { onNone: () => undefined };",
      ].join("\n"),
      terseEffectStyleConfig,
      "tooling/configs/src/TerseMixedTypeThunk.ts"
    );

    expect(
      messages.some(
        (message) => message.ruleId === "beep-laws/terse-effect-style" && message.message.includes("thunkUndefined")
      )
    ).toBe(false);
  });

  it("exports a root ESLintConfig array with beep-laws plugin registration", () => {
    expect(ESLintConfig.length).toBeGreaterThan(0);
    expect(ESLintConfig.some((entry) => entry.plugins !== undefined && "beep-laws" in entry.plugins)).toBe(true);
  });

  it("keeps root type-aware UI ignores aligned with the UI tsconfig excludes", () => {
    const uiTsconfig = JSON.parse(
      readFileSync(new URL("../../../packages/common/ui/tsconfig.json", import.meta.url), "utf8")
    ) as {
      readonly exclude?: ReadonlyArray<string>;
    };

    const rootTypeAwareConfig = ESLintConfig.find((entry) => entry.files?.includes("packages/**/*.{ts,tsx}"));

    expect(rootTypeAwareConfig).toBeDefined();

    const actualUiIgnores = (rootTypeAwareConfig?.ignores ?? [])
      .filter(
        (ignore): ignore is string =>
          typeof ignore === "string" && ignore.startsWith("packages/common/ui/src/components/")
      )
      .sort();

    const expectedUiIgnores = (uiTsconfig.exclude ?? [])
      .filter((exclude) => exclude.endsWith(".ts") || exclude.endsWith(".tsx") || exclude.endsWith("/**/*"))
      .map((exclude) => `packages/common/ui/${exclude}`)
      .sort();

    expect(actualUiIgnores).toEqual(expectedUiIgnores);
  });
});
