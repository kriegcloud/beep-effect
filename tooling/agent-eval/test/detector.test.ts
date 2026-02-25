import { describe, expect, it } from "vitest";
import { detectEffectComplianceViolations, detectWrongApis } from "../src/effect-v4-detector/index.js";

describe("effect-v4 detector", () => {
  it("detects v3 Context.Tag usage", () => {
    const report = detectWrongApis('const X = Context.Tag("X")');
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects Context.GenericTag usage", () => {
    const report = detectWrongApis('const X = Context.GenericTag<{}>("X")');
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects Effect.catchAll usage", () => {
    const report = detectWrongApis("Effect.catchAll(program, handler)");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects deprecated @effect/schema imports", () => {
    const report = detectWrongApis("import * as S from '@effect/schema/Schema'");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects wrong module path imports", () => {
    const report = detectWrongApis("import * as FileSystem from '@effect/platform/FileSystem'");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("returns zero on safe v4 snippet", () => {
    const report = detectWrongApis(
      'class X extends ServiceMap.Service<X, {}>()("x") {}\nEffect.catch(self, (_) => self)'
    );
    expect(report.criticalCount).toBe(0);
  });

  it("detects native Date.now usage in compliance scan", () => {
    const report = detectEffectComplianceViolations("const now = Date.now()");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects node core fs/path imports in compliance scan", () => {
    const report = detectEffectComplianceViolations('import * as fs from "node:fs"');
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects native array chain usage in compliance scan", () => {
    const report = detectEffectComplianceViolations("const values = users.map((user) => user.id)");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects JSON.parse / JSON.stringify usage in compliance scan", () => {
    const report = detectEffectComplianceViolations("const payload = JSON.parse(body); return JSON.stringify(payload)");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects S.Union([...S.Literal]) usage in compliance scan", () => {
    const report = detectEffectComplianceViolations('const schema = S.Union([S.Literal("one"), S.Literal("two")])');
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects native Error and try/catch usage in compliance scan", () => {
    const report = detectEffectComplianceViolations(
      "try {\n  doThing()\n} catch (error) {\n  throw new Error(String(error))\n}"
    );
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects nullable unions, null initializers, type assertions, and non-null assertions", () => {
    const report = detectEffectComplianceViolations(
      "let value: string | null = null\nconst forced = maybeValue as string\nconst out = forced!.trim()"
    );
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("does not flag Effect namespace combinators in compliance scan", () => {
    const report = detectEffectComplianceViolations("const next = Effect.map(program, identity)");
    expect(report.criticalCount).toBe(0);
  });

  it("does not flag compliant schema and typed-effect patterns", () => {
    const report = detectEffectComplianceViolations(
      'const schema = S.Literals(["one", "two"])\nconst safe = Effect.try(() => decode(input))'
    );
    expect(report.criticalCount).toBe(0);
  });
});
