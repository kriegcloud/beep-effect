import { allowlistPass, parseStatusPorcelain } from "@beep/agent-eval/benchmark/runner";
import { describe, expect, it } from "vitest";

describe("runner allowlist parsing", () => {
  it("shows collapsed parent directory with default porcelain output and fails allowlist", () => {
    const status = "?? apps/\n";
    const parsed = parseStatusPorcelain(status);

    expect(parsed.touchedPaths).toEqual(["apps/"]);
    expect(allowlistPass(parsed.touchedPaths, ["apps/web/src/app/api/chat/route.ts"])).toBe(false);
  });

  it("passes allowlist when porcelain -uall reports concrete file paths", () => {
    const status = "?? apps/web/src/app/api/chat/route.ts\n";
    const parsed = parseStatusPorcelain(status);

    expect(parsed.touchedPaths).toEqual(["apps/web/src/app/api/chat/route.ts"]);
    expect(allowlistPass(parsed.touchedPaths, ["apps/web/src/app/api/chat/route.ts"])).toBe(true);
  });
});
