import { Registry } from "@effect-atom/atom-react";
import type * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import { type ExternalToast, toast } from "sonner";

type StateCommon = string;

export type OnWaiting<Args> =
  | StateCommon
  | ((args: { readonly registry: Registry.Registry; readonly args: Args }) => StateCommon);

export type OnSuccess<A, Args> =
  | StateCommon
  | ((args: { readonly registry: Registry.Registry; readonly result: A; args: Args }) => StateCommon);

export type OnFailure<E, Args> =
  | StateCommon
  | ((args: {
      readonly registry: Registry.Registry;
      readonly cause: Cause.Cause<E>;
      readonly args: Args;
    }) => O.Option<StateCommon>);

export type ToastOpts<A, E, Args extends ReadonlyArray<unknown>> = {
  readonly onWaiting: OnWaiting<Args>;
  readonly onSuccess: OnSuccess<A, Args>;
  readonly onFailure: OnFailure<E, Args>;
  readonly options?: undefined | Omit<ExternalToast, "id">;
};

export const toastEffect =
  <A, E, Args extends ReadonlyArray<unknown>, R>(options: ToastOpts<A, E, Args>) =>
  (self: Effect.Effect<A, E, R>, ...args: Args) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      const toastId = toast.loading(
        P.isFunction(options.onWaiting) ? options.onWaiting({ registry, args }) : options.onWaiting,
        options.options
      );
      const result = yield* self.pipe(
        Effect.tapErrorCause((cause) =>
          Effect.sync(() => {
            const message = P.isFunction(options.onFailure)
              ? options.onFailure({ registry, cause, args })
              : options.onFailure;
            if (O.isOption(message) && O.isNone(message)) return toast.dismiss(toastId);
            toast.error(O.isOption(message) ? message.value : message, {
              id: toastId,
              ...options.options,
            });
            return;
          })
        )
      );
      const message = P.isFunction(options.onSuccess)
        ? options.onSuccess({ registry, result, args })
        : options.onSuccess;
      toast.success(message, { id: toastId, ...options.options });
      return result;
    });
