import { IamError } from "@beep/iam-sdk/errors";
import type { UnsafeTypes } from "@beep/types";
import type { BetterFetchOption } from "@better-fetch/fetch";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";
import type { FailureContinuationHandlers } from "./failure-continuation";

type Metadata = {
  readonly domain: string;
  readonly method: string;
  readonly extra?: R.ReadonlyRecord<string, UnsafeTypes.UnsafeAny> | undefined;
};

export class MetadataFactory extends Data.Class<Pick<Metadata, "domain" | "extra">> {
  readonly make: (method: Metadata["method"], extra?: Metadata["extra"]) => () => Metadata;

  constructor(domain: Metadata["domain"], extra?: Metadata["extra"]) {
    super({ domain, extra });
    this.make = (method: Metadata["method"], extra?: Metadata["extra"]) => () => ({
      domain: this.domain,
      method,
      extra: {
        ...this.extra,
        ...extra,
      },
    });
  }
}

export const mapOnError =
  (handlers: FailureContinuationHandlers) =>
  (error: unknown): void => {
    handlers.onError({ error });
  };

export const withFetchOptions = (
  handlers: FailureContinuationHandlers,
  extra?: Omit<BetterFetchOption, "onError" | "signal"> | undefined
) =>
  F.pipe(
    O.fromNullable(handlers.signal),
    O.match({
      onNone: () =>
        ({
          onError: mapOnError(handlers),
          ...extra,
        }) as const,
      onSome: (signal) => ({
        onError: mapOnError(handlers),
        signal,
        ...extra,
      }),
    })
  );

export const addFetchOptions = <A extends Record<string, unknown>>(
  handlers: FailureContinuationHandlers,
  body: A,
  extra?: Omit<BetterFetchOption, "onError" | "signal"> | undefined
) => ({
  ...body,
  fetchOptions: withFetchOptions(handlers, extra),
});

export const compact = <A extends Record<string, unknown>>(input: A) =>
  F.pipe(
    Struct.entries(input),
    A.filter(([_, value]) => value !== undefined),
    R.fromEntries
  ) as Partial<A>;

export const requireData = <T>(
  data: T,
  handlerName: string,
  metadata: Pick<Metadata, "domain" | "method">
): Effect.Effect<T, IamError> =>
  F.pipe(
    O.fromNullable(data),
    O.match({
      onNone: () => Effect.fail(new IamError({}, `${handlerName} returned no payload from Better Auth`, metadata)),
      onSome: Effect.succeed,
    })
  );
