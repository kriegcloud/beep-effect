/**
 * Continuation helpers combine contract metadata with transport-agnostic
 * utilities for running promise-based operations. This module also houses the
 * shared `handleOutcome` helper used when consuming lifted contracts.
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
 * Constructs a `FailureContinuation` for the provided contract. Continuations
 * wrap promise-based transports and provide helpers for raising results into
 * the Effect error channel. Set `supportsAbort` to receive abort signals and
 * `normalizeError` to translate foreign errors into domain-specific failures.
 *
 * When `run` is invoked with `{ surfaceDefect: true }` it returns an `Either`
 * that preserves defect information instead of rethrowing it.
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

  const normalizeError =
    (options?.normalizeError as ((error: unknown, ctx: FailureContinuationContext<C, Extra>) => Failure) | undefined) ??
    (((error: unknown, ctx: FailureContinuationContext<C, Extra>) => defaultNormalize(error, ctx)) as (
      error: unknown,
      ctx: FailureContinuationContext<C, Extra>
    ) => Failure);

  const decodeFailureConfig = options?.decodeFailure;
  const decodeFailure = decodeFailureConfig
    ? S.decodeUnknownSync(_internal.toSchemaAnyNoContext(contract.failureSchema), decodeFailureConfig.parseOptions)
    : undefined;

  const toFailure = (error: unknown): Failure => {
    if (decodeFailure) {
      try {
        const candidate = decodeFailureConfig?.select ? decodeFailureConfig.select(error, context) : error;
        return decodeFailure(candidate) as Failure;
      } catch {
        // fall through to normalization when decoding is unavailable or fails
      }
    }
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

      const onError: FailureContinuationHandlers["onError"] = ({ error }) => complete(Effect.fail(toFailure(error)));

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
          (reason) => complete(Effect.fail(toFailure(reason)))
        );
      } catch (cause) {
        complete(Effect.fail(toFailure(cause)));
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
      onFalse: () => Effect.die(toFailure(result.error)),
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
