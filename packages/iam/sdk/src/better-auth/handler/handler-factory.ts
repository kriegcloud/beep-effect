import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import type { IamError } from "../../errors";
import { IamError as IamErrorConstructor } from "../../errors";
import type { HandlerFiberContext } from "../context";
import type { BetterAuthErrorPayload } from "../errors";
import type { BetterAuthMetricsConfig } from "../instrumentation";
import type { RetryPolicy, TimeoutPolicy } from "./call-better-auth";
import { callBetterAuth } from "./call-better-auth";
import type { ToastMessageOverrides, ToastMessages } from "./toast";
import { decorateWithToast } from "./toast";

export interface RetryPolicyConfig {
  readonly maxAttempts?: number;
  readonly baseDelay?: Duration.DurationInput;
  readonly factor?: number;
  readonly isRetryable?: (error: IamError) => boolean;
}

export interface TimeoutPolicyConfig {
  readonly duration: Duration.DurationInput;
  readonly message?: string;
}

export interface BetterAuthToastConfig<Output, ExtraArgs extends Array<unknown>> {
  readonly defaults: ToastMessages<Output, IamError, ExtraArgs>;
  readonly overrides?: ToastMessageOverrides<Output, IamError, ExtraArgs>;
}

type BetterAuthToastInput<Output, ExtraArgs extends Array<unknown>> =
  | BetterAuthToastConfig<Output, ExtraArgs>
  | ToastMessages<Output, IamError, ExtraArgs>;

interface CommonBetterAuthHandlerConfig<Input, Encoded, Output, ExtraArgs extends Array<unknown>, OnSuccessR> {
  readonly name: string;
  readonly plugin: string;
  readonly method: string;
  readonly run: (encoded: Encoded, signal: AbortSignal) => Promise<BetterAuthErrorPayload | { readonly data: Output }>;
  readonly toast?: BetterAuthToastInput<Output, ExtraArgs>;
  readonly onSuccess?: (output: Output, input: Input) => Effect.Effect<unknown, never, OnSuccessR>;
  readonly retry?: RetryPolicyConfig;
  readonly timeout?: TimeoutPolicyConfig;
  readonly metrics?: BetterAuthMetricsConfig;
  readonly annotations?: Readonly<Record<string, unknown>>;
  readonly tracing?: "traced" | "untraced";
  readonly semaphoreKey?: string;
  readonly fiberContext?: Partial<HandlerFiberContext>;
  readonly defaultErrorMessage?: string;
}

interface HandlerWithSchema<Input, Encoded, SchemaR, Output, ExtraArgs extends Array<unknown>, OnSuccessR>
  extends CommonBetterAuthHandlerConfig<Input, Encoded, Output, ExtraArgs, OnSuccessR> {
  readonly schema: S.Schema<Input, Encoded, SchemaR>;
  readonly prepare?: undefined;
}

interface HandlerWithPrepare<Input, Encoded, SchemaR, Output, ExtraArgs extends Array<unknown>, PrepareR, OnSuccessR>
  extends CommonBetterAuthHandlerConfig<Input, Encoded, Output, ExtraArgs, OnSuccessR> {
  readonly schema?: S.Schema<Input, Encoded, SchemaR>;
  readonly prepare: (input: Input) => Effect.Effect<Encoded, IamError, PrepareR>;
}

interface IdentityHandler<Input, Output, ExtraArgs extends Array<unknown>, OnSuccessR>
  extends CommonBetterAuthHandlerConfig<Input, Input, Output, ExtraArgs, OnSuccessR> {
  readonly schema?: undefined;
  readonly prepare?: undefined;
}

export type BetterAuthHandlerConfig<
  Input,
  Encoded = Input,
  SchemaR = never,
  Output = void,
  ExtraArgs extends Array<unknown> = [],
  PrepareR = never,
  OnSuccessR = never,
> =
  | HandlerWithSchema<Input, Encoded, SchemaR, Output, ExtraArgs, OnSuccessR>
  | HandlerWithPrepare<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR>
  | IdentityHandler<Input, Output, ExtraArgs, OnSuccessR>;

export type BetterAuthHandler<Input, ExtraArgs extends Array<unknown> = [], R = never> = (
  input: Input,
  ...extra: ExtraArgs
) => Effect.Effect<void, never, R>;

type AnyConfig<
  Input,
  Encoded,
  SchemaR,
  Output,
  ExtraArgs extends Array<unknown>,
  PrepareR,
  OnSuccessR,
> = BetterAuthHandlerConfig<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR>;

const isPrepareConfig = <Input, Encoded, SchemaR, Output, ExtraArgs extends Array<unknown>, PrepareR, OnSuccessR>(
  config: AnyConfig<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR>
): config is HandlerWithPrepare<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR> =>
  "prepare" in config && typeof config.prepare === "function";

const isSchemaConfig = <Input, Encoded, SchemaR, Output, ExtraArgs extends Array<unknown>, PrepareR, OnSuccessR>(
  config: AnyConfig<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR>
): config is HandlerWithSchema<Input, Encoded, SchemaR, Output, ExtraArgs, OnSuccessR> =>
  "schema" in config && config.schema !== undefined && !isPrepareConfig(config);

const isIdentityConfig = <Input, Encoded, SchemaR, Output, ExtraArgs extends Array<unknown>, PrepareR, OnSuccessR>(
  config: AnyConfig<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR>
): config is IdentityHandler<Input, Output, ExtraArgs, OnSuccessR> =>
  !isPrepareConfig(config) && !isSchemaConfig(config);

const toIamSchemaError = (error: unknown, plugin: string, method: string): IamError =>
  new IamErrorConstructor(error, `Failed to prepare Better Auth handler input for ${plugin}.${method}`, {
    plugin,
    method,
  });

