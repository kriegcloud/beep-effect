import { Effect } from "effect";
import { describe, expect, it } from "vitest";

describe("md-typecheck", () => {
  it("all markdown code blocks typecheck", { timeout: 120_000 }, async () => {
    const { mdTypecheckExitCode } = await import("../scripts/md-typecheck.ts");
    const exitCode = await Effect.runPromise(mdTypecheckExitCode);
    expect(exitCode, "md-typecheck failed").toBe(0);
  });
});
