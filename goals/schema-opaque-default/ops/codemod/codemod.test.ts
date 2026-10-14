/**
 * Fixture tests for the schema-opaque-default codemod core.
 *
 *   bun test goals/schema-opaque-default/ops/codemod
 */

import { describe, expect, test } from "bun:test";
import { BRAND, BRAND_ALT, runCodemod } from "./codemod.ts";
import type { KeepEntry } from "./codemod.ts";

const header = `import * as S from "effect/Schema";\nimport { $I } from "./id.ts";\n`;

const run = (
  sources: ReadonlyArray<{ readonly file: string; readonly text: string }>,
  options: { readonly keepClass?: ReadonlyArray<KeepEntry>; readonly reverse?: boolean } = {}
) =>
  runCodemod({
    sources,
    packageDirs: new Map([["@fixture/pkg", "packages/pkg"]]),
    keepClass: options.keepClass ?? [],
    reverse: options.reverse ?? false,
    inScope: () => true,
  });

const single = (body: string, file = "packages/pkg/src/a.ts") => {
  const result = run([{ file, text: `${header}${body}` }]);
  return { result, text: result.outputs.find((output) => output.file === file)?.text ?? `${header}${body}` };
};

const squash = (text: string): string => text.replace(/\s+/g, " ").trim();

describe("conversion (D1/D3)", () => {
  test("plain S.Class with $I.annote becomes branded S.Opaque over S.Struct", () => {
    const { text, result } = single(
      `export class A extends S.Class<A>($I\`A\`)({ a: S.String }, $I.annote("A", { description: "d" })) {}\n`
    );
    expect(squash(text)).toContain(
      squash(
        `export class A extends S.Opaque<A, ${BRAND}>()(S.Struct({ a: S.String }).pipe($I.annoteSchema("A", { description: "d" }))) {}`
      )
    );
    expect(result.results[0]?.outcome).toBe("converted-class");
  });

  test("S.TaggedClass becomes S.TaggedStruct and keeps statics verbatim", () => {
    const { text } = single(
      `export class T extends S.TaggedClass<T>($I\`T\`)("T", { a: S.Number }) {\n  static readonly is = S.is(this);\n}\n`
    );
    expect(squash(text)).toContain(
      squash(`S.Opaque<T, ${BRAND}>()(S.TaggedStruct("T", { a: S.Number }).pipe($I.annoteSchema("T")))`)
    );
    expect(text).toContain("static readonly is = S.is(this);");
  });

  test("string identifiers use the module identity composer", () => {
    const { text } = single(`class P extends S.Class<P>("P")({ a: S.String }) {}\n`);
    expect(squash(text)).toContain(squash(`S.Struct({ a: S.String }).pipe($I.annoteSchema("P"))`));
  });

  test("a TaggedClass without an identifier gets the composer identity of the class", () => {
    const { text } = single(`class Q extends S.TaggedClass<Q>()("q", { a: S.String }) {}\n`);
    expect(squash(text)).toContain(squash(`S.TaggedStruct("q", { a: S.String }).pipe($I.annoteSchema("Q"))`));
  });

  test("without an identity composer the class identifier is kept verbatim", () => {
    const file = "packages/pkg/src/b.ts";
    const text = `import * as S from "effect/Schema";\nclass P extends S.Class<P>("P")({ a: S.String }) {}\nclass Q extends S.TaggedClass<Q>()("q", { a: S.String }) {}\n`;
    const out = run([{ file, text }]).outputs[0]?.text ?? "";
    expect(squash(out)).toContain(squash(`S.Struct({ a: S.String }).annotate({ identifier: "P" })`));
    expect(squash(out)).toContain(squash(`S.TaggedStruct("q", { a: S.String }).annotate({ identifier: "q" })`));
  });

  test("an existing annotate({ identifier }) Opaque is normalized to the identity composer", () => {
    const { text } = single(
      `class N extends S.Opaque<N, ${BRAND}>()(S.Struct({ a: S.String }).annotate({ identifier: "N", description: "d" })) {}\n`
    );
    expect(squash(text)).toContain(
      squash(`S.Struct({ a: S.String }).pipe($I.annoteSchema("N", { description: "d" }))`)
    );
  });

  test("a literal _tag field on a plain Class becomes a TaggedStruct source", () => {
    const { text } = single(`class R extends S.Class<R>("R")({ _tag: S.tag("r"), a: S.String }) {}\n`);
    expect(squash(text)).toContain(squash(`S.TaggedStruct("r", { a: S.String })`));
    expect(text).not.toContain("_tag: S.tag");
  });

  test("an existing Struct source is used directly", () => {
    const { text } = single(`const Fields = S.Struct({ a: S.String });\nclass U extends S.Class<U>("U")(Fields) {}\n`);
    expect(squash(text)).toContain(squash(`S.Opaque<U, ${BRAND}>()(Fields.pipe($I.annoteSchema("U")))`));
  });

  test("a brand field switches to the alternate brand key", () => {
    const { text } = single(`class V extends S.Class<V>("V")({ brand: S.String }) {}\n`);
    expect(text).toContain(BRAND_ALT);
  });

  test("comments between the fields and the annotation are preserved", () => {
    const { text } = single(
      `class W extends S.Class<W>("W")(\n  { a: S.String },\n  // keep me\n  { description: "w" }\n) {}\n`
    );
    expect(text).toContain("// keep me");
  });
});