const isToastConfig = <Output, ExtraArgs extends Array<unknown>>(
  toast: BetterAuthToastInput<Output, ExtraArgs>
): toast is BetterAuthToastConfig<Output, ExtraArgs> => "defaults" in toast;

const normalizeToastConfig = <Output, ExtraArgs extends Array<unknown>>(
  toast: BetterAuthToastInput<Output, ExtraArgs> | undefined
): BetterAuthToastConfig<Output, ExtraArgs> | undefined => {
  if (!toast) {
    return undefined;
  }

  return isToastConfig(toast) ? toast : { defaults: toast };
};

const createHandlerEffect =
  <Input, Encoded, Output, ExtraArgs extends Array<unknown>, EncodeR, OnSuccessR>(
    config: CommonBetterAuthHandlerConfig<Input, Encoded, Output, ExtraArgs, OnSuccessR>,
    encode: (input: Input) => Effect.Effect<Encoded, IamError, EncodeR>
  ) =>
  (callContext: Parameters<typeof callBetterAuth>[0]) =>
    function* (input: Input, ...extra: ExtraArgs) {
      const baseEffect: Effect.Effect<Output, IamError, EncodeR | OnSuccessR> = encode(input).pipe(
        Effect.flatMap((encoded) => callBetterAuth<Output>(callContext, (signal) => config.run(encoded, signal))),
        Effect.flatMap((output) => {
          const onSuccess = config.onSuccess;
          return onSuccess ? onSuccess(output, input).pipe(Effect.as(output)) : Effect.succeed<Output>(output);
        })
      );

      const toastConfig = normalizeToastConfig(config.toast);
      const decorated: Effect.Effect<Output, IamError, EncodeR | OnSuccessR> = toastConfig
        ? decorateWithToast<Output, IamError, ExtraArgs, EncodeR | OnSuccessR>(toastConfig)(baseEffect, ...extra)
        : baseEffect;

      const swallowed: Effect.Effect<void, never, EncodeR | OnSuccessR> = decorated.pipe(
        Effect.catchAll(() => Effect.succeed<Output | undefined>(undefined)),
        Effect.asVoid
      );

      return yield* swallowed;
    };

const buildRetryPolicy = (config: RetryPolicyConfig | undefined): RetryPolicy | undefined => {
  if (!config) {
    return undefined;
  }

  const { maxAttempts, baseDelay = "100 millis", factor = 2, isRetryable } = config;

  if (maxAttempts !== undefined && maxAttempts <= 1) {
    return undefined;
  }

  let schedule: Schedule.Schedule<unknown, IamError, never> = Schedule.identity<IamError>();

  if (isRetryable) {
    schedule = schedule.pipe(Schedule.check(isRetryable));
  }

  schedule = schedule.pipe(Schedule.zipRight(Schedule.exponential(baseDelay, factor)));

  if (maxAttempts !== undefined) {
    schedule = schedule.pipe(Schedule.zipRight(Schedule.recurs(maxAttempts - 1)));
  }

  return {
    schedule: Schedule.asVoid(schedule),
  } satisfies RetryPolicy;
};

const buildTimeoutPolicy = (config: TimeoutPolicyConfig | undefined): TimeoutPolicy | undefined =>
  config ? { duration: config.duration, message: config.message } : undefined;

export const createBetterAuthHandler = <
  Input,
  Encoded = Input,
  SchemaR = never,
  Output = void,
  ExtraArgs extends Array<unknown> = [],
  PrepareR = never,
  OnSuccessR = never,
>(
  config: BetterAuthHandlerConfig<Input, Encoded, SchemaR, Output, ExtraArgs, PrepareR, OnSuccessR>
): BetterAuthHandler<Input, ExtraArgs, SchemaR | PrepareR | OnSuccessR> => {
  const retryPolicy = buildRetryPolicy(config.retry);
  const timeoutPolicy = buildTimeoutPolicy(config.timeout);

  const callContext = {
    plugin: config.plugin,
    method: config.method,
    annotations: config.annotations,
    metrics: config.metrics,
    retry: retryPolicy,
    timeout: timeoutPolicy,
    defaultErrorMessage: config.defaultErrorMessage,
    semaphoreKey: config.semaphoreKey,
    requestContext: config.fiberContext ? { fiberContext: config.fiberContext } : undefined,
  } as const;

  const buildHandler = <TargetEncoded, EncodeR>(
    targetConfig: CommonBetterAuthHandlerConfig<Input, TargetEncoded, Output, ExtraArgs, OnSuccessR>,
    encode: (input: Input) => Effect.Effect<TargetEncoded, IamError, EncodeR>
  ): BetterAuthHandler<Input, ExtraArgs, EncodeR | OnSuccessR> => {
    const handlerEffect = createHandlerEffect(targetConfig, encode)(callContext);

    const raw =
      targetConfig.tracing === "untraced"
        ? Effect.fnUntraced(handlerEffect)
        : Effect.fn(targetConfig.name)(handlerEffect);

    return (input, ...extra) => raw(input, ...extra);
  };

  if (isPrepareConfig(config)) {
    return buildHandler<Encoded, PrepareR>(config, config.prepare);
  }

  if (isSchemaConfig(config)) {
    const encode = (input: Input) =>
      S.encode(config.schema)(input).pipe(
        Effect.mapError((error) => toIamSchemaError(error, config.plugin, config.method))
      );
    return buildHandler<Encoded, SchemaR>(config, encode);
  }

  if (isIdentityConfig(config)) {
    const encode = (input: Input) => Effect.succeed(input);
    return buildHandler<Input, never>(config, encode);
  }

  const exhaustive: never = config;
  return exhaustive;
};
