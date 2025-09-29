import { withToast } from "@beep/ui/common";
import type * as Effect from "effect/Effect";
import * as Option from "effect/Option";

interface ToastFailureMatcher<E, ExtraArgs extends Array<unknown>> {
  readonly onNone: (...args: ExtraArgs) => string;
  readonly onSome: (error: E, ...args: ExtraArgs) => string;
}

type ToastFailureHandler<E, ExtraArgs extends Array<unknown>> =
  | string
  | ((error: Option.Option<E>, ...args: ExtraArgs) => string)
  | ((error: Option.Option<E>, ...args: ExtraArgs) => ToastFailureMatcher<E, ExtraArgs>)
  | ToastFailureMatcher<E, ExtraArgs>;

export interface ToastMessages<Output, E, ExtraArgs extends Array<unknown>> {
  readonly onWaiting: string | ((...args: ExtraArgs) => string);
  readonly onSuccess: string | ((output: Output, ...args: ExtraArgs) => string);
  readonly onFailure: ToastFailureHandler<E, ExtraArgs>;
}

export type ToastMessageOverrides<Output, E, ExtraArgs extends Array<unknown>> = {
  readonly [K in keyof ToastMessages<Output, E, ExtraArgs>]?: ToastMessages<Output, E, ExtraArgs>[K];
};

export interface ToastDecoratorConfig<Output, E, ExtraArgs extends Array<unknown>> {
  readonly defaults: ToastMessages<Output, E, ExtraArgs>;
  readonly overrides?: ToastMessageOverrides<Output, E, ExtraArgs>;
}

const isFailureMatcher = <E, ExtraArgs extends Array<unknown>>(
  value: unknown
): value is ToastFailureMatcher<E, ExtraArgs> =>
  typeof value === "object" &&
  value !== null &&
  "onNone" in value &&
  "onSome" in value &&
  typeof (value as ToastFailureMatcher<E, ExtraArgs>).onNone === "function" &&
  typeof (value as ToastFailureMatcher<E, ExtraArgs>).onSome === "function";

const resolveToastFailure = <E, ExtraArgs extends Array<unknown>>(
  handler: ToastFailureHandler<E, ExtraArgs>,
  error: Option.Option<E>,
  args: ExtraArgs
): string => {
  if (typeof handler === "string") {
    return handler;
  }

  const result = typeof handler === "function" ? handler(error, ...args) : handler;

  if (typeof result === "string") {
    return result;
  }

  if (isFailureMatcher<E, ExtraArgs>(result)) {
    return Option.match(error, {
      onNone: () => result.onNone(...args),
      onSome: (value) => result.onSome(value, ...args),
    });
  }

  throw new Error("Invalid toast failure handler configuration");
};

export const mergeToastMessages = <Output, E, ExtraArgs extends Array<unknown>, R>(
  defaults: ToastMessages<Output, E, ExtraArgs>,
  overrides: ToastMessageOverrides<Output, E, ExtraArgs> | undefined
): ToastMessages<Output, E, ExtraArgs> => ({
  onWaiting: overrides?.onWaiting ?? defaults.onWaiting,
  onSuccess: overrides?.onSuccess ?? defaults.onSuccess,
  onFailure: overrides?.onFailure ?? defaults.onFailure,
});

export const decorateWithToast = <Output, E, ExtraArgs extends Array<unknown>, R>(
  config: ToastDecoratorConfig<Output, E, ExtraArgs>
): ((effect: Effect.Effect<Output, E, R>, ...args: ExtraArgs) => Effect.Effect<Output, E, R>) => {
  const messages = mergeToastMessages<Output, E, ExtraArgs, R>(config.defaults, config.overrides);
  const normalizedFailure =
    typeof messages.onFailure === "string"
      ? messages.onFailure
      : (error: Option.Option<E>, ...args: ExtraArgs) => resolveToastFailure(messages.onFailure, error, args);

  return (effect: Effect.Effect<Output, E, R>, ...args: ExtraArgs): Effect.Effect<Output, E, R> =>
    withToast<Output, E, ExtraArgs, R>({
      onWaiting: messages.onWaiting,
      onSuccess: messages.onSuccess,
      onFailure: normalizedFailure,
    })(effect, ...args);
};
