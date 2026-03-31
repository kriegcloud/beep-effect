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

describe("TaggedErrorClass", () => {
  it("creates tagged instances via new", () => {
    const error = BeepError.new({ beep: "beep" });

    expect(error).toBeInstanceOf(BeepError);
    expect(error._tag).toBe("BeepError");
    expect(error.beep).toBe("beep");
  });

  it("creates thunked constructors via newThunk", () => {
    const thunk = BeepError.newThunk({ beep: "beep" });
    const error = thunk();

    expect(typeof thunk).toBe("function");
    expect(error).toBeInstanceOf(BeepError);
    expect(error._tag).toBe("BeepError");
    expect(error.beep).toBe("beep");
  });

  it("supports struct-schema overload for new", () => {
    const error = StructuredBeepError.new({ beep: "boop", count: 2 });

    expect(error).toBeInstanceOf(StructuredBeepError);
    expect(error._tag).toBe("StructuredBeepError");
    expect(error.beep).toBe("boop");
    expect(error.count).toBe(2);
  });

  it("defers schema validation in newThunk until thunk execution", () => {
    const invalid: unknown = { beep: "boop", count: "wrong" };

    const thunk = StructuredBeepError.newThunk(invalid as TaggedErrorNewInput<typeof StructuredBeepError>);

    expect(() => thunk()).toThrow();
  });

  it("supports cause-first new for required causes", () => {
    const cause = new Error("kapow");
    const error = RequiredCauseError.new(cause, { message: "boom" });

    expect(error).toBeInstanceOf(RequiredCauseError);
    expect(error.cause).toBe(cause);
    expect(error.message).toBe("boom");
  });

  it("supports data-last new when cause is required", () => {
    const cause = new Error("kapow");
    const fromCause = RequiredCauseError.new({ message: "boom" });
    const error = fromCause(cause);

    expect(typeof fromCause).toBe("function");
    expect(error).toBeInstanceOf(RequiredCauseError);
    expect(error.cause).toBe(cause);
    expect(error.message).toBe("boom");
  });

  it("keeps explicit required-cause payloads eager", () => {
    const cause = new Error("kapow");
    const error = RequiredCauseError.new({ cause, message: "boom" });

    expect(error).toBeInstanceOf(RequiredCauseError);
    expect(error.cause).toBe(cause);
    expect(error.message).toBe("boom");
  });

  it("preserves eager new for optional-cause payloads", () => {
    const error = OptionalCauseError.new({ message: "boom" });

    expect(error).toBeInstanceOf(OptionalCauseError);
    expect(error.message).toBe("boom");
    expect(error.cause).toBeUndefined();
  });

  it("supports cause-first newThunk for optional causes", () => {
    const cause = new Error("kapow");
    const thunk = OptionalCauseError.newThunk(cause, { message: "boom" });
    const error = thunk();

    expect(error).toBeInstanceOf(OptionalCauseError);
    expect(error.message).toBe("boom");
    expect(error.cause).toBe(cause);
  });

  it("supports data-last newThunk when cause is required", () => {
    const cause = new Error("kapow");
    const fromCause = RequiredCauseError.newThunk({ message: "boom" });
    const thunk = fromCause(cause);
    const error = thunk();

    expect(typeof fromCause).toBe("function");
    expect(typeof thunk).toBe("function");
    expect(error).toBeInstanceOf(RequiredCauseError);
    expect(error.cause).toBe(cause);
    expect(error.message).toBe("boom");
  });
});
