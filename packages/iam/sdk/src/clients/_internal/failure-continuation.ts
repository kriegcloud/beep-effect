import type { IamErrorMetadata } from "@beep/iam-sdk/errors";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

export interface FailureContinuationContext {
  readonly contract: string;
  readonly metadata: () => Readonly<{
    readonly plugin?: string | undefined;
    readonly method?: string | undefined;
  }>;
}

export interface FailureContinuationOptions {
  readonly supportsAbort?: boolean | undefined;
}

export interface FailureContinuationHandlers {
  readonly signal?: AbortSignal | undefined;
  readonly onError: (ctx: { readonly error: unknown }) => void;
}

export interface FailureContinuation {
  readonly run: <A>(register: (handlers: FailureContinuationHandlers) => Promise<A>) => Effect.Effect<A, FailureError>;
  readonly raiseResult: (result: { readonly error: unknown | null | undefined }) => Effect.Effect<void, FailureError>;
}

type FailureError = InstanceType<typeof IamError>;

export const makeFailureContinuation = (
  ctx: FailureContinuationContext,
  options: FailureContinuationOptions = {}
): FailureContinuation => {
  const supportsAbort = options.supportsAbort ?? false;

  const computeMetadata = (): IamErrorMetadata => {
    const metadata = ctx.metadata();
    return {
      plugin: metadata.plugin,
      method: metadata.method,
    };
  };

  const normalize = (error: unknown): FailureError => IamError.match(error, computeMetadata());

  const annotate = <R, E, A>(effect: Effect.Effect<A, E, R>, metadata: IamErrorMetadata) =>
    effect.pipe(
      Effect.annotateLogs({
        contract: ctx.contract,
        plugin: metadata.plugin,
        method: metadata.method,
      })
    );

  const run: FailureContinuation["run"] = <A>(register: (handlers: FailureContinuationHandlers) => Promise<A>) => {
    const metadata = computeMetadata();
    const effect = Effect.async<A, FailureError>((resume) => {
      const controller = supportsAbort ? new AbortController() : undefined;
      let settled = false;

      const complete = (result: Effect.Effect<A, FailureError>): void => {
        if (settled) {
          return;
        }
        settled = true;
        if (supportsAbort && controller && !controller.signal.aborted) {
          controller.abort();
        }
        resume(result);
      };

      const handlers: FailureContinuationHandlers = controller
        ? {
            signal: controller.signal,
            onError: ({ error }) => {
              complete(Effect.fail(normalize(error)));
            },
          }
        : {
            onError: ({ error }) => {
              complete(Effect.fail(normalize(error)));
            },
          };

      try {
        const promise = register(handlers);
        promise.then(
          (value) => {
            complete(Effect.succeed(value));
          },
          (reason) => {
            complete(Effect.fail(normalize(reason)));
          }
        );
      } catch (cause) {
        complete(Effect.fail(normalize(cause)));
      }

      if (supportsAbort) {
        return Effect.sync(() => {
          if (controller && !controller.signal.aborted) {
            controller.abort();
          }
        });
      }
    });

    return annotate(effect, metadata);
  };

  const raiseResult: FailureContinuation["raiseResult"] = (result) => {
    if (result.error == null) {
      return Effect.void;
    }
    return Effect.fail(normalize(result.error));
  };

  return {
    run,
    raiseResult,
  };
};
