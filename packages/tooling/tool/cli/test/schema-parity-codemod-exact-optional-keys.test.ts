import {
  EffectSchemaOwnerModules,
  exactOptionalKeysRule,
  planSchemaParityCodemodFile,
  SchemaParityCodemodFileOutcome,
} from "@beep/repo-cli/test/Lint";
import { A } from "@beep/utils";
import { describe, it } from "@effect/vitest";
import { assertTrue, deepStrictEqual, strictEqual } from "@effect/vitest/utils";
import { Project, ts } from "ts-morph";

// A minimal effect/Schema surface at an owner module path: the rule resolves
// members by declaration module, so the stub stands in for the real package.
const SCHEMA_STUB = `export interface Top { readonly ast: unknown }
export declare const String: Top;
export declare const Number: Top;
export interface optional<S> extends Top { readonly schema: S }
export declare const optional: <S extends Top>(self: S) => optional<S>;
export interface optionalKey<S> extends Top { readonly schema: S }
export declare const optionalKey: <S extends Top>(self: S) => optionalKey<S>;
export interface UndefinedOr<S> extends Top { readonly schema: S }
export declare const UndefinedOr: <S extends Top>(self: S) => UndefinedOr<S>;
export interface withDecodingDefault<S> extends Top { readonly schema: S }
export declare const withDecodingDefault: (value: unknown) => <S extends Top>(self: S) => withDecodingDefault<S>;
export interface withDecodingDefaultKey<S> extends Top { readonly schema: S }
export declare const withDecodingDefaultKey: (value: unknown) => <S extends Top>(self: S) => withDecodingDefaultKey<S>;
export interface OptionFromOptional<S> extends Top { readonly schema: S }
export declare const OptionFromOptional: <S extends Top>(self: S) => OptionFromOptional<S>;
export interface OptionFromOptionalKey<S> extends Top { readonly schema: S }
export declare const OptionFromOptionalKey: <S extends Top>(self: S) => OptionFromOptionalKey<S>;
export declare const Struct: <F extends Record<string, Top>>(fields: F) => Top & { readonly fields: F };
export declare const Class: <Self>(id: string) => <F extends Record<string, Top>>(fields: F) => new () => Top;
export interface Pipeable { pipe<B>(f: (self: this) => B): B }
`;

const SCHEMA_MODULE = "node_modules/effect/src/Schema.ts";
const FIXTURE_MODULE = "packages/example/src/fixture.ts";
const SCHEMA_IMPORT = '"../../../node_modules/effect/src/Schema.ts"';

const compilerOptions = {
  strict: true,
  exactOptionalPropertyTypes: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowImportingTsExtensions: true,
  noEmit: true,
};

const plan = (body: string, header = `import * as S from ${SCHEMA_IMPORT};\n`) => {
  const project = new Project({ useInMemoryFileSystem: true, compilerOptions });
  project.createSourceFile(`/repo/${SCHEMA_MODULE}`, SCHEMA_STUB);
  const sourceFile = project.createSourceFile(`/repo/${FIXTURE_MODULE}`, `${header}${body}`);
  return planSchemaParityCodemodFile(sourceFile, [exactOptionalKeysRule], FIXTURE_MODULE);
};

const rewrite = (body: string, header?: string): string => {
  const outcome = plan(body, header);
  assertTrue(SchemaParityCodemodFileOutcome.guards.Planned(outcome));
  const prefix = header ?? `import * as S from ${SCHEMA_IMPORT};\n`;
  return outcome.nextText.slice(prefix.length);
};

const residueReasons = (body: string, header?: string): ReadonlyArray<string> => {
  const outcome = plan(body, header);
  assertTrue(SchemaParityCodemodFileOutcome.guards.Planned(outcome));
  return A.map(outcome.plan.residue, (entry) => `${entry.facet}:${entry.reason}`);
};

