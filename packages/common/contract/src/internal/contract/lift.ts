/**
 * Helpers that transform raw contract implementations into higher-level
 * services. `lift` powers `ContractKit.liftService`, guaranteeing that defect
 * handling and telemetry hooks are consistently applied.
 *
 * ## V2 Defect Mapping
 *
 * The lift function now supports customizable defect-to-failure mapping via the
 * `mapDefect` option. This allows callers to convert defects (die/interrupt) into
 * typed failures rather than always producing `ContractError.UnknownError`.
 *
 * @example
 * ```ts
 * const lifted = lift(MyContract, {
 *   method: MyContractImplementation,
 *   mapDefect: (cause, ctx) => {
 *     const error = Cause.squash(cause);
 *     if (error instanceof DOMException && error.name === "NotAllowedError") {
 *       return new PasskeyError.NotAllowedError({ message: error.message });
 *     }
 *     return undefined; // Fall through to UnknownError
 *   }
 * });
 * ```
 *
 * @since 2.0.0
 */
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import { ContractError } from "../contract-error";
import type {
  Any,
  Failure,
  HandleOutcome,
  ImplementationResult,
  Payload,
  Requirements,
  ResultEncoded,
  Success,
} from "./types";
import { FailureMode } from "./types";

/**
 * Context passed to the defect mapper function.
 *
 * @since 2.0.0
 */
export interface DefectMapperContext<C extends Any> {
  readonly contract: C;
  readonly payload: Payload<C>;
}

/**
 * Result of a defect mapper. Can return:
 * - A failure value to use instead of UnknownError
 * - `undefined` to fall through to default UnknownError creation
 * - An Effect for async mapping
 *
 * @since 2.0.0
 */
export type DefectMapperResult<Failure> = Failure | undefined | Effect.Effect<Failure | undefined, never, never>;

/**
 * Function signature for mapping defects to typed failures.
 *
 * @since 2.0.0
 */
export type DefectMapper<C extends Any, MappedFailure = Failure<C>> = (
  cause: Cause.Cause<unknown>,
  context: DefectMapperContext<C>
) => DefectMapperResult<MappedFailure>;

/**
 * Options passed to {@link lift}. The `method` field is typically the result of
 * calling `Contract.implement`, while the optional hooks are invoked whenever
 * the lifted contract succeeds, fails, or defects.
 *
 * @since 2.0.0
 */
export interface LiftOptions<C extends Any> {
  /**
   * The implementation function to lift (usually from Contract.implement).
   */
  readonly method: (payload: Payload<C>) => Effect.Effect<ImplementationResult<C>, Failure<C>, Requirements<C>>;

  /**
   * Hook called when the implementation returns a failure.
   */
  readonly onFailure?: undefined | ((failure: Failure<C>) => Effect.Effect<void, never, never>);

  /**
   * Hook called when the implementation succeeds.
   */
  readonly onSuccess?: undefined | ((success: Success<C>) => Effect.Effect<void, never, never>);

  /**
   * Hook called when the implementation raises a defect (die/interrupt).
   */
  readonly onDefect?: undefined | ((cause: Cause.Cause<unknown>) => Effect.Effect<void, never, never>);

  /**
   * Custom mapper to convert defects into typed failures.
   *
   * When provided, this function is called with the defect cause and context.
   * Return a failure value to use that error, or `undefined` to fall through
   * to the default `ContractError.UnknownError` creation.
   *
   * This is useful when third-party APIs surface errors as defects (via die)
   * that you want to map to your contract's failure schema.
   *
   * @example
   * ```ts
   * const lifted = lift(PasskeyContract, {
   *   method: PasskeyImplementation,
   *   mapDefect: (cause, ctx) => {
   *     const error = Cause.squash(cause);
   *     if (error instanceof DOMException) {
   *       switch (error.name) {
   *         case "NotAllowedError":
   *           return new PasskeyError.NotAllowedError({
   *             message: error.message,
   *             domain: "Passkey"
   *           });
   *         case "SecurityError":
   *           return new PasskeyError.SecurityError({ ... });
   *       }
   *     }
   *     return undefined; // Use default UnknownError
   *   }
   * });
   * ```
   *
   * @since 2.0.0
   */
  readonly mapDefect?: undefined | DefectMapper<C, Failure<C> | ContractError.UnknownError>;
}

/**
 * Result of lifting a contract. `result` returns a {@link HandleOutcome} while
 * `success` narrows down to the happy-path value for callers who want the
 * original contract semantics.
 */
export interface LiftedContract<C extends Any> {
  readonly result: (
    payload: Payload<C>
  ) => Effect.Effect<HandleOutcome<C>, Failure<C> | ContractError.UnknownError, Requirements<C>>;
  readonly success: (
    payload: Payload<C>
  ) => Effect.Effect<Success<C>, Failure<C> | ContractError.UnknownError, Requirements<C>>;
}

/**
 * Checks if a value is an Effect that should be executed (not a TaggedError).
 * TaggedError extends Effect but represents an error value, not an effect to run.
 */
const isRunnableEffect = (value: unknown): value is Effect.Effect<unknown, unknown, unknown> =>
  Effect.isEffect(value) && !(value instanceof Error);

