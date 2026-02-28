import { MappedLiteralDuplicateError, MappedLiteralKit } from "@beep/schema";
import { describe, expect, it } from "tstyche";

describe("MappedLiteralKit", () => {
  const SqlState = MappedLiteralKit([
    ["SUCCESSFUL_COMPLETION", "00000"],
    ["WARNING", "01000"],
  ] as const);

  it("maps From enum members to their To literals", () => {
    expect(SqlState.From.Enum.SUCCESSFUL_COMPLETION).type.toBe<"00000">();
    expect(SqlState.From.Enum.WARNING).type.toBe<"01000">();
  });

  it("maps To enum members back to From literals", () => {
    expect(SqlState.To.Enum["00000"]).type.toBe<"SUCCESSFUL_COMPLETION">();
    expect(SqlState.To.Enum["01000"]).type.toBe<"WARNING">();
  });

  it("aliases top-level helper surface to From", () => {
    expect(SqlState.Enum.SUCCESSFUL_COMPLETION).type.toBe<"00000">();
    expect<typeof SqlState.Options>().type.toBe<readonly ["SUCCESSFUL_COMPLETION", "WARNING"]>();
    expect(SqlState.is.SUCCESSFUL_COMPLETION).type.toBe<(i: unknown) => i is "SUCCESSFUL_COMPLETION">();
    expect(SqlState.$match).type.toBe<typeof SqlState.From.$match>();
  });

  it("preserves directional options and guards", () => {
    expect<typeof SqlState.From.Options>().type.toBe<readonly ["SUCCESSFUL_COMPLETION", "WARNING"]>();
    expect<typeof SqlState.To.Options>().type.toBe<readonly ["00000", "01000"]>();
    expect(SqlState.To.is["00000"]).type.toBe<(i: unknown) => i is "00000">();
  });

  it("tracks schema Type/Encoded direction", () => {
    expect<typeof SqlState.Type>().type.toBe<"00000" | "01000">();
    expect<typeof SqlState.Encoded>().type.toBe<"SUCCESSFUL_COMPLETION" | "WARNING">();

    expect<typeof SqlState.To.Type>().type.toBe<"SUCCESSFUL_COMPLETION" | "WARNING">();
    expect<typeof SqlState.To.Encoded>().type.toBe<"00000" | "01000">();
  });
});

describe("MappedLiteralDuplicateError", () => {
  it("is constructible with a tagged payload", () => {
    const error = new MappedLiteralDuplicateError({
      side: "from",
      literal: "A",
      firstIndex: 0,
      secondIndex: 1,
    });

    expect<MappedLiteralDuplicateError["_tag"]>().type.toBe<"MappedLiteralDuplicateError">();
    expect<MappedLiteralDuplicateError["side"]>().type.toBe<"from" | "to">();
    expect(error).type.toBeAssignableTo<MappedLiteralDuplicateError>();
  });
});
