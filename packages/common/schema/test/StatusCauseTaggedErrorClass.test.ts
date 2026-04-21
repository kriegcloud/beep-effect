import { StatusCauseTaggedErrorClass } from "@beep/schema/StatusCauseTaggedErrorClass";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option as O, pipe } from "effect";
import * as S from "effect/Schema";

class HttpError extends StatusCauseTaggedErrorClass<HttpError>("HttpError")("HttpError") {}

class ProviderError extends StatusCauseTaggedErrorClass<ProviderError>("ProviderError")("ProviderError", {
  provider: S.String,
}) {}

class ExtendedProviderError extends ProviderError.extend<ExtendedProviderError>("ExtendedProviderError")({
  operation: S.String,
}) {}

describe("StatusCauseTaggedErrorClass", () => {
  it("constructs no-extra errors in data-first cause form", () => {
    const cause = new Error("kapow");
    const error = HttpError.new(cause, "boom", 500);

    expect(error).toBeInstanceOf(HttpError);
    expect(S.is(HttpError)(error)).toBe(true);
    expect(error._tag).toBe("HttpError");
    expect(error.message).toBe("boom");
    expect(error.status).toBe(500);
    expect(O.isSome(error.cause)).toBe(true);
  });

  it("constructs no-extra errors in cause-last form", () => {
    const cause = new Error("kapow");
    const error = HttpError.new("boom", 500)(cause);

    expect(error).toBeInstanceOf(HttpError);
    expect(S.is(HttpError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(500);
    expect(O.isSome(error.cause)).toBe(true);
  });

  it("constructs no-cause errors with an explicit undefined cause", () => {
    const error = HttpError.new(undefined, "boom", 500);

    expect(error).toBeInstanceOf(HttpError);
    expect(S.is(HttpError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(500);
    expect(O.isNone(error.cause)).toBe(true);
  });

  it("constructs no-cause errors with the noCause helper", () => {
    const error = HttpError.noCause("boom", 500);

    expect(error).toBeInstanceOf(HttpError);
    expect(S.is(HttpError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(500);
    expect(O.isNone(error.cause)).toBe(true);
  });

  it("constructs extra-field errors in data-first cause form", () => {
    const cause = new Error("kapow");
    const error = ProviderError.new(cause, "boom", 502, { provider: "local" });

    expect(error).toBeInstanceOf(ProviderError);
    expect(S.is(ProviderError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(502);
    expect(error.provider).toBe("local");
    expect(O.isSome(error.cause)).toBe(true);
  });

  it("constructs extra-field errors in cause-last form", () => {
    const cause = new Error("kapow");
    const error = ProviderError.new("boom", 502, { provider: "local" })(cause);

    expect(error).toBeInstanceOf(ProviderError);
    expect(S.is(ProviderError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(502);
    expect(error.provider).toBe("local");
    expect(O.isSome(error.cause)).toBe(true);
  });

  it("constructs extra-field no-cause errors with the noCause helper", () => {
    const error = ProviderError.noCause("boom", 502, { provider: "local" });

    expect(error).toBeInstanceOf(ProviderError);
    expect(S.is(ProviderError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.status).toBe(502);
    expect(error.provider).toBe("local");
    expect(O.isNone(error.cause)).toBe(true);
  });

  it.effect("maps errors in data-first form", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(HttpError.mapError(Effect.fail(new Error("raw failure")), "boom", 500));

      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe("boom");
      expect(error.status).toBe(500);
      expect(O.isSome(error.cause)).toBe(true);
    })
  );

  it.effect("maps errors in pipe-friendly form", () =>
    Effect.gen(function* () {
      const error = yield* pipe(Effect.fail(new Error("raw failure")), HttpError.mapError("boom", 500), Effect.flip);

      expect(error).toBeInstanceOf(HttpError);
      expect(error.message).toBe("boom");
      expect(error.status).toBe(500);
      expect(O.isSome(error.cause)).toBe(true);
    })
  );

  it.effect("maps extra-field errors in pipe-friendly form", () =>
    Effect.gen(function* () {
      const error = yield* pipe(
        Effect.fail(new Error("raw failure")),
        ProviderError.mapError("boom", 502, { provider: "local" }),
        Effect.flip
      );

      expect(error).toBeInstanceOf(ProviderError);
      expect(error.message).toBe("boom");
      expect(error.status).toBe(502);
      expect(error.provider).toBe("local");
      expect(O.isSome(error.cause)).toBe(true);
    })
  );

  it.effect("maps extra-field errors in data-first form", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        ProviderError.mapError(Effect.fail(new Error("raw failure")), "boom", 502, { provider: "local" })
      );

      expect(error).toBeInstanceOf(ProviderError);
      expect(error.message).toBe("boom");
      expect(error.status).toBe(502);
      expect(error.provider).toBe("local");
      expect(O.isSome(error.cause)).toBe(true);
    })
  );

  it("validates extras through the generated schema", () => {
    const makeInvalid = ProviderError.new as (
      cause: unknown,
      message: string,
      status: number,
      extras: { readonly provider: unknown }
    ) => ProviderError;

    expect(() => makeInvalid(new Error("kapow"), "boom", 502, { provider: 1 })).toThrow();
  });

  it("reattaches helpers when extending status-cause tagged errors", () => {
    const cause = new Error("kapow");
    const error = ExtendedProviderError.new(cause, "boom", 502, {
      provider: "local",
      operation: "capture",
    });

    expect(error).toBeInstanceOf(ProviderError);
    expect(error).toBeInstanceOf(ExtendedProviderError);
    expect(error.name).toBe("ExtendedProviderError");
    expect(error.message).toBe("boom");
    expect(error.status).toBe(502);
    expect(error.provider).toBe("local");
    expect(error.operation).toBe("capture");
    expect(O.isSome(error.cause)).toBe(true);
  });
});