describe("keep as branded class (D2/D6)", () => {
  test("instance members keep the class", () => {
    const { text, result } = single(`class M extends S.Class<M>("M")({ a: S.String }) {\n  get b() { return 1; }\n}\n`);
    expect(text).toContain(`S.Class<M, ${BRAND}>("M")`);
    expect(result.results[0]?.keepReasons).toContain("instance-member");
  });

  test("the effected port's copied tests keep their classes, other scratchpad tests convert", () => {
    const result = run([
      { file: "scratchpad/effected/jsonl/Journal.ts", text: `${header}export const x = 1;\n` },
      {
        file: "scratchpad/test/jsonl/Journal.test.ts",
        text: `${header}class A extends S.Class<A>("A")({ a: S.String }) {}\n`,
      },
      { file: "scratchpad/test/jsonl.test.ts", text: `${header}class B extends S.Class<B>("B")({ a: S.String }) {}\n` },
      {
        file: "scratchpad/test/beep/Other.test.ts",
        text: `${header}class C extends S.Class<C>("C")({ a: S.String }) {}\n`,
      },
    ]);
    const reasons = (name: string) => result.results.find((entry) => entry.name === name)?.keepReasons ?? [];
    expect(reasons("A")).toContain("effected-port");
    expect(reasons("B")).toContain("effected-port");
    expect(result.results.find((entry) => entry.name === "C")?.outcome).toBe("converted-class");
  });

  test("a constructor imported by name gets the brand and stays a class", () => {
    const { text, result } = single(
      `import { Class, TaggedError } from "effect/Schema";\nimport * as S from "effect/Schema";\nclass E extends TaggedError<E>("E")("E", { a: S.String }) {}\nclass C extends Class<C>("C")({ a: S.String }) {}\n`
    );
    expect(text).toContain(`TaggedError<E, ${BRAND}>("E")`);
    expect(text).toContain(`Class<C, ${BRAND}>("C")`);
    expect(result.results.find((entry) => entry.name === "C")?.keepReasons).toContain("named-import");
  });

  test("a static member that reads super keeps the class", () => {
    const source = `class N extends S.Class<N>("N")({ a: S.String }) {\n  static override make(input: { a?: string }) {\n    return super.make({ a: input.a ?? "x" });\n  }\n}\n`;
    const { text, result } = single(source);
    expect(text).toContain(`S.Class<N, ${BRAND}>("N")`);
    expect(result.results[0]?.keepReasons).toContain("static-super");
  });

  test("a static member that reads super reverses an existing Opaque", () => {
    const source = `class P extends S.Opaque<P, ${BRAND}>()(S.Struct({ a: S.String }).annotate({ identifier: "P" })) {\n  static override make(input: { a?: string }) {\n    return super.make({ a: input.a ?? "x" });\n  }\n}\n`;
    const { text, result } = single(source);
    expect(text).toContain("S.Class<P");
    expect(result.results[0]?.keepReasons).toContain("static-super");
  });

  test("a cross-file .extend keeps the root and resolves the relative import", () => {
    const result = run([
      {
        file: "packages/pkg/src/base.ts",
        text: `${header}export class Base extends S.Class<Base>("Base")({ a: S.String }) {}\n`,
      },
      {
        file: "packages/pkg/src/child.ts",
        text: `${header}import { Base } from "./base.ts";\nexport class Child extends Base.extend<Child>("Child")({ b: S.String }) {}\n`,
      },
    ]);
    const base = result.results.find((entry) => entry.name === "Base");
    expect(base?.outcome).toBe("brand-added");
    expect(base?.keepReasons).toContain("extend-root");
  });

  test("new sites and instanceof keep the class and are reported", () => {
    const { result } = single(`class N extends S.Class<N>("N")({ a: S.String }) {}\nconst n = new N({ a: "x" });\n`);
    expect(result.results[0]?.keepReasons).toContain("new-site");
    expect(result.newSites.length).toBe(1);
  });

  test("a same-named external import does not count as a reference", () => {
    const result = run([
      {
        file: "packages/pkg/src/img.ts",
        text: `${header}export class Image extends S.Class<Image>("Image")({ a: S.String }) {}\n`,
      },
      { file: "packages/pkg/src/use.ts", text: `import { Image } from "external-lib";\nconst i = new Image();\n` },
    ]);
    expect(result.results.find((entry) => entry.name === "Image")?.outcome).toBe("converted-class");
  });

  test("scratchpad/effected only gets the brand", () => {
    const { text } = single(`class E extends S.Class<E>("E")({ a: S.String }) {}\n`, "scratchpad/effected/x.ts");
    expect(text).toContain(`S.Class<E, ${BRAND}>("E")`);
  });

  test("errors and Opaque get the brand only", () => {
    const { text } = single(
      `class Err extends S.TaggedError<Err>()("Err", {}) {}\nclass O extends S.Opaque<O>()(S.Struct({})) {}\n`
    );
    expect(text).toContain(`S.TaggedError<Err, ${BRAND}>()`);
    expect(text).toContain(`S.Opaque<O, ${BRAND}>()`);
  });

  test("the keep-class allowlist reverts a converted Opaque", () => {
    const first = single(`export class K extends S.Class<K>($I\`K\`)({ a: S.String }, $I.annote("K")) {}\n`);
    const second = run([{ file: "packages/pkg/src/a.ts", text: first.text }], {
      keepClass: [{ file: "packages/pkg/src/a.ts", class: "K", reason: "test" }],
    });
    const reverted = second.outputs[0]?.text ?? "";
    expect(squash(reverted)).toContain(squash(`S.Class<K, ${BRAND}>($I\`K\`)({ a: S.String }, $I.annote("K"))`));
  });
});

describe("idempotence and generated files", () => {
  test("a second run computes no edits", () => {
    const { text } = single(
      `class A extends S.Class<A>("A")({ a: S.String }) {}\nclass B extends S.TaggedError<B>()("B", {}) {}\n`
    );
    expect(run([{ file: "packages/pkg/src/a.ts", text }]).outputs).toEqual([]);
  });

  test("generated files are skipped", () => {
    const result = run([
      {
        file: "packages/pkg/src/g.ts",
        text: `// This file is generated. Do not edit.\n${header}class G extends S.Class<G>("G")({}) {}\n`,
      },
    ]);
    expect(result.outputs).toEqual([]);
    expect(result.results[0]?.outcome).toBe("skipped-generated");
  });
});

describe("JSDoc examples", () => {
  test("`new X(` in JSDoc becomes `X.make(` once X is an S.Opaque", () => {
    const { text } = single(
      `/**\n * const a = new A({ a: "x" })\n */\nexport class A extends S.Class<A>("A")({ a: S.String }) {}\n`
    );
    expect(text).toContain(`const a = A.make({ a: "x" })`);
  });
});
