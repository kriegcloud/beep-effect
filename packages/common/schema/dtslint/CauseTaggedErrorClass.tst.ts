import { CauseTaggedErrorClass } from "@beep/schema/CauseTaggedErrorClass";
import type { TaggedErrorNewInput } from "@beep/schema/TaggedErrorClass";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

class DomainError extends CauseTaggedErrorClass<DomainError>("DomainError")("DomainError") {}

class OperationError extends CauseTaggedErrorClass<OperationError>("OperationError")("OperationError", {
  operation: S.String,
  retryable: S.Boolean,
}) {}

class OptionalContextError extends CauseTaggedErrorClass<OptionalContextError>("OptionalContextError")(
  "OptionalContextError",
  {
    operation: S.String,
    note: S.optionalKey(S.String),
  }
) {}

class ExtendedOperationError extends OperationError.extend<ExtendedOperationError>("ExtendedOperationError")({
  resource: S.String,
}) {}

const OperationPayload = S.Struct({
  operation: S.String,
});

describe("CauseTaggedErrorClass", () => {
  it("infers no-extra constructor input and helpers", () => {
    expect<TaggedErrorNewInput<typeof DomainError>>().type.toBe<{
      readonly cause: unknown;
      readonly message: string;
    }>();

    expect(DomainError.new(new Error("boom"), "beep")).type.toBe<DomainError>();
    expect(DomainError.new("beep")(new Error("boom"))).type.toBe<DomainError>();

    // @ts-expect-error!
    DomainError.new(new Error("boom"), "beep", {});

    // @ts-expect-error!
    DomainError.new("beep", {});
  });

  it("requires extra fields in constructor helpers", () => {
    expect<TaggedErrorNewInput<typeof OperationError>>().type.toBe<{
      readonly cause: unknown;
      readonly message: string;
      readonly operation: string;
      readonly retryable: boolean;
    }>();

    expect(
      OperationError.new(new Error("boom"), "beep", {
        operation: "load-profile",
        retryable: true,
      })
    ).type.toBe<OperationError>();
    expect(
      OperationError.new("beep", {
        operation: "load-profile",
        retryable: true,
      })(new Error("boom"))
    ).type.toBe<OperationError>();

    // @ts-expect-error!
    OperationError.new(new Error("boom"), "beep");

    // @ts-expect-error!
    OperationError.new("beep")(new Error("boom"));

    // @ts-expect-error!
    OperationError.new(new Error("boom"), "beep", { operation: "load-profile" });
  });

  it("requires the extras object even when every custom property is optional", () => {
    expect(
      OptionalContextError.new(new Error("boom"), "beep", { operation: "load-profile" })
    ).type.toBe<OptionalContextError>();
    expect(
      OptionalContextError.new("beep", { operation: "load-profile" })(new Error("boom"))
    ).type.toBe<OptionalContextError>();

    // @ts-expect-error!
    OptionalContextError.new(new Error("boom"), "beep");
  });

  it("infers mapError data-first and pipe-friendly helpers", () => {
    const raw = Effect.fail("raw failure");

    expect(DomainError.mapError(raw, "beep")).type.toBeAssignableTo<Effect.Effect<never, DomainError>>();
    expect(pipe(raw, DomainError.mapError("beep"))).type.toBeAssignableTo<Effect.Effect<never, DomainError>>();
    expect(
      OperationError.mapError(raw, "beep", {
        operation: "load-profile",
        retryable: true,
      })
    ).type.toBeAssignableTo<Effect.Effect<never, OperationError>>();
    expect(
      pipe(
        raw,
        OperationError.mapError("beep", {
          operation: "load-profile",
          retryable: true,
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<never, OperationError>>();

    // @ts-expect-error!
    const missingExtrasDataFirst: Effect.Effect<never, OperationError> = OperationError.mapError(raw, "beep");
  });

  it("preserves helper typing on extended classes", () => {
    expect(
      ExtendedOperationError.new(new Error("boom"), "beep", {
        operation: "load-profile",
        retryable: true,
        resource: "profile",
      })
    ).type.toBe<ExtendedOperationError>();
    expect(
      pipe(
        Effect.fail("raw failure"),
        ExtendedOperationError.mapError("beep", {
          operation: "load-profile",
          retryable: true,
          resource: "profile",
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<never, ExtendedOperationError>>();

    // @ts-expect-error!
    ExtendedOperationError.new(new Error("boom"), "beep", {
      operation: "load-profile",
      retryable: true,
    });
  });

  it("rejects reserved and schema-object extra fields", () => {
    // @ts-expect-error!
    CauseTaggedErrorClass<never>()("BadMessageError", { message: S.String });

    // @ts-expect-error!
    CauseTaggedErrorClass<never>()("BadCauseError", { cause: S.DefectWithStack });

    // @ts-expect-error!
    CauseTaggedErrorClass<never>()("StructPayloadError", OperationPayload);
  });
});
