import {
  Atom,
  type Registry,
  RegistryContext,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
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
      if (prefixAnnotation._tag === "Some") {
        const prefix = String(prefixAnnotation.value);
        const newAnnotations = HashMap.remove(options.annotations, "__prefix");

        const messageArray = Array.isArray(options.message) ? options.message : [options.message];
        const prefixedMessages =
          messageArray.length > 0
            ? [`[${prefix}] ${messageArray[0]}`, ...messageArray.slice(1)]
            : [`[${prefix}]`];

        return {
          ...options,
          message: prefixedMessages,
          annotations: newAnnotations,
        };
      }
      return options;
    }),
  ),
);

export const makeAtomRuntime = Atom.context({ memoMap: Atom.defaultMemoMap });
makeAtomRuntime.addGlobalLayer(
  Layer.mergeAll(
    prettyLoggerWithPrefix,
    FetchHttpClient.layer,
    Logger.minimumLogLevel(LogLevel.Debug),
  ),
);

export const useAtomRegistry = (): Registry.Registry => {
  return React.useContext(RegistryContext);
};

export const isResultLoading = <A, E>(result: Result.Result<A, E>) =>
  result.waiting && result._tag === "Initial";

export const AtomValue = <A>({
  atom,
  children,
}: {
  atom: Atom.Atom<A>;
  children: (value: A) => React.ReactNode;
}) => {
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
