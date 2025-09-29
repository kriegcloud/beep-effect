import * as Cause from "effect/Cause";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

import { IamError } from "../../errors";
import { withSubmissionGuard } from "../concurrency";
import type { RequestContextOptions } from "../context";
import { withRequestContext } from "../context";
import type { AuthErrorPayload } from "../errors";
import { normalizeAuthError } from "../errors";
import type { AuthMetricsConfig } from "../instrumentation";
import { annotateAuthLogs, withAuthSpan, withSpanAndMetrics } from "../instrumentation";

export interface RetryPolicy {
  readonly schedule: Schedule.Schedule<unknown, IamError, never>;
  readonly while?: (error: IamError) => boolean;
}

export interface TimeoutPolicy {
  readonly duration: Duration.DurationInput;
  readonly message?: string;
}

export interface CallAuthContext {
  readonly plugin: string;
  readonly method: string;
  readonly annotations?: Readonly<Record<string, unknown>>;
  readonly metrics?: AuthMetricsConfig;
  readonly retry?: RetryPolicy;
  readonly timeout?: TimeoutPolicy;
  readonly defaultErrorMessage?: string;
  readonly requestContext?: RequestContextOptions;
  readonly semaphoreKey?: string;
}

export type AuthExecutor<A> = (signal: AbortSignal) => Promise<AuthErrorPayload | AuthSuccess<A>>;

const createTimeoutError = (context: CallAuthContext): IamError =>
  new IamError(
    new Error("Auth handler timeout"),
    context.timeout?.message ?? `Auth handler ${context.plugin}.${context.method} timed out`,
    {
      plugin: context.plugin,
      method: context.method,
    }
  );

const buildRetrySchedule = (
  policy: RetryPolicy | undefined
): Schedule.Schedule<unknown, IamError, never> | undefined => {
  if (!policy) {
    return undefined;
  }

  return policy.while ? policy.schedule.pipe(Schedule.whileInput(policy.while)) : policy.schedule;
};

interface AuthSuccess<A> {
  readonly data: A;
}

const isAuthFailure = (value: unknown): value is AuthErrorPayload =>
  typeof value === "object" && value !== null && "error" in value && (value as AuthErrorPayload).error !== undefined;

const isAuthSuccess = <A>(value: unknown): value is AuthSuccess<A> =>
  typeof value === "object" && value !== null && "data" in value;

const toSuccessData = <A>(result: AuthErrorPayload | AuthSuccess<A>, context: CallAuthContext) => {
  if (isAuthFailure(result)) {
    return Effect.fail(
      normalizeAuthError(result, {
        plugin: context.plugin,
        method: context.method,
        defaultMessage: context.defaultErrorMessage,
      })
    );
  }

  if (isAuthSuccess<A>(result)) {
    return Effect.succeed(result.data);
  }

  return Effect.fail(
    normalizeAuthError(null, {
      plugin: context.plugin,
      method: context.method,
      defaultMessage: context.defaultErrorMessage,
    })
  );
};

export const callAuth = <A>(context: CallAuthContext, executor: AuthExecutor<A>): Effect.Effect<A, IamError> => {
  const baseEffect = Effect.scoped(
    Effect.gen(function* () {
      const controller = yield* Effect.acquireRelease(
        Effect.sync(() => new AbortController()),
        (ctrl) =>
          Effect.sync(() => {
            if (!ctrl.signal.aborted) {
              ctrl.abort();
            }
          })
      );

      const response = yield* Effect.tryPromise({
        try: () => executor(controller.signal),
        catch: (error) =>
          IamError.match(error, {
            plugin: context.plugin,
            method: context.method,
            authCause: error,
          }),
      });

      return yield* toSuccessData<A>(response, context);
    })
  );

  const timeoutWrapped = context.timeout
    ? baseEffect.pipe(
        Effect.timeoutFail({
          duration: context.timeout.duration,
          onTimeout: () => createTimeoutError(context),
        })
      )
    : baseEffect;

  const retrySchedule = buildRetrySchedule(context.retry);
  const retried = retrySchedule ? Effect.retry(timeoutWrapped, retrySchedule) : timeoutWrapped;

  const guarded = context.semaphoreKey ? withSubmissionGuard(context.semaphoreKey)(retried) : retried;

  const instrumented = guarded.pipe(
    annotateAuthLogs({
      values: {
        source: "iam-sdk",
        plugin: context.plugin,
        method: context.method,
        ...(context.annotations ?? {}),
      },
    }),
    withAuthSpan({ spanName: `auth:${context.plugin}.${context.method}` }),
    withSpanAndMetrics(context.metrics),
    Effect.tapErrorCause((cause) =>
      Effect.logError("auth handler failure", {
        plugin: context.plugin,
        method: context.method,
        cause: Cause.pretty(cause),
      })
    )
  );

  return withRequestContext({
    annotations: {
      ...(context.requestContext?.annotations ?? {}),
      ...(context.annotations ?? {}),
    },
    fiberContext: context.requestContext?.fiberContext,
    metricTags: context.requestContext?.metricTags,
  })(instrumented);
};
