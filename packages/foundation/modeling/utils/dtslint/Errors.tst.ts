import { Err } from "@beep/utils";
import { Effect, pipe } from "effect";
import { dual } from "effect/Function";
import { describe, expect, it } from "tstyche";

class CauseMappedError {
  constructor(
    readonly cause: unknown,
    readonly message: string,
    readonly operation: string
  ) {}
}

class StaticMappedError {
  constructor(
    readonly message: string,
    readonly exitCode: number
  ) {}
}

class DualInputMappedError {
  constructor(
    readonly source: string,
    readonly label: string
  ) {}

  static readonly new: {
    (source: string, label: string): DualInputMappedError;
    (label: string): (source: string) => DualInputMappedError;
  } = dual(2, (source: string, label: string): DualInputMappedError => new DualInputMappedError(source, label));
}

type OptionalDualInputMappedErrorOptions =
  | undefined
  | {
      readonly exitCode?: undefined | number;
    };

class OptionalDualInputMappedError {
  constructor(
    readonly source: string,
    readonly message: string,
    readonly exitCode: number | undefined
  ) {}

  static readonly new: {
    (source: string, message: string, options?: OptionalDualInputMappedErrorOptions): OptionalDualInputMappedError;
    (message: string, options?: OptionalDualInputMappedErrorOptions): (source: string) => OptionalDualInputMappedError;
  } = dual(
    3,
    (source: string, message: string, { exitCode } = {}): OptionalDualInputMappedError =>
      new OptionalDualInputMappedError(source, message, exitCode)
  );
}

const raw = Effect.fail("raw failure");
const rawNumber = Effect.fail(1);
const mapCauseMappedError = Err.mapCauseError(
  (cause: unknown, message: string, operation: string) => new CauseMappedError(cause, message, operation)
);
const mapStaticError = Err.mapToError((message: string, exitCode: number) => new StaticMappedError(message, exitCode));
const mapDualInputError = Err.mapToError(DualInputMappedError.new);
const mapOptionalDualInputError = Err.mapToError(OptionalDualInputMappedError.new);

describe("Err.mapCauseError", () => {
  it("returns an ErrorMapper with inferred builder arguments", () => {
    expect(mapCauseMappedError).type.toBe<Err.ErrorMapper<CauseMappedError, [message: string, operation: string]>>();
  });

  it("maps the error channel in data-first form", () => {
    expect(mapCauseMappedError(raw, "Command failed.", "spawn")).type.toBeAssignableTo<
      Effect.Effect<never, CauseMappedError>
    >();
  });

  it("maps the error channel in pipe-friendly form", () => {
    expect(pipe(raw, mapCauseMappedError("Command failed.", "spawn"))).type.toBeAssignableTo<
      Effect.Effect<never, CauseMappedError>
    >();
  });

  it("preserves the success channel", () => {
    expect(pipe(Effect.succeed(42), mapCauseMappedError("Command failed.", "spawn"))).type.toBeAssignableTo<
      Effect.Effect<number, CauseMappedError>
    >();
  });

  it("requires all builder arguments", () => {
    expect(mapCauseMappedError).type.not.toBeCallableWith(raw, "Command failed.");
    expect(mapCauseMappedError).type.not.toBeCallableWith("Command failed.");
  });
});

describe("Err.mapToError", () => {
  it("returns an ErrorMapper with inferred builder arguments", () => {
    expect(mapStaticError).type.toBe<Err.ErrorMapper<StaticMappedError, [message: string, exitCode: number]>>();
  });

  it("returns an input-aware ErrorMapper for dual constructors", () => {
    expect(mapDualInputError).type.toBe<Err.ErrorMapper<DualInputMappedError, [label: string], string>>();
  });

  it("returns an input-aware ErrorMapper for optional-argument dual constructors", () => {
    expect(mapOptionalDualInputError).type.toBe<
      Err.ErrorMapper<
        OptionalDualInputMappedError,
        [message: string, options?: OptionalDualInputMappedErrorOptions],
        string
      >
    >();
  });

  it("maps the error channel in data-first form", () => {
    expect(mapStaticError(raw, "Command exited.", 1)).type.toBeAssignableTo<Effect.Effect<never, StaticMappedError>>();
  });

  it("maps the error channel through a dual constructor in data-first form", () => {
    expect(mapDualInputError(raw, "spawn")).type.toBeAssignableTo<Effect.Effect<never, DualInputMappedError>>();
  });

  it("maps the error channel through an optional-argument dual constructor in data-first form", () => {
    expect(mapOptionalDualInputError(raw, "Command failed.")).type.toBeAssignableTo<
      Effect.Effect<never, OptionalDualInputMappedError>
    >();
  });

  it("maps the error channel in pipe-friendly form", () => {
    expect(pipe(raw, mapStaticError("Command exited.", 1))).type.toBeAssignableTo<
      Effect.Effect<never, StaticMappedError>
    >();
  });

  it("maps the error channel through a dual constructor in pipe-friendly form", () => {
    expect(pipe(raw, mapDualInputError("spawn"))).type.toBeAssignableTo<Effect.Effect<never, DualInputMappedError>>();
  });

  it("maps the error channel through an optional-argument dual constructor in pipe-friendly form", () => {
    expect(pipe(raw, mapOptionalDualInputError("Command failed.", { exitCode: 1 }))).type.toBeAssignableTo<
      Effect.Effect<never, OptionalDualInputMappedError>
    >();
  });

  it("preserves the success channel", () => {
    expect(pipe(Effect.succeed(42), mapStaticError("Command exited.", 1))).type.toBeAssignableTo<
      Effect.Effect<number, StaticMappedError>
    >();
  });

  it("rejects source error types not accepted by a dual constructor", () => {
    expect(mapDualInputError).type.not.toBeCallableWith(rawNumber, "spawn");
    expect(mapDualInputError("spawn")).type.not.toBeCallableWith(rawNumber);
  });

  it("requires all builder arguments", () => {
    expect(mapStaticError).type.not.toBeCallableWith(raw, "Command exited.");
    expect(mapStaticError).type.not.toBeCallableWith("Command exited.");
  });
});
