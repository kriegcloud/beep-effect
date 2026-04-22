import { leafHook, logIssues, t } from "@beep/messages";
import { Option, SchemaIssue } from "effect";
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

  it("formats each leaf issue variant with repository messaging", () => {
    const UnionAst = S.Union([S.String, S.Number]).ast as SchemaIssue.OneOf["ast"];

    expect(leafHook(new SchemaIssue.InvalidType(S.String.ast, Option.some(1)))).toBe("Please enter a valid string");
    expect(leafHook(new SchemaIssue.InvalidType(S.Struct({}).ast, Option.some(null)))).toBe(
      "Please enter a valid object"
    );
    expect(leafHook(new SchemaIssue.InvalidType(S.Number.ast, Option.some("nope")))).toBe("Invalid type");
    expect(leafHook(new SchemaIssue.InvalidValue(Option.some("nope")))).toBe("Invalid value");
    expect(leafHook(new SchemaIssue.UnexpectedKey(S.Struct({}).ast, "extra"))).toBe("Unexpected field");
    expect(leafHook(new SchemaIssue.Forbidden(Option.none(), undefined))).toBe("Forbidden operation");
    expect(leafHook(new SchemaIssue.OneOf(UnionAst, "nope", []))).toBe("Too many successful values");
  });
});