/**
 * Converts a raw implementation into a stable service API that encodes failure
 * modes, defects, and optional instrumentation hooks.
 *
 * ## V2 Defect Handling
 *
 * The lift function now supports customizable defect mapping via `mapDefect`.
 * When a defect occurs:
 *
 * 1. If `mapDefect` is provided, it's called with the cause and context
 * 2. If `mapDefect` returns a failure value, that's used instead of UnknownError
 * 3. If `mapDefect` returns `undefined`, a default UnknownError is created
 * 4. The `onDefect` hook is always called (if provided) for instrumentation
 *
 * @example
 * ```ts
 * // Basic usage
 * const lifted = lift(MyContract, { method: MyContractImplementation });
 * const result = await Effect.runPromise(lifted.success({ ...payload }));
 *
 * // With defect mapping for WebAuthn errors
 * const liftedWithMapping = lift(PasskeyContract, {
 *   method: PasskeyImplementation,
 *   mapDefect: (cause, ctx) => {
 *     const error = Cause.squash(cause);
 *     if (error instanceof DOMException && error.name === "NotAllowedError") {
 *       return new PasskeyError.NotAllowedError({ message: error.message });
 *     }
 *     return undefined; // Fall through to UnknownError
 *   }
 * });
 * ```
 *
 * @since 2.0.0
 */
export const lift = <const C extends Any>(contract: C, options: LiftOptions<C>): LiftedContract<C> => {
  const { method, onFailure, onSuccess, onDefect, mapDefect } = options;

  const annotateOutcome = (outcome: HandleOutcome<C>) =>
    Match.value(outcome).pipe(
      Match.tagsExhaustive({
        success: (successOutcome) =>
          onSuccess
            ? Effect.flatMap(onSuccess(successOutcome.result), () => Effect.succeed(successOutcome))
            : Effect.succeed(successOutcome),
        failure: (failureOutcome) =>
          onFailure
            ? Effect.flatMap(onFailure(failureOutcome.result), () => Effect.succeed(failureOutcome))
            : Effect.succeed(failureOutcome),
      })
    );

  /**
   * Creates the default UnknownError for unmapped defects.
   */
  const createDefaultUnknownError = (cause: Cause.Cause<unknown>): ContractError.UnknownError => {
    const squashed = Cause.squash(cause);
    return new ContractError.UnknownError({
      module: contract.name,
      method: contract.name,
      description:
        squashed instanceof Error && squashed.message
          ? squashed.message
          : "Contract implementation raised an unexpected defect.",
      cause: squashed,
    });
  };

  /**
   * Maps a defect to a failure, trying the custom mapper first if provided.
   * Falls back to UnknownError if no mapper or mapper returns undefined.
   */
  const defectToFailure = (
    cause: Cause.Cause<unknown>,
    payload: Payload<C>
  ): Effect.Effect<never, Failure<C> | ContractError.UnknownError, Requirements<C>> => {
    // Pre-compute mapper result outside of Effect.gen to avoid type inference issues
    type MappedFailure = Failure<C> | ContractError.UnknownError;
    let syncMapperResult: MappedFailure | undefined;
    let effectMapperResult: Effect.Effect<MappedFailure | undefined, never, never> | undefined;

    if (mapDefect) {
      const context: DefectMapperContext<C> = { contract, payload };
      try {
        const result = mapDefect(cause, context);
        if (isRunnableEffect(result)) {
          effectMapperResult = result as Effect.Effect<MappedFailure | undefined, never, never>;
        } else if (result !== undefined) {
          syncMapperResult = result;
        }
      } catch {
        // Mapper threw, fall through to default
      }
    }

    return Effect.gen(function* () {
      // Always call onDefect hook if provided (for instrumentation)
      if (onDefect) {
        yield* onDefect(cause);
      }

      // Check for synchronous mapper result
      if (syncMapperResult !== undefined) {
        return yield* Effect.fail(syncMapperResult);
      }

      // Check for effectful mapper result
      if (effectMapperResult !== undefined) {
        const mapped = yield* effectMapperResult;
        if (mapped !== undefined) {
          return yield* Effect.fail(mapped);
        }
      }

      // Default: create UnknownError
      return yield* Effect.fail(createDefaultUnknownError(cause));
    });
  };

  const toOutcome = (implResult: ImplementationResult<C>) =>
    annotateOutcome(
      FailureMode.matchOutcome(contract, {
        isFailure: implResult.isFailure,
        result: implResult.result,
        encodedResult: implResult.encodedResult as ResultEncoded<C>,
      })
    );

  const liftedResult = (payload: Payload<C>) =>
    Effect.gen(function* () {
      const exit = yield* Effect.exit(method(payload));
      return yield* Exit.matchEffect(exit, {
        onFailure: (cause) =>
          O.match(Cause.failureOption(cause), {
            onNone: () => defectToFailure(cause, payload),
            onSome: (failure) =>
              Effect.gen(function* () {
                if (onFailure) {
                  yield* onFailure(failure);
                }
                return yield* Effect.fail(failure);
              }),
          }),
        onSuccess: (implResult) => toOutcome(implResult),
      });
    });

  const liftedSuccess = (payload: Payload<C>) =>
    Effect.flatMap(liftedResult(payload), (outcome) =>
      Match.value(outcome).pipe(
        Match.tagsExhaustive({
          success: (successOutcome) => Effect.succeed(successOutcome.result),
          failure: (failureOutcome) => Effect.fail(failureOutcome.result),
        })
      )
    );

  return {
    result: liftedResult,
    success: liftedSuccess,
  } as const;
};