describe("exact-optional-keys rule", () => {
  it("resolves members by the effect/Schema owner modules", () => {
    assertTrue(A.some(EffectSchemaOwnerModules, (suffix) => `/repo/${SCHEMA_MODULE}`.endsWith(suffix)));
  });

  it("rewrites the call form inside an inline struct", () => {
    strictEqual(
      rewrite("export const A = S.Struct({ a: S.optional(S.String), b: S.String });\n"),
      "export const A = S.Struct({ a: S.optionalKey(S.String), b: S.String });\n"
    );
  });

  it("rewrites the pipe-argument form", () => {
    strictEqual(
      rewrite("declare const X: S.Top & S.Pipeable;\nexport const A = S.Struct({ a: X.pipe(S.optional) });\n"),
      "declare const X: S.Top & S.Pipeable;\nexport const A = S.Struct({ a: X.pipe(S.optionalKey) });\n"
    );
  });

  it("rewrites fields hoisted into a constant object outside the schema", () => {
    strictEqual(
      rewrite("const fields = { a: S.optional(S.Number) };\nexport const A = S.Struct(fields);\n"),
      "const fields = { a: S.optionalKey(S.Number) };\nexport const A = S.Struct(fields);\n"
    );
  });

  it("rewrites a member passed as a mapping function and a stored alias", () => {
    strictEqual(
      rewrite("declare const map: <F>(f: F) => F;\nexport const m = map(S.optional);\nconst opt = S.optional;\n"),
      "declare const map: <F>(f: F) => F;\nexport const m = map(S.optionalKey);\nconst opt = S.optionalKey;\n"
    );
  });

  it("rewrites type positions", () => {
    strictEqual(
      rewrite("export type A = S.optional<typeof S.String>;\nexport type B = typeof S.optional;\n"),
      "export type A = S.optionalKey<typeof S.String>;\nexport type B = typeof S.optionalKey;\n"
    );
  });

  it("rewrites withDecodingDefault and OptionFromOptional to their key siblings", () => {
    strictEqual(
      rewrite(
        'export const A = S.Struct({ a: S.withDecodingDefault("x")(S.String), b: S.OptionFromOptional(S.Number) });\n'
      ),
      'export const A = S.Struct({ a: S.withDecodingDefaultKey("x")(S.String), b: S.OptionFromOptionalKey(S.Number) });\n'
    );
  });

  it("follows any namespace alias of effect/Schema", () => {
    strictEqual(
      rewrite(
        "export const A = Schema.Struct({ a: Schema.optional(Schema.String) });\n",
        `import * as Schema from ${SCHEMA_IMPORT};\n`
      ),
      "export const A = Schema.Struct({ a: Schema.optionalKey(Schema.String) });\n"
    );
  });

  it("leaves exact forms and the explicit UndefinedOr exception alone", () => {
    const outcome = plan(
      'export const A = S.Struct({ a: S.optionalKey(S.String), b: S.optionalKey(S.UndefinedOr(S.Number)), c: S.withDecodingDefaultKey("x")(S.String), d: S.OptionFromOptionalKey(S.String) });\n'
    );
    strictEqual(outcome._tag, "Unchanged");
  });

  it("never rewrites same-named members owned by other modules", () => {
    const outcome = plan(
      "declare const Flag: { optional: <A>(a: A) => A };\nconst local = { optional: 1, withDecodingDefault: 2 };\nexport const a = [Flag.optional(1), local.optional, local.withDecodingDefault];\n"
    );
    strictEqual(outcome._tag, "Unchanged");
  });

  it("reports named imports and computed member access as residue", () => {
    deepStrictEqual(
      residueReasons(
        "export const A = S.Struct({ a: optional(S.String) });\nexport const B = S['optional'];\n",
        `import * as S from ${SCHEMA_IMPORT};\nimport { optional } from ${SCHEMA_IMPORT};\n`
      ),
      [
        "optional:named-import-or-re-export; rename the specifier and its local uses by hand",
        "optional:computed-member-access",
      ]
    );
  });

  it("drops the paired | undefined from a hand-written companion namespace", () => {
    strictEqual(
      rewrite(
        'export class A extends S.Class<A>("A")({ a: S.optional(S.String), b: S.withDecodingDefault(1)(S.Number) }) {}\nexport declare namespace A {\n  export type Encoded = { readonly a?: string | undefined; readonly b?: number | undefined; readonly c?: string | undefined };\n  export type Type = { readonly a?: string | undefined; readonly b: number };\n}\n'
      ),
      'export class A extends S.Class<A>("A")({ a: S.optionalKey(S.String), b: S.withDecodingDefaultKey(1)(S.Number) }) {}\nexport declare namespace A {\n  export type Encoded = { readonly a?: string; readonly b?: number; readonly c?: string | undefined };\n  export type Type = { readonly a?: string; readonly b: number };\n}\n'
    );
  });

  it("drops the paired | undefined from companion interfaces", () => {
    strictEqual(
      rewrite(
        'export class CodeNode extends S.Class<CodeNode>("CodeNode")({ theme: S.OptionFromOptional(S.String) }) {}\nexport declare namespace CodeNode {\n  export interface Type {\n    readonly theme: string;\n  }\n  export interface Encoded {\n    readonly theme?: string | undefined;\n    readonly other?: string | undefined;\n  }\n}\n'
      ),
      'export class CodeNode extends S.Class<CodeNode>("CodeNode")({ theme: S.OptionFromOptionalKey(S.String) }) {}\nexport declare namespace CodeNode {\n  export interface Type {\n    readonly theme: string;\n  }\n  export interface Encoded {\n    readonly theme?: string;\n    readonly other?: string | undefined;\n  }\n}\n'
    );
  });

  it("reports each rewritten site with its facet", () => {
    const outcome = plan(
      "export const A = S.Struct({ a: S.optional(S.String), b: S.OptionFromOptional(S.Number) });\n"
    );
    assertTrue(SchemaParityCodemodFileOutcome.guards.Planned(outcome));
    deepStrictEqual(
      A.map(outcome.plan.sites, (site) => `${site.facet}:${site.line}:${site.before}->${site.after}`),
      ["optional:2:optional->optionalKey", "OptionFromOptional:2:OptionFromOptional->OptionFromOptionalKey"]
    );
  });
});
