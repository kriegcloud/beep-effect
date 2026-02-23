import NextBundleAnalyzer from "@next/bundle-analyzer";
import { Config, Effect, pipe } from "effect";
import * as Eq from "effect/Equal";
import { constant } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import type { NextConfig } from "next";
export type BundleAnalyzerOptions = {
  readonly enabled: boolean | undefined;
  readonly openAnalyzer?: boolean;
  readonly analyzerMode?: "json" | "static";
  readonly logLevel?: "info" | "warn" | "error" | "silent" | undefined;
};
// NextBundleAnalyzer(options)(config)
export const withBundleAnalyzer = (options?: BundleAnalyzerOptions) =>
  Effect.fn("withBundleAnalyzer")(function* (config?: undefined | NextConfig) {
    const enabled = yield* pipe(
      options,
      O.fromNullable,
      O.flatMap(({ enabled }) => O.fromNullable(enabled)),
      O.liftPredicate(P.isBoolean),
      O.match({
        onNone: constant(
          Effect.gen(function* () {
            const env = yield* Config.string("ENV").pipe(Config.withDefault("prod"));
            return Eq.equals(env, "dev");
          })
        ),
        onSome: Effect.succeed,
      })
    );
    return NextBundleAnalyzer({
      ...options,
      enabled,
    })(config);
  });
