import { StatusCauseTaggedErrorClass } from "@beep/schema/StatusCauseTaggedErrorClass";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

class HttpError extends StatusCauseTaggedErrorClass<HttpError>("HttpError")("HttpError") {}

class ProviderError extends StatusCauseTaggedErrorClass<ProviderError>("ProviderError")("ProviderError", {
  provider: S.String,
  retryable: S.Boolean,
}) {}

class OptionalContextError extends StatusCauseTaggedErrorClass<OptionalContextError>("OptionalContextError")(
  "OptionalContextError",
  {
    provider: S.String,
    note: S.optionalKey(S.String),
  }
) {}

class ExtendedProviderError extends ProviderError.extend<ExtendedProviderError>("ExtendedProviderError")({
  operation: S.String,
}) {}

const ProviderPayload = S.Struct({
  provider: S.String,
});

describe("StatusCauseTaggedErrorClass", () => {
  it("infers no-extra constructor helpers", () => {
    expect(HttpError.new(new Error("boom"), "beep", 500)).type.toBe<HttpError>();
    expect(HttpError.new("beep", 500)(new Error("boom"))).type.toBe<HttpError>();
    expect(HttpError.new(undefined, "beep", 500)).type.toBe<HttpError>();
    expect(HttpError.noCause("beep", 500)).type.toBe<HttpError>();

    // @ts-expect-error!
    HttpError.new(new Error("boom"), "beep");

    // @ts-expect-error!
    HttpError.new("beep");

    // @ts-expect-error!
    HttpError.new(new Error("boom"), "beep", 500, {});
  });

  it("requires extra fields in constructor helpers", () => {
    expect(
      ProviderError.new(new Error("boom"), "beep", 502, {
        provider: "local",
        retryable: true,
      })
    ).type.toBe<ProviderError>();
    expect(
      ProviderError.new("beep", 502, {
        provider: "local",
        retryable: true,
      })(new Error("boom"))
    ).type.toBe<ProviderError>();
    expect(
      ProviderError.noCause("beep", 502, {
        provider: "local",
        retryable: true,
      })
    ).type.toBe<ProviderError>();

    // @ts-expect-error!
    ProviderError.new(new Error("boom"), "beep", 502);

    // @ts-expect-error!
    ProviderError.new("beep", 502)(new Error("boom"));

    // @ts-expect-error!
    ProviderError.new(new Error("boom"), "beep", 502, { provider: "local" });

    // @ts-expect-error!
    ProviderError.noCause("beep", 502);
  });

  it("requires the extras object even when every custom property is optional", () => {
    expect(
      OptionalContextError.new(new Error("boom"), "beep", 502, { provider: "local" })
    ).type.toBe<OptionalContextError>();
    expect(
      OptionalContextError.new("beep", 502, { provider: "local" })(new Error("boom"))
    ).type.toBe<OptionalContextError>();

    // @ts-expect-error!
    OptionalContextError.new(new Error("boom"), "beep", 502);
  });

  it("infers mapError data-first and pipe-friendly helpers", () => {
    const raw = Effect.fail("raw failure");

    expect(HttpError.mapError(raw, "beep", 500)).type.toBeAssignableTo<Effect.Effect<never, HttpError>>();
    expect(pipe(raw, HttpError.mapError("beep", 500))).type.toBeAssignableTo<Effect.Effect<never, HttpError>>();
    expect(
      ProviderError.mapError(raw, "beep", 502, {
        provider: "local",
        retryable: true,
      })
    ).type.toBeAssignableTo<Effect.Effect<never, ProviderError>>();
    expect(
      pipe(
        raw,
        ProviderError.mapError("beep", 502, {
          provider: "local",
          retryable: true,
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<never, ProviderError>>();

    // @ts-expect-error!
    const missingExtrasDataFirst: Effect.Effect<never, ProviderError> = ProviderError.mapError(raw, "beep", 502);

    void missingExtrasDataFirst;
  });

  it("preserves helper typing on extended classes", () => {
    expect(
      ExtendedProviderError.new(new Error("boom"), "beep", 502, {
        provider: "local",
        retryable: true,
        operation: "capture",
      })
    ).type.toBe<ExtendedProviderError>();
    expect(
      pipe(
        Effect.fail("raw failure"),
        ExtendedProviderError.mapError("beep", 502, {
          provider: "local",
          retryable: true,
          operation: "capture",
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<never, ExtendedProviderError>>();

    // @ts-expect-error!
    ExtendedProviderError.new(new Error("boom"), "beep", 502, {
      provider: "local",
      retryable: true,
    });
  });

  it("rejects reserved and schema-object extra fields", () => {
    // @ts-expect-error!
    StatusCauseTaggedErrorClass<never>()("BadMessageError", { message: S.String });

    // @ts-expect-error!
    StatusCauseTaggedErrorClass<never>()("BadStatusError", { status: S.Number });

    // @ts-expect-error!
    StatusCauseTaggedErrorClass<never>()("BadCauseError", { cause: S.DefectWithStack });

    // @ts-expect-error!
    StatusCauseTaggedErrorClass<never>()("StructPayloadError", ProviderPayload);
  });
});
