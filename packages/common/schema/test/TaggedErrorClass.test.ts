import { TaggedErrorClass, type TaggedErrorNewInput } from "@beep/schema/TaggedErrorClass";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

class BeepError extends TaggedErrorClass<BeepError>("BeepError")("BeepError", {
  beep: S.String,
}) {}

const BeepPayload = S.Struct({
  beep: S.String,
  count: S.Number,
});

class StructuredBeepError extends TaggedErrorClass<StructuredBeepError>("StructuredBeepError")(
  "StructuredBeepError",
  BeepPayload
) {}

class RequiredCauseError extends TaggedErrorClass<RequiredCauseError>("RequiredCauseError")("RequiredCauseError", {
  cause: S.DefectWithStack,
  message: S.String,
}) {}

class OptionalCauseError extends TaggedErrorClass<OptionalCauseError>("OptionalCauseError")("OptionalCauseError", {
  cause: S.optional(S.DefectWithStack),
  message: S.String,
}) {}

class ExtendedBeepError extends BeepError.extend<ExtendedBeepError>("ExtendedBeepError")({
  count: S.Number,
}) {}

class ExtendedCauseError extends BeepError.extend<ExtendedCauseError>("ExtendedCauseError")({
  cause: S.DefectWithStack,
  count: S.Number,
}) {}

describe("TaggedErrorClass", () => {
  it("creates tagged instances via the constructor", () => {
    const error = new BeepError({ beep: "beep" });

    expect(error).toBeInstanceOf(BeepError);
    expect(error._tag).toBe("BeepError");
    expect(error.beep).toBe("beep");
  });

  it("supports struct-schema overloads via the constructor", () => {
    const error = new StructuredBeepError({ beep: "boop", count: 2 });

    expect(error).toBeInstanceOf(StructuredBeepError);
    expect(error._tag).toBe("StructuredBeepError");
    expect(error.beep).toBe("boop");
    expect(error.count).toBe(2);
  });

  it("validates constructor payloads eagerly", () => {
    const invalid: unknown = { beep: "boop", count: "wrong" };

    expect(() => new StructuredBeepError(invalid as TaggedErrorNewInput<typeof StructuredBeepError>)).toThrow();
  });

  it("constructs cause-bearing errors from explicit payloads", () => {
    const cause = new Error("kapow");
    const required = new RequiredCauseError({ cause, message: "boom" });
    const optional = new OptionalCauseError({ cause, message: "boom" });

    expect(required).toBeInstanceOf(RequiredCauseError);
    expect(required.cause).toBe(cause);
    expect(required.message).toBe("boom");
    expect(optional).toBeInstanceOf(OptionalCauseError);
    expect(optional.cause).toBe(cause);
    expect(optional.message).toBe("boom");
  });

  it("supports optional-cause payloads", () => {
    const error = new OptionalCauseError({ message: "boom" });

    expect(error).toBeInstanceOf(OptionalCauseError);
    expect(error.message).toBe("boom");
    expect(error.cause).toBeUndefined();
  });

  it("extends tagged errors with inherited fields", () => {
    const error = new ExtendedBeepError({ beep: "boop", count: 2 });

    expect(error).toBeInstanceOf(BeepError);
    expect(error).toBeInstanceOf(ExtendedBeepError);
    expect(error._tag).toBe("BeepError");
    expect(error.name).toBe("ExtendedBeepError");
    expect(error.beep).toBe("boop");
    expect(error.count).toBe(2);
  });

  it("keeps constructor payload validation for extended cause-bearing errors", () => {
    const cause = new Error("kapow");
    const error = new ExtendedCauseError({ cause, beep: "boop", count: 2 });

    expect(error).toBeInstanceOf(BeepError);
    expect(error).toBeInstanceOf(ExtendedCauseError);
    expect(error._tag).toBe("BeepError");
    expect(error.name).toBe("ExtendedCauseError");
    expect(error.cause).toBe(cause);
    expect(error.beep).toBe("boop");
    expect(error.count).toBe(2);
  });
});
