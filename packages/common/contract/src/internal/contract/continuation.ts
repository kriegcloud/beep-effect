import type { Any, HandleOutcome } from "@beep/contract/ContractTypes";
import { noOp } from "@beep/utils/noOps";
import * as Bool from "effect/Boolean";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as Either from "effect/Either";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { ContractError } from "../contract-error";
import { Domain, Method, Title } from "./contract";

export interface FailureContinuationHandlers {
  readonly signal?: AbortSignal | undefined;
  readonly onError: (context: { readonly error: unknown }) => void;
}

export interface FailureContinuationContext<
  C extends Any,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly contract: C;
  readonly metadata: Metadata<Extra>;
}

export interface FailureContinuationOptions<
  C extends Any,
  Failure = ContractError.UnknownError,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly supportsAbort?: boolean | undefined;
  readonly normalizeError?: ((error: unknown, context: FailureContinuationContext<C, Extra>) => Failure) | undefined;
  readonly metadata?: MetadataOptions<Extra> | undefined;
}

export interface FailureContinuation<
  Failure = ContractError.UnknownError,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly metadata: Metadata<Extra>;
  readonly run: FailureContinuation.Runner<Failure>;
  readonly raiseResult: (result: { readonly error: unknown | null | undefined }) => Effect.Effect<void, never, never>;
}

export declare namespace FailureContinuation {
  export interface RunOptions {
    readonly surfaceDefect?: boolean;
  }

  export interface Runner<Failure> {
    <A>(register: (handlers: FailureContinuationHandlers) => Promise<A>): Effect.Effect<A, never, never>;

    <A>(
      register: (handlers: FailureContinuationHandlers) => Promise<A>,
      options: { readonly surfaceDefect: true }
    ): Effect.Effect<Either.Either<A, Failure>, never, never>;
  }
}

export interface Metadata<Extra extends Record<string, unknown> = Record<string, unknown>> {
  readonly id: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly title?: string | undefined;
  readonly domain?: string | undefined;
  readonly method?: string | undefined;
  readonly extra?: Extra | undefined;
}

export interface MetadataOptions<Extra extends Record<string, unknown> = Record<string, unknown>> {
  readonly overrides?: {
    readonly title?: string | undefined;
    readonly domain?: string | undefined;
    readonly method?: string | undefined;
    readonly description?: string | undefined;
  };
  readonly extra?: Extra | undefined;
}

export interface HandleOutcomeHandlers<C extends Any, R = void, E = never, Env = never> {
  readonly onSuccess: (success: HandleOutcome.Success<C>) => Effect.Effect<R, E, Env>;
  readonly onFailure: (failure: HandleOutcome.Failure<C>) => Effect.Effect<R, E, Env>;
}

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

const getAnnotationValue = <A extends Context.Tag<any, string>>(
  annotations: Context.Context<never>,
  tag: A
): string | undefined => O.getOrUndefined(Context.getOption(annotations, tag));

export const metadata = <const C extends Any, Extra extends Record<string, unknown> = Record<string, unknown>>(
  contract: C,
  options?: MetadataOptions<Extra> | undefined
): Metadata<Extra> => {
  const title = getAnnotationValue(contract.annotations, Title);
  const domain = getAnnotationValue(contract.annotations, Domain);
  const method = getAnnotationValue(contract.annotations, Method);
  const overrides = options?.overrides;
  const description = overrides?.description ?? contract.description;
  const resolvedTitle = overrides?.title ?? title;
  const resolvedDomain = overrides?.domain ?? domain;
  const resolvedMethod = overrides?.method ?? method;

  return {
    id: contract.id,
    name: contract.name,
    ...(description !== undefined ? { description } : {}),
    ...(resolvedTitle !== undefined ? { title: resolvedTitle } : {}),
    ...(resolvedDomain !== undefined ? { domain: resolvedDomain } : {}),
    ...(resolvedMethod !== undefined ? { method: resolvedMethod } : {}),
    ...(options?.extra !== undefined ? { extra: options.extra } : {}),
  } as Metadata<Extra>;
};

export function failureContinuation<
  const C extends Any,
  Failure = ContractError.UnknownError,
  Extra extends Record<string, unknown> = Record<string, unknown>,
>(contract: C, options?: FailureContinuationOptions<C, Failure, Extra>): FailureContinuation<Failure, Extra> {
  const supportsAbort = options?.supportsAbort ?? false;
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

  const toFailure = (error: unknown): Failure => normalizeError(error, context);

  const runImpl = <A>(
    register: (handlers: FailureContinuationHandlers) => Promise<A>,
    options?: FailureContinuation.RunOptions
  ) => {
    const effect = Effect.async<A, Failure>((resume) => {
      const controller = Bool.match(supportsAbort && P.isNotNullable(AbortController), {
        onTrue: () => new AbortController(),
        onFalse: () => undefined,
      });
      let settled = false;

      const complete = (result: Effect.Effect<A, Failure>): void =>
        Bool.match(settled, {
          onTrue: noOp,
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
          onNone: () => Effect.succeed(noOp()),
          onSome: (controller) =>
            Effect.sync(() =>
              Bool.match(!controller.signal.aborted, {
                onTrue: () => controller.abort(),
                onFalse: noOp,
              })
            ),
        })
      );
    });

    return options?.surfaceDefect ? Effect.either(effect).pipe : effect.pipe(Effect.catchAll((e) => Effect.die(e)));
  };
  const run = runImpl as FailureContinuation.Runner<Failure>;

  const raiseResult: FailureContinuation<Failure, Extra>["raiseResult"] = (result) => {
    if (result.error == null) {
      return Effect.void;
    }
    return Effect.die(toFailure(result.error));
  };

  return {
    metadata: computedMetadata,
    run,
    raiseResult,
  };
}
