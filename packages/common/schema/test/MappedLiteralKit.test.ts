import { MappedLiteralDuplicateError, MappedLiteralKit } from "@beep/schema/MappedLiteralKit";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("MappedLiteralKit", () => {
  const SqlState = MappedLiteralKit([
    ["SUCCESSFUL_COMPLETION", "00000"],
    ["WARNING", "01000"],
  ] as const);

  it("decodes From literals into To literals", () => {
    expect(S.decodeSync(SqlState)("SUCCESSFUL_COMPLETION")).toBe("00000");
    expect(S.decodeSync(SqlState)("WARNING")).toBe("01000");
  });

  it("encodes To literals back into From literals", () => {
    expect(S.encodeSync(SqlState)("00000")).toBe("SUCCESSFUL_COMPLETION");
    expect(S.encodeSync(SqlState)("01000")).toBe("WARNING");
  });

  it("exposes directional enum maps", () => {
    expect(SqlState.From.Enum.SUCCESSFUL_COMPLETION).toBe("00000");
    expect(SqlState.From.Enum.WARNING).toBe("01000");
    expect(SqlState.To.Enum["00000"]).toBe("SUCCESSFUL_COMPLETION");
    expect(SqlState.To.Enum["01000"]).toBe("WARNING");
  });

  it("aliases top-level helper surface to From", () => {
    expect(SqlState.From).toBe(SqlState);
    expect(SqlState.Enum.SUCCESSFUL_COMPLETION).toBe("00000");
    expect(SqlState.Options).toEqual(["SUCCESSFUL_COMPLETION", "WARNING"]);
    expect(SqlState.is.SUCCESSFUL_COMPLETION("SUCCESSFUL_COMPLETION")).toBe(true);
    expect(SqlState.is.SUCCESSFUL_COMPLETION("WARNING")).toBe(false);
  });

  it("retains LiteralKit helper behavior on directional kits", () => {
    expect(SqlState.pickOptions(["WARNING"] as const)).toEqual(["WARNING"]);
    expect(SqlState.To.pickOptions(["01000"] as const)).toEqual(["01000"]);

    expect(SqlState.omitOptions(["WARNING"] as const)).toEqual(["SUCCESSFUL_COMPLETION"]);
    expect(SqlState.To.omitOptions(["01000"] as const)).toEqual(["00000"]);

    const fromMatch = SqlState.$match("SUCCESSFUL_COMPLETION", {
      SUCCESSFUL_COMPLETION: () => "ok" as const,
      WARNING: () => "warn" as const,
    });
    expect(fromMatch).toBe("ok");

    const toMatch = SqlState.To.$match("00000", {
      "00000": () => "ok-code" as const,
      "01000": () => "warn-code" as const,
    });
    expect(toMatch).toBe("ok-code");
  });

  it("decodes and encodes on the reverse directional kit", () => {
    expect(S.decodeSync(SqlState.To)("00000")).toBe("SUCCESSFUL_COMPLETION");
    expect(S.encodeSync(SqlState.To)("SUCCESSFUL_COMPLETION")).toBe("00000");
  });

  it("rejects duplicate from-side literals", () => {
    expect(() =>
      MappedLiteralKit([
        ["A", "00000"],
        ["A", "01000"],
      ] as const)
    ).toThrow(MappedLiteralDuplicateError);
  });

  it("rejects duplicate to-side literals", () => {
    expect(() =>
      MappedLiteralKit([
        ["A", "00000"],
        ["B", "00000"],
      ] as const)
    ).toThrow(MappedLiteralDuplicateError);
  });
});
