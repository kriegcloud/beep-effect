import type { UnsafeTypes } from "@beep/types";
import { tagPropIs } from "@beep/utils";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import type { Registry } from "@effect-atom/atom-react";
import { Atom, RegistryContext, Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import type * as S from "effect/Schema";
import * as React from "react";
export const prefixLogs =
  (prefix: string) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
    Effect.annotateLogs(effect, "__prefix", prefix);

const prettyLoggerWithPrefix: Layer.Layer<never> = Logger.replace(
  Logger.defaultLogger,
  Logger.prettyLogger().pipe(
    Logger.mapInputOptions((options) => {
      const prefixAnnotation = HashMap.get(options.annotations, "__prefix");
      if (tagPropIs(prefixAnnotation, "Some")) {
        const prefix = String(prefixAnnotation.value);
        const newAnnotations = HashMap.remove(options.annotations, "__prefix");

        const messageArray = Array.isArray(options.message) ? options.message : [options.message];
        const prefixedMessages =
          messageArray.length > 0 ? [`[${prefix}] ${messageArray[0]}`, ...messageArray.slice(1)] : [`[${prefix}]`];

        return {
          ...options,
          message: prefixedMessages,
          annotations: newAnnotations,
        };
      }
      return options;
    })
  )
);

export const makeAtomRuntime = Atom.context({ memoMap: Atom.defaultMemoMap });
makeAtomRuntime.addGlobalLayer(
  Layer.mergeAll(prettyLoggerWithPrefix, FetchHttpClient.layer, Logger.minimumLogLevel(LogLevel.Debug))
);

export const useAtomRegistry = (): Registry.Registry => {
  return React.useContext(RegistryContext);
};

export const isResultLoading = <A, E>(result: Result.Result<A, E>) => result.waiting && tagPropIs(result, "Initial");

export const AtomValue = <A>({ atom, children }: { atom: Atom.Atom<A>; children: (value: A) => React.ReactNode }) => {
  const value = useAtomValue(atom);
  return children(value);
};

export const AtomOrThrow = <A, E>({
  atom,
  children,
}: {
  atom: Atom.Atom<Result.Result<A, E>>;
  children: (value: A) => React.ReactNode;
}) => {
  const value = useAtomValue(atom);
  return children(Result.getOrThrow(value));
};

export const useAtomInterrupt = (atom: Atom.Writable<unknown, unknown>) => {
  const set = useAtomSet(atom);
  return React.useCallback(() => {
    set(Atom.Interrupt);
  }, [set]);
};

export interface TypedSerializable<A, I> {
  readonly [Atom.SerializableTypeId]: {
    readonly key: string;
    readonly encode: (value: A) => I;
    readonly decode: (value: I) => A;
  };
}

export const serializable: {
  <R extends Atom.Atom<UnsafeTypes.UnsafeAny>, I>(options: {
    readonly key: string;
    readonly schema: S.Schema<Atom.Type<R>, I>;
  }): (self: R) => R & TypedSerializable<Atom.Type<R>, I>;
  <R extends Atom.Atom<UnsafeTypes.UnsafeAny>, I>(
    self: R,
    options: {
      readonly key: string;
      readonly schema: S.Schema<Atom.Type<R>, I>;
    }
  ): R & TypedSerializable<Atom.Type<R>, I>;
} = Atom.serializable as UnsafeTypes.UnsafeAny;

export const dehydrate = <A, I>(
  atom: Atom.Atom<A> & TypedSerializable<A, I>,
  value: A
): {
  readonly key: string;
  readonly value: NonNullable<unknown>;
  readonly dehydratedAt: number;
} => ({
  key: atom[Atom.SerializableTypeId].key,
  value: atom[Atom.SerializableTypeId].encode(value) as NonNullable<unknown>,
  dehydratedAt: F.pipe(DateTime.unsafeNow(), DateTime.toEpochMillis),
});
