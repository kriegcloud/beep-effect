import { logIssues, t } from "@beep/messages";
import * as S from "effect/Schema";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("@beep/messages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns repository translations", () => {
    expect(t("string.mismatch")).toBe("Please enter a valid string");
  });

  it("logs missing-key schema issues with repository messaging", () => {
    const Person = S.Struct({
      name: S.String,
    });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logIssues(Person, {});

    expect(logSpy.mock.calls.map(([value]) => String(value)).join("\n")).toContain("This field is required");
  });

  it("logs min-length schema issues with repository messaging", () => {
    const Person = S.Struct({
      name: S.String.check(S.isMinLength(2)),
    });

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logIssues(Person, { name: "" });

    expect(logSpy.mock.calls.map(([value]) => String(value)).join("\n")).toContain(
      "Please enter at least 2 character(s)"
    );
  });
});
