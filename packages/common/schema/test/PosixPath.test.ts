import { normalizePath, PosixPath } from "@beep/schema/PosixPath";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("PosixPath", () => {
  it("normalizes native separators during decode", () => {
    expect(normalizePath("packages\\common\\schema")).toBe("packages/common/schema");
  });

  it("accepts already normalized paths", () => {
    expect(S.decodeUnknownSync(PosixPath)("packages/common/schema")).toBe("packages/common/schema");
  });

  it("rejects paths that still contain backslashes", () => {
    expect(() => S.decodeUnknownSync(PosixPath)("packages\\common\\schema")).toThrow("Expected a string matching");
  });
});
