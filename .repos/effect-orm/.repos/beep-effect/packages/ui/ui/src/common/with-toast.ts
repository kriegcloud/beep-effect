import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { toast } from "sonner";

type ToastOptions<A, E, Args extends ReadonlyArray<unknown>> = {
  onWaiting: string | ((...args: Args) => string);
  onSuccess: string | ((a: A, ...args: Args) => string);
  onFailure: string | ((error: E, ...args: Args) => string);
  onDefect?: (string | ((...args: Args) => string)) | undefined;
};

export const withToast = <A, E, Args extends Array<unknown>, R>(options: ToastOptions<A, E, Args>) => {
  return (self: Effect.Effect<A, E, R>, ...args: Args) =>
    Effect.gen(function* () {
      const toastId = toast.loading(
        typeof options.onWaiting === "string" ? options.onWaiting : options.onWaiting(...args)
      );
      return yield* self.pipe(
        Effect.tap((a) => {
          toast.success(typeof options.onSuccess === "string" ? options.onSuccess : options.onSuccess(a, ...args), {
            id: toastId,
          });
        }),
        Effect.tapErrorCause((cause) =>
          Effect.sync(() => {
            toast.error(
              Cause.failureOption(cause).pipe(
                O.match({
                  onNone: () =>
                    options.onDefect
                      ? typeof options.onDefect === "string"
                        ? options.onDefect
                        : options.onDefect(...args)
                      : "An unknown error occurred",
                  onSome: (e) =>
                    typeof options.onFailure === "string" ? options.onFailure : options.onFailure(e, ...args),
                })
              ),
              { id: toastId }
            );
          })
        )
      );
    });
};
