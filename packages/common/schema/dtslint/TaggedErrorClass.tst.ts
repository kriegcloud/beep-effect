import {
  TaggedErrorClass,
  type TaggedErrorClassWithNew,
  type TaggedErrorNewInput,
} from "@beep/schema/TaggedErrorClass";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

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
  it("infers new input from schema fields (without _tag)", () => {
    expect<TaggedErrorNewInput<typeof BeepError>>().type.toBe<{ readonly beep: string }>();

    expect(BeepError).type.toBeAssignableTo<TaggedErrorClassWithNew<typeof BeepError>>();
    expect(BeepError.new).type.toBe<(input: { readonly beep: string }) => BeepError>();
    expect(BeepError.new({ beep: "beep" })).type.toBe<BeepError>();

    // @ts-expect-error!
    BeepError.new({});

    // @ts-expect-error!
    BeepError.new({ beep: 1 });

    // @ts-expect-error!
    BeepError.new({ _tag: "BeepError", beep: "beep" });
  });

  it("types newThunk as a thunk returning the error instance", () => {
    const thunk = BeepError.newThunk({ beep: "beep" });

    expect(thunk).type.toBe<() => BeepError>();
    expect(thunk()).type.toBe<BeepError>();
  });

  it("supports schema overload and infers all fields", () => {
    expect<TaggedErrorNewInput<typeof StructuredBeepError>>().type.toBe<{
      readonly beep: string;
      readonly count: number;
    }>();

    expect(StructuredBeepError.new).type.toBe<
      (input: { readonly beep: string; readonly count: number }) => StructuredBeepError
    >();

    expect(StructuredBeepError.new({ beep: "beep", count: 1 })).type.toBe<StructuredBeepError>();

    // @ts-expect-error!
    StructuredBeepError.new({ beep: "beep" });

    // @ts-expect-error!
    StructuredBeepError.new({ beep: "beep", count: "1" });
  });

  it("supports cause-first overloads for cause-bearing errors", () => {
    expect(RequiredCauseError.new(new Error("boom"), { message: "beep" })).type.toBe<RequiredCauseError>();
    expect(OptionalCauseError.new(new Error("boom"), { message: "beep" })).type.toBe<OptionalCauseError>();

    expect(RequiredCauseError.newThunk(new Error("boom"), { message: "beep" })()).type.toBe<RequiredCauseError>();
    expect(OptionalCauseError.newThunk(new Error("boom"), { message: "beep" })()).type.toBe<OptionalCauseError>();
  });

  it("supports required-cause data-last overloads only", () => {
    expect(RequiredCauseError.new({ message: "beep" })(new Error("boom"))).type.toBe<RequiredCauseError>();
    expect(RequiredCauseError.newThunk({ message: "beep" })(new Error("boom"))()).type.toBe<RequiredCauseError>();

    expect(OptionalCauseError.new({ message: "beep" })).type.toBe<OptionalCauseError>();
    expect(OptionalCauseError.newThunk({ message: "beep" })()).type.toBe<OptionalCauseError>();

    // @ts-expect-error!
    OptionalCauseError.new({ message: "beep" })(new Error("boom"));

    // @ts-expect-error!
    OptionalCauseError.newThunk({ message: "beep" })(new Error("boom"));
  });
});
