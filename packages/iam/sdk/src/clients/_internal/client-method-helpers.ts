import { IamError } from "@beep/iam-sdk/errors";
import type { UnsafeTypes } from "@beep/types";
import type { BetterFetchOption } from "@better-fetch/fetch";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { FailureContinuationHandlers } from "./failure-continuation";

export class MetadataFactory extends Data.Class<{
  readonly plugin: string;
}> {
  readonly make: (method: string) => () => {
    readonly plugin: string;
    readonly method: string;
  };

  constructor(plugin: string) {
    super({ plugin });
    this.make = (method: string) => () => ({
      plugin: this.plugin,
      method,
    });
  }
}

export const makeMetadata = (method: string) => () =>
  ({
    plugin: "organization",
    method,
  }) as const;

export const mapOnError =
  (handlers: FailureContinuationHandlers) =>
  (error: unknown): void => {
    handlers.onError({ error });
  };

export const withFetchOptions = (
  handlers: FailureContinuationHandlers,
  extra?: Omit<BetterFetchOption, "onError" | "signal"> | undefined
) =>
  handlers.signal
    ? {
        onError: mapOnError(handlers),
        signal: handlers.signal,
        ...extra,
      }
    : {
        onError: mapOnError(handlers),
        ...extra,
      };

export const addFetchOptions = <A extends Record<string, unknown>>(
  handlers: FailureContinuationHandlers,
  body: A,
  extra?: Omit<BetterFetchOption, "onError" | "signal"> | undefined
) => ({
  ...body,
  fetchOptions: withFetchOptions(handlers, extra),
});

export const compact = <A extends Record<string, unknown>>(input: A) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as Partial<A>;

export const requireData = <T>(
  data: T,
  handlerName: string,
  metadata: { readonly plugin: string; readonly method: string }
): Effect.Effect<T, IamError> =>
  data == null
    ? Effect.fail(new IamError({}, `${handlerName} returned no payload from Better Auth`, metadata))
    : Effect.succeed(data);

export const decodeResult = <Schema extends S.Schema<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, never>>(
  schema: Schema,
  handlerName: string,
  data: unknown
): Effect.Effect<S.Schema.Type<Schema>, never, never> =>
  Effect.orDieWith(
    Effect.try({
      try: () => S.decodeUnknownSync(schema)(data),
      catch: (error) => error,
    }),
    (error) =>
      new Error(`${handlerName} failed to parse response: ${error instanceof Error ? error.message : String(error)}`)
  );
