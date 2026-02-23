/**
 * Continuation helpers combine contract metadata with transport-agnostic
 * utilities for running promise-based operations. This module also houses the
 * shared `handleOutcome` helper used when consuming lifted contracts.
 *
 * ## V2 Error Mapping
 *
 * The continuation now supports composable error mapping via the `mapError` option.
 * This allows implementations to transform third-party errors into typed failures
 * that match the contract's `failureSchema`.
 *
 * @example
 * ```ts
 * const continuation = contract.continuation({
 *   mapError: (error, ctx) => {
 *     if (error instanceof DOMException && error.name === "NotAllowedError") {
 *       return new PasskeyError.NotAllowedError({
 *         message: error.message,
 *         domain: ctx.metadata.domain
 *       });
 *     }
 *     return undefined; // Fall through to default normalization
 *   }
 * });
 * ```
 *
 * @since 2.0.0
 */
import type { UnsafeTypes } from "@beep/types";
import * as Bool from "effect/Boolean";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { ContractError } from "../contract-error";
import * as _internal from "../utils";
import { Domain, Method, SupportsAbort, Title } from "./annotations";
import type {
  Any,
  ErrorMapper,
  FailureContinuation,
  FailureContinuationContext,
  FailureContinuationHandlers,
  FailureContinuationOptions,
  HandleOutcome,
  HandleOutcomeHandlers,
  Metadata,
  MetadataOptions,
} from "./types";

/**
 * Creates an effect that runs the appropriate handler based on whether a
 * contract outcome produced a success or failure. Helpful when rendering
 * discriminated results.
 *
 * @param _contract
 */
export const handleOutcome =
  <const C extends Any>(_contract: C) =>
  <R, E, Env>(handlers: HandleOutcomeHandlers<C, R, E, Env>) =>
  (outcome: HandleOutcome<C>): Effect.Effect<R, E, Env> =>
    Match.value(outcome).pipe(
      Match.discriminatorsExhaustive("mode")({
        error: (result) =>
          Match.value(result).pipe(
            Match.tagsExhaustive({
              success: (successOutcome) => handlers.onSuccess(successOutcome),
            })
          ),
        return: (result) =>
          Match.value(result).pipe(
            Match.tagsExhaustive({
              success: (successOutcome) => handlers.onSuccess(successOutcome),
              failure: (failureOutcome) => handlers.onFailure(failureOutcome),
            })
          ),
      })
    );

const getAnnotationValue = <A extends Context.Tag<UnsafeTypes.UnsafeAny, string>>(
  annotations: Context.Context<never>,
  tag: A
): string | undefined => O.getOrUndefined(Context.getOption(annotations, tag));

/**
 * Computes metadata for a contract by reading annotations and optional
 * overrides. Metadata objects are attached to continuations and surfaced in
 * error loggers.
 *
 * @param contract - Contract to inspect.
 * @param options - Optional overrides and arbitrary `extra` fields.
 */
export const metadata = <const C extends Any, Extra extends Record<string, unknown> = Record<string, unknown>>(
  contract: C,
  options?: MetadataOptions<Extra> | undefined
): Metadata<Extra> => {
  const title = getAnnotationValue(contract.annotations, Title);
  const domain = getAnnotationValue(contract.annotations, Domain);
  const method = getAnnotationValue(contract.annotations, Method);
  const supportsAbort = Context.getOption(contract.annotations, SupportsAbort).pipe(O.getOrElse(() => false));
  const overrides = options?.overrides;
  const description = overrides?.description ?? contract.description;
  const resolvedTitle = overrides?.title ?? title;
  const resolvedDomain = overrides?.domain ?? domain;
  const resolvedMethod = overrides?.method ?? method;

  return {
    id: contract.id,
    name: contract.name,
    supportsAbort,
    ...(description !== undefined ? { description } : {}),
    ...(resolvedTitle !== undefined ? { title: resolvedTitle } : {}),
    ...(resolvedDomain !== undefined ? { domain: resolvedDomain } : {}),
    ...(resolvedMethod !== undefined ? { method: resolvedMethod } : {}),
    ...(options?.extra !== undefined ? { extra: options.extra } : {}),
  } as Metadata<Extra>;
};

/**
 * Checks if a value is an Effect that should be executed (not a TaggedError).
 * TaggedError extends Effect but represents an error value, not an effect to run.
 */
