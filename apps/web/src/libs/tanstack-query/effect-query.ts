import type { LiveRuntimeContext } from "@beep/runtime-client";
import { runClientPromiseExit, useRuntime } from "@beep/runtime-client";
import type { UnsafeTypes } from "@beep/types";
import { toast } from "@beep/ui/molecules";
import {
  type GetNextPageParamFunction,
  type GetPreviousPageParamFunction,
  type InfiniteData,
  type QueryFunction,
  type QueryFunctionContext,
  skipToken,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as P from "effect/Predicate";
import * as React from "react";

export class QueryDefect extends Data.TaggedError("QueryDefect")<{
  cause: unknown;
}> {}

const hasStringMessage = P.compose(P.isRecord, P.compose(P.hasProperty("message"), P.struct({ message: P.isString })));

type EffectfulError<Tag extends string = string> = { _tag: Tag };
type ToastifyErrorsConfig<E extends EffectfulError> = {
  [K in E["_tag"]]?: (error: Extract<E, EffectfulError<K>>) => string;
} & {
  orElse?: boolean | string | "extractMessage";
};

type UseRunnerOpts<A, E extends EffectfulError> = {
  toastifyDefects?: boolean | string;
  toastifyErrors?: ToastifyErrorsConfig<E>;
  toastifySuccess?: (result: A) => string;
};

const DEFAULT_ERROR_MESSAGE = "Something went wrong";
const DEFAULT_DEFECT_MESSAGE = "An unexpected error occurred";

/**
 * @internal
 */
const useRunner = <A, E extends EffectfulError, R extends LiveRuntimeContext>({
  toastifyDefects = true,
  toastifyErrors = {},
  toastifySuccess,
}: UseRunnerOpts<NoInfer<A>, NoInfer<E>> = {}): ((span: string) => (self: Effect.Effect<A, E, R>) => Promise<A>) => {
  const runtime = useRuntime();

  return React.useCallback(
    (span: string) =>
      (self: Effect.Effect<A, E, R>): Promise<A> => {
        const { orElse = true, ...tagConfigs } = toastifyErrors;

        return self
          .pipe(
            Effect.tapError((error) =>
              Effect.sync(() => {
                const errorTag = error._tag as keyof typeof tagConfigs;
                const tagHandler = tagConfigs[errorTag];

                if (tagHandler !== undefined) {
                  const message = tagHandler(error as UnsafeTypes.UnsafeAny);
                  toast.error(message);
                  return;
                }
                if (orElse !== false) {
                  if (orElse === "extractMessage" && hasStringMessage(error)) {
                    toast.error(error.message);
                  } else if (typeof orElse === "string") {
                    toast.error(orElse);
                  } else {
                    // orElse === true, use default message
                    toast.error(DEFAULT_ERROR_MESSAGE);
                  }
                }
              })
            ),
            Effect.tap((result) => {
              if (toastifySuccess !== undefined) {
                toast.success(toastifySuccess(result));
              }
            }),
            Effect.tapErrorCause(Effect.logError),
            Effect.withSpan(span),
            (effect) => runClientPromiseExit(runtime, effect, `clientRuntime.runPromiseExit.${span}`)
          )
          .then(
            Exit.match({
              onSuccess: (value) => Promise.resolve(value),
              onFailure: (cause) => {
                if (Cause.isFailType(cause)) {
                  throw cause.error satisfies E;
                }

                if (toastifyDefects !== false) {
                  const defectMessage = typeof toastifyDefects === "string" ? toastifyDefects : DEFAULT_DEFECT_MESSAGE;
                  toast.error(defectMessage);
                }

                throw new QueryDefect({ cause: Cause.squash(cause) });
              },
            })
          );
      },
    [runtime, toastifyDefects, toastifyErrors, toastifySuccess]
  );
};

export type QueryVariables = Record<string, unknown>;
export type QueryKey = readonly [string, QueryVariables?];

// ==========================================
// useEffectMutation
// ==========================================

type EffectfulMutationOptions<A, E extends EffectfulError, Variables, R extends LiveRuntimeContext> = Omit<
  UseMutationOptions<A, E | QueryDefect, Variables>,
  "mutationFn" | "onSuccess" | "onError" | "onSettled" | "onMutate" | "retry" | "retryDelay"
> & {
  mutationKey: QueryKey;
  mutationFn: (variables: Variables) => Effect.Effect<A, E, R>;
} & UseRunnerOpts<A, E>;

export function useEffectMutation<A, E extends EffectfulError, Variables, R extends LiveRuntimeContext>(
  options: EffectfulMutationOptions<A, E, Variables, R>
): UseMutationResult<A, E | QueryDefect, Variables> {
  const effectRunner = useRunner<A, E, R>(options);
  const [spanName] = options.mutationKey;

  const mutationFn = React.useCallback(
    (variables: Variables) => {
      const effect = options.mutationFn(variables);
      return effect.pipe(effectRunner(spanName));
    },
    [effectRunner, spanName, options]
  );

  return useMutation<A, E | QueryDefect, Variables>({
    ...options,
    mutationFn,
    throwOnError: false,
  });
}

// ==========================================
// useEffectQuery
// ==========================================

type EffectfulQueryFunction<
  A,
  E extends EffectfulError,
  R extends LiveRuntimeContext,
  QueryKeyType extends QueryKey = QueryKey,
  PageParam = never,
> = (context: QueryFunctionContext<QueryKeyType, PageParam>) => Effect.Effect<A, E, R>;

type EffectfulQueryOptions<
  A,
  E extends EffectfulError,
  R extends LiveRuntimeContext,
  QueryKeyType extends QueryKey = QueryKey,
  PageParam = never,
> = Omit<
  UseQueryOptions<A, E | QueryDefect, A, QueryKeyType>,
  "queryKey" | "queryFn" | "retry" | "retryDelay" | "staleTime" | "gcTime"
> & {
  queryKey: QueryKeyType;
  queryFn: EffectfulQueryFunction<A, E, R, QueryKeyType, PageParam> | typeof skipToken;
  staleTime?: Duration.DurationInput;
  gcTime?: Duration.DurationInput;
} & UseRunnerOpts<A, E>;

export function useEffectQuery<
  A,
  E extends EffectfulError,
  R extends LiveRuntimeContext,
  QueryKeyType extends QueryKey = QueryKey,
>({ gcTime, staleTime, ...options }: EffectfulQueryOptions<A, E, R, QueryKeyType>): UseQueryResult<A, E | QueryDefect> {
  const effectRunner = useRunner<A, E, R>(options);
  const [spanName] = options.queryKey;

  const queryFn: QueryFunction<A, QueryKeyType> = React.useCallback(
    (context: QueryFunctionContext<QueryKeyType>) => {
      const effect = (options.queryFn as EffectfulQueryFunction<A, E, R, QueryKeyType>)(context);
      return effect.pipe(effectRunner(spanName));
    },
    [effectRunner, spanName, options]
  );

  return useQuery<A, E | QueryDefect, A, QueryKeyType>({
    ...options,
    queryFn: options.queryFn === skipToken ? skipToken : queryFn,
    ...(staleTime !== undefined && { staleTime: Duration.toMillis(staleTime) }),
    ...(gcTime !== undefined && { gcTime: Duration.toMillis(gcTime) }),
    throwOnError: false,
  });
}

export type UseQueryResultSuccess<TData> = UseQueryResult<TData, unknown>["data"];

export type EffectfulInfiniteQueryOptions<
  A,
  E extends EffectfulError,
  R extends LiveRuntimeContext,
  QueryKeyType extends QueryKey = QueryKey,
  PageParam = unknown,
> = Omit<
  UseInfiniteQueryOptions<A, E | QueryDefect, InfiniteData<A, PageParam>, QueryKeyType, PageParam>,
  "queryFn" | "retry" | "retryDelay" | "staleTime" | "gcTime"
> & {
  queryKey: QueryKeyType;
  queryFn: EffectfulQueryFunction<A, E, R, QueryKeyType, PageParam> | typeof skipToken;
  getNextPageParam: GetNextPageParamFunction<PageParam, A>;
  getPreviousPageParam?: GetPreviousPageParamFunction<PageParam, A>;
  initialPageParam: PageParam;
  staleTime?: Duration.DurationInput;
  gcTime?: Duration.DurationInput;
} & UseRunnerOpts<A, E>;

// ==========================================
// useEffectInfiniteQuery
// ==========================================

export function useEffectInfiniteQuery<
  A,
  E extends EffectfulError,
  R extends LiveRuntimeContext,
  QueryKeyType extends QueryKey = QueryKey,
  PageParam = unknown,
>({
  gcTime,
  getNextPageParam,
  getPreviousPageParam,
  initialPageParam,
  queryFn: effectfulQueryFn,
  queryKey,
  staleTime,
  ...options
}: EffectfulInfiniteQueryOptions<A, E, R, QueryKeyType, PageParam>): UseInfiniteQueryResult<
  InfiniteData<A, PageParam>,
  E | QueryDefect
> {
  const effectRunner = useRunner<A, E, R>(options);
  const [spanName] = queryKey;

  const queryFn: QueryFunction<A, QueryKeyType, PageParam> = React.useCallback(
    (context: QueryFunctionContext<QueryKeyType, PageParam>) => {
      const effect = (effectfulQueryFn as EffectfulQueryFunction<A, E, R, QueryKeyType, PageParam>)(context);
      return effect.pipe(effectRunner(spanName));
    },
    [effectRunner, spanName, effectfulQueryFn]
  );

  return useInfiniteQuery<A, E | QueryDefect, InfiniteData<A, PageParam>, QueryKeyType, PageParam>({
    ...options,
    queryKey,
    queryFn: effectfulQueryFn === skipToken ? skipToken : queryFn,
    initialPageParam,
    getNextPageParam,
    ...(getPreviousPageParam !== undefined && { getPreviousPageParam }),
    ...(staleTime !== undefined && { staleTime: Duration.toMillis(staleTime) }),
    ...(gcTime !== undefined && { gcTime: Duration.toMillis(gcTime) }),
    throwOnError: false,
  });
}
