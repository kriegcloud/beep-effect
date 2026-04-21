import { CauseTaggedErrorClass } from "@beep/schema/CauseTaggedErrorClass";
import { describe, expect, it } from "@effect/vitest";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";

class DomainError extends CauseTaggedErrorClass<DomainError>("DomainError")("DomainError") {}

class OperationError extends CauseTaggedErrorClass<OperationError>("OperationError")("OperationError", {
  operation: S.String,
}) {}

class ExtendedOperationError extends OperationError.extend<ExtendedOperationError>("ExtendedOperationError")({
  resource: S.String,
}) {}

describe("CauseTaggedErrorClass", () => {
  it("constructs no-extra errors in data-first form", () => {
    const cause = new Error("kapow");
    const error = DomainError.new(cause, "boom");

    expect(error).toBeInstanceOf(DomainError);
    expect(S.is(DomainError)(error)).toBe(true);
    expect(error._tag).toBe("DomainError");
    expect(error.message).toBe("boom");
    expect(error.cause).toBe(cause);
  });

  it("constructs no-extra errors in cause-last form", () => {
    const cause = new Error("kapow");
    const error = DomainError.new("boom")(cause);

    expect(error).toBeInstanceOf(DomainError);
    expect(S.is(DomainError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.cause).toBe(cause);
  });

  it("constructs extra-field errors in data-first form", () => {
    const cause = new Error("kapow");
    const error = OperationError.new(cause, "boom", { operation: "load-profile" });

    expect(error).toBeInstanceOf(OperationError);
    expect(S.is(OperationError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.cause).toBe(cause);
    expect(error.operation).toBe("load-profile");
  });

  it("constructs extra-field errors in cause-last form", () => {
    const cause = new Error("kapow");
    const error = OperationError.new("boom", { operation: "load-profile" })(cause);

    expect(error).toBeInstanceOf(OperationError);
    expect(S.is(OperationError)(error)).toBe(true);
    expect(error.message).toBe("boom");
    expect(error.cause).toBe(cause);
    expect(error.operation).toBe("load-profile");
  });

  it.effect("maps errors in data-first form", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(DomainError.mapError(Effect.fail("raw failure"), "boom"));

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe("boom");
      expect(error.cause).toBe("raw failure");
    })
  );

  it.effect("maps errors in pipe-friendly form", () =>
    Effect.gen(function* () {
      const error = yield* pipe(Effect.fail("raw failure"), DomainError.mapError("boom"), Effect.flip);

      expect(error).toBeInstanceOf(DomainError);
      expect(error.message).toBe("boom");
      expect(error.cause).toBe("raw failure");
    })
  );

  it.effect("maps extra-field errors in data-first form", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        OperationError.mapError(Effect.fail("raw failure"), "boom", { operation: "load-profile" })
      );

      expect(error).toBeInstanceOf(OperationError);
      expect(error.message).toBe("boom");
      expect(error.cause).toBe("raw failure");
      expect(error.operation).toBe("load-profile");
    })
  );

  it.effect("maps extra-field errors in pipe-friendly form", () =>
    Effect.gen(function* () {
      const error = yield* pipe(
        Effect.fail("raw failure"),
        OperationError.mapError("boom", { operation: "load-profile" }),
        Effect.flip
      );

      expect(error).toBeInstanceOf(OperationError);
      expect(error.message).toBe("boom");
      expect(error.cause).toBe("raw failure");
      expect(error.operation).toBe("load-profile");
    })
  );

  it("validates extras through the generated schema", () => {
    const makeInvalid = OperationError.new as (
      cause: unknown,
      message: string,
      extras: { readonly operation: unknown }
    ) => OperationError;

    expect(() => makeInvalid(new Error("kapow"), "boom", { operation: 1 })).toThrow();
  });

  it("reattaches helpers when extending cause tagged errors", () => {
    const cause = new Error("kapow");
    const error = ExtendedOperationError.new(cause, "boom", {
      operation: "load-profile",
      resource: "profile",
    });

    expect(error).toBeInstanceOf(OperationError);
    expect(error).toBeInstanceOf(ExtendedOperationError);
    expect(error.name).toBe("ExtendedOperationError");
    expect(error.message).toBe("boom");
    expect(error.cause).toBe(cause);
    expect(error.operation).toBe("load-profile");
    expect(error.resource).toBe("profile");
  });
});
