import { TaggedErrorClass, type TaggedErrorNewInput } from "@beep/schema/TaggedErrorClass";
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

class ExtendedBeepError extends BeepError.extend<ExtendedBeepError>("ExtendedBeepError")({
  count: S.Number,
}) {}

class ExtendedCauseError extends BeepError.extend<ExtendedCauseError>("ExtendedCauseError")({
  cause: S.DefectWithStack,
  count: S.Number,
}) {}

describe("TaggedErrorClass", () => {
  it("infers constructor input from schema fields (without _tag)", () => {
    expect<TaggedErrorNewInput<typeof BeepError>>().type.toBe<{ readonly beep: string }>();

    expect(BeepError).type.toBeAssignableTo<new (input: { readonly beep: string }) => BeepError>();
    expect(new BeepError({ beep: "beep" })).type.toBe<BeepError>();

    // @ts-expect-error!
    new BeepError({});

    // @ts-expect-error!
    new BeepError({ beep: 1 });
  });

  it("supports schema overload and infers all fields", () => {
    expect<TaggedErrorNewInput<typeof StructuredBeepError>>().type.toBe<{
      readonly beep: string;
      readonly count: number;
    }>();

    expect(StructuredBeepError).type.toBeAssignableTo<
      new (input: {
        readonly beep: string;
        readonly count: number;
      }) => StructuredBeepError
    >();
    expect(new StructuredBeepError({ beep: "beep", count: 1 })).type.toBe<StructuredBeepError>();

    // @ts-expect-error!
    new StructuredBeepError({ beep: "beep" });

    // @ts-expect-error!
    new StructuredBeepError({ beep: "beep", count: "1" });
  });

  it("requires cause-bearing constructor payloads to be explicit", () => {
    expect(new RequiredCauseError({ cause: new Error("boom"), message: "beep" })).type.toBe<RequiredCauseError>();
    expect(new OptionalCauseError({ cause: new Error("boom"), message: "beep" })).type.toBe<OptionalCauseError>();
    expect(new OptionalCauseError({ message: "beep" })).type.toBe<OptionalCauseError>();

    // @ts-expect-error!
    new RequiredCauseError({ message: "beep" });
  });

  it("preserves constructor typing across extend", () => {
    expect<TaggedErrorNewInput<typeof ExtendedBeepError>>().type.toBe<{
      readonly beep: string;
      readonly count: number;
    }>();

    expect(ExtendedBeepError).type.toBeAssignableTo<
      new (input: {
        readonly beep: string;
        readonly count: number;
      }) => ExtendedBeepError
    >();
    expect(new ExtendedBeepError({ beep: "beep", count: 1 })).type.toBe<ExtendedBeepError>();

    // @ts-expect-error!
    new ExtendedBeepError({ beep: "beep" });
  });

  it("preserves cause-bearing constructor typing for extended classes", () => {
    expect(
      new ExtendedCauseError({ cause: new Error("boom"), beep: "beep", count: 1 })
    ).type.toBe<ExtendedCauseError>();

    // @ts-expect-error!
    new ExtendedCauseError({ beep: "beep" });
  });
});