const isRunnableEffect = (value: unknown): value is Effect.Effect<unknown, unknown, unknown> =>
  Effect.isEffect(value) && !(value instanceof Error);

/**
 * Constructs a `FailureContinuation` for the provided contract. Continuations
 * wrap promise-based transports and provide helpers for raising results into
 * the Effect error channel.
 *
 * ## V2 Error Mapping Pipeline
 *
 * Errors are processed through this pipeline (first match wins):
 *
 * 1. **Schema Decoding** (`decodeFailure`): Attempts to decode the error against
 *    the contract's `failureSchema`. Useful when the third-party API returns
 *    errors that already match your schema structure.
 *
 * 2. **Custom Mappers** (`mapError`): User-provided mapper function(s) that
 *    transform third-party errors into typed failures. Mappers return the
 *    mapped error or `undefined` to fall through to the next mapper.
 *
 * 3. **Legacy Normalizer** (`normalizeError`): Fallback function for errors
 *    not handled by mappers. Deprecated in favor of `mapError`.
 *
 * 4. **Default Normalization**: Creates a `ContractError.UnknownError` with
 *    error message and cause preserved.
 *
 * @example
 * ```ts
 * // Simple mapper for WebAuthn DOMExceptions
 * const continuation = contract.continuation({
 *   mapError: (error, ctx) => {
 *     if (error instanceof DOMException) {
 *       switch (error.name) {
 *         case "NotAllowedError":
 *           return new PasskeyError.NotAllowedError({
 *             message: error.message,
 *             domain: ctx.metadata.domain
 *           });
 *         case "InvalidStateError":
 *           return new PasskeyError.InvalidStateError({ ... });
 *       }
 *     }
 *     return undefined; // Fall through to default
 *   }
 * });
 *
 * // Composable mappers (tried in order)
 * const continuation = contract.continuation({
 *   mapError: [
 *     domExceptionMapper,    // Handles DOMException
 *     betterAuthMapper,      // Handles BetterAuthError
 *     httpClientErrorMapper, // Handles HTTP errors
 *   ]
 * });
 * ```
 *
 * When `run` is invoked with `{ surfaceDefect: true }` it returns an `Either`
 * that preserves defect information instead of rethrowing it.
 *
 * @since 2.0.0
 */
export function failureContinuation<
  const C extends Any,
  Failure = ContractError.UnknownError,
  Extra extends Record<string, unknown> = Record<string, unknown>,
