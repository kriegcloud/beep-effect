import * as Cause from "effect/Cause";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

import { IamError } from "../../errors";
import { withSubmissionGuard } from "../concurrency";
import type { RequestContextOptions } from "../context";
import { withRequestContext } from "../context";
import type { BetterAuthErrorPayload } from "../errors";
import { normalizeBetterAuthError } from "../errors";
import type { BetterAuthMetricsConfig } from "../instrumentation";
import { annotateBetterAuthLogs, withBetterAuthSpan, withSpanAndMetrics } from "../instrumentation";

export interface RetryPolicy {
  readonly schedule: Schedule.Schedule<unknown, IamError, never>;
  readonly while?: (error: IamError) => boolean;
}

export interface TimeoutPolicy {
  readonly duration: Duration.DurationInput;
  readonly message?: string;
}

export interface CallBetterAuthContext {
  readonly plugin: string;
  readonly method: string;
  readonly annotations?: Readonly<Record<string, unknown>>;
  readonly metrics?: BetterAuthMetricsConfig;
  readonly retry?: RetryPolicy;
  readonly timeout?: TimeoutPolicy;
  readonly defaultErrorMessage?: string;
  readonly requestContext?: RequestContextOptions;
  readonly semaphoreKey?: string;
}

export type BetterAuthExecutor<A> = (signal: AbortSignal) => Promise<BetterAuthErrorPayload | BetterAuthSuccess<A>>;

const createTimeoutError = (context: CallBetterAuthContext): IamError =>
  new IamError(
    new Error("Better Auth handler timeout"),
    context.timeout?.message ?? `Better Auth handler ${context.plugin}.${context.method} timed out`,
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

interface BetterAuthSuccess<A> {
  readonly data: A;
}

const isBetterAuthFailure = (value: unknown): value is BetterAuthErrorPayload =>
  typeof value === "object" &&
  value !== null &&
  "error" in value &&
  (value as BetterAuthErrorPayload).error !== undefined;

const isBetterAuthSuccess = <A>(value: unknown): value is BetterAuthSuccess<A> =>
  typeof value === "object" && value !== null && "data" in value;

const toSuccessData = <A>(result: BetterAuthErrorPayload | BetterAuthSuccess<A>, context: CallBetterAuthContext) => {
  if (isBetterAuthFailure(result)) {
    return Effect.fail(
      normalizeBetterAuthError(result, {
        plugin: context.plugin,
        method: context.method,
        defaultMessage: context.defaultErrorMessage,
      })
    );
  }

  if (isBetterAuthSuccess<A>(result)) {
    return Effect.succeed(result.data);
  }

  return Effect.fail(
    normalizeBetterAuthError(null, {
      plugin: context.plugin,
      method: context.method,
      defaultMessage: context.defaultErrorMessage,
    })
  );
};

export const callBetterAuth = <A>(
  context: CallBetterAuthContext,
  executor: BetterAuthExecutor<A>
): Effect.Effect<A, IamError> => {
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
            betterAuthCause: error,
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
    annotateBetterAuthLogs({
      values: {
        source: "iam-sdk",
        plugin: context.plugin,
        method: context.method,
        ...(context.annotations ?? {}),
      },
    }),
    withBetterAuthSpan({ spanName: `better-auth:${context.plugin}.${context.method}` }),
    withSpanAndMetrics(context.metrics),
    Effect.tapErrorCause((cause) =>
      Effect.logError("better-auth handler failure", {
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
