import { describe, expect, it } from "vitest";
import { detectWrongApis } from "../src/effect-v4-detector/index.js";

describe("effect-v4 detector", () => {
  it("detects v3 Context.Tag usage", () => {
    const report = detectWrongApis("const X = Context.Tag(\"X\")");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("detects Effect.catchAll usage", () => {
    const report = detectWrongApis("Effect.catchAll(program, handler)");
    expect(report.criticalCount).toBeGreaterThan(0);
  });

  it("returns zero on safe v4 snippet", () => {
    const report = detectWrongApis("class X extends ServiceMap.Service<X, {}>()(\"x\") {}");
    expect(report.criticalCount).toBe(0);
  });
});
