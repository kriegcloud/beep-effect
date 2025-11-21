import type { Contract } from "@beep/contract";
import { IamError } from "@beep/iam-sdk/errors";
import type { StringTypes } from "@beep/types";
import type { BetterFetchOption } from "@better-fetch/fetch";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";

export const mapOnError =
  (handlers: Contract.FailureContinuationHandlers) =>
  (error: unknown): void => {
    handlers.onError({ error });
  };

export const withCaptchaHeaders = (captchaResponse: string) => ({
  headers: {
    "x-captcha-response": captchaResponse,
  },
});

export const withFetchOptions = (
  handlers: Contract.FailureContinuationHandlers,
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
  handlers: Contract.FailureContinuationHandlers,
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
  metadata: Pick<Contract.Metadata, "domain" | "method">
): Effect.Effect<T, IamError> =>
  F.pipe(
    O.fromNullable(data),
    O.match({
      onNone: () => Effect.fail(IamError.new({}, `${handlerName} returned no payload from Better Auth`, metadata)),
      onSome: Effect.succeed,
    })
  );

export const atomPromise = { mode: "promise" } as const;

export const withReactivityKeys = <Keys extends A.NonEmptyReadonlyArray<StringTypes.NonEmptyString>>(
  ...keys: Keys
) => ({
  reactivityKeys: keys,
});
