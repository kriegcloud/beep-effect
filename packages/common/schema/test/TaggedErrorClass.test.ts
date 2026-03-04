import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
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

    const thunk = StructuredBeepError.newThunk(invalid);

    expect(() => thunk()).toThrow();
  });
});