>(contract: C, options?: FailureContinuationOptions<C, Failure, Extra>): FailureContinuation<C, Failure, Extra> {
  const computedMetadata = metadata(contract, options?.metadata);
  const context: FailureContinuationContext<C, Extra> = {
    contract,
    metadata: computedMetadata,
  };

  // Default normalization: creates UnknownError with preserved cause
  const defaultNormalize = (error: unknown, ctx: FailureContinuationContext<C, Extra>): ContractError.UnknownError =>
    new ContractError.UnknownError({
      module: ctx.metadata.domain ?? ctx.contract.name,
      method: ctx.metadata.method ?? ctx.contract.name,
      description:
        error instanceof Error && !P.isUndefined(error.message)
          ? error.message
          : `Contract ${ctx.contract.name} encountered an unexpected error`,
      cause: error instanceof Error ? error : undefined,
    });

  // Legacy normalizeError fallback (deprecated, use mapError instead)
  const normalizeError =
    (options?.normalizeError as ((error: unknown, ctx: FailureContinuationContext<C, Extra>) => Failure) | undefined) ??
    (((error: unknown, ctx: FailureContinuationContext<C, Extra>) => defaultNormalize(error, ctx)) as (
      error: unknown,
      ctx: FailureContinuationContext<C, Extra>
    ) => Failure);

  // Schema-based decoding (step 1 in pipeline)
  const decodeFailureConfig = options?.decodeFailure;
  const decodeFailure = decodeFailureConfig
    ? S.decodeUnknownSync(_internal.toSchemaAnyNoContext(contract.failureSchema), decodeFailureConfig.parseOptions)
    : undefined;

  // Normalize mapError option to array form
  const errorMappers: ReadonlyArray<ErrorMapper<C, Failure, Extra>> = options?.mapError
    ? Array.isArray(options.mapError)
      ? options.mapError
      : [options.mapError]
    : [];

  /**
   * Synchronous error transformation (for backward compatibility with V1).
   * Uses the full pipeline but runs synchronously.
   */
  const toFailureSync = (error: unknown): Failure => {
    // Step 1: Try schema decoding
    if (decodeFailure) {
      try {
        const candidate = decodeFailureConfig?.select ? decodeFailureConfig.select(error, context) : error;
        return decodeFailure(candidate) as Failure;
      } catch {
        // Fall through to mappers
      }
    }

    // Step 2: Try custom mappers (synchronously for backward compat)
    for (const mapper of errorMappers) {
      try {
        const result = mapper(error, context);
        // Only handle sync results in sync path
        // Note: TaggedError extends Effect, so we use isRunnableEffect to exclude them
        if (!isRunnableEffect(result) && result !== undefined) {
          return result as Failure;
        }
      } catch {
        // Mapper threw, continue to next
      }
    }

    // Step 3 & 4: Legacy normalizer or default normalization
    return normalizeError(error, context);
  };

  const runImpl = <A>(
    register: (handlers: FailureContinuationHandlers) => Promise<A>,
    options?: FailureContinuation.RunOptions
  ) => {
    const effect = Effect.async<A, Failure>((resume) => {
      const controller = Bool.match(computedMetadata.supportsAbort && P.isNotNullable(AbortController), {
        onTrue: () => new AbortController(),
        onFalse: () => undefined,
      });
      let settled = false;

      const complete = (result: Effect.Effect<A, Failure>): void =>
        Bool.match(settled, {
          onTrue: () => {},
          onFalse: () => {
            settled = true;
            if (controller && !controller.signal.aborted) {
              controller.abort();
            }
            resume(result);
          },
        });

      const onError: FailureContinuationHandlers["onError"] = ({ error }) =>
        complete(Effect.fail(toFailureSync(error)));

      const handlers: FailureContinuationHandlers = O.fromNullable(controller).pipe(
        O.match({
          onNone: () => ({ onError }) as const,
          onSome: (controller) => ({ signal: controller.signal, onError }) as const,
        })
      );

      try {
        const promise = register(handlers);
        promise.then(
          (value) => complete(Effect.succeed(value)),
          (reason) => complete(Effect.fail(toFailureSync(reason)))
        );
      } catch (cause) {
        complete(Effect.fail(toFailureSync(cause)));
      }

      return O.fromNullable(controller).pipe(
        O.match({
          onNone: () => Effect.succeed({}),
          onSome: (controller) =>
            Effect.sync(() =>
              Bool.match(!controller.signal.aborted, {
                onTrue: () => controller.abort(),
                onFalse: () => {},
              })
            ),
        })
      );
    });

    return options?.surfaceDefect ? Effect.either(effect) : effect.pipe(Effect.catchAll((e) => Effect.die(e)));
  };
  const run = runImpl as FailureContinuation.Runner<Failure>;

  const raiseResult: FailureContinuation<C, Failure, Extra>["raiseResult"] = (result) =>
    Bool.match(P.isNullable(result.error), {
      onTrue: () => Effect.void,
      onFalse: () => Effect.die(toFailureSync(result.error)),
    });

  const runRaise: FailureContinuation<C, Failure, Extra>["runRaise"] = (register) =>
    run(register).pipe(Effect.tap(raiseResult));

  const runDecode: FailureContinuation<C, Failure, Extra>["runDecode"] = (register, decodeOptions) => {
    const decodeFrom = decodeOptions?.decodeFrom ?? "data";
    const decodeSuccess = S.decodeUnknownSync(
      _internal.toSchemaAnyNoContext(contract.successSchema),
      decodeOptions?.parseOptions
    );
    return run(register).pipe(
      Effect.tap(raiseResult),
      Effect.map((result) =>
        decodeSuccess(decodeFrom === "result" ? result : (result as { readonly data?: unknown }).data)
      )
    );
  };

  const runVoid: FailureContinuation<C, Failure, Extra>["runVoid"] = (register) =>
    run(register).pipe(Effect.tap(raiseResult), Effect.asVoid);

  return {
    metadata: computedMetadata,
    run,
    runRaise,
    runDecode,
    runVoid,
    raiseResult,
  };
}
