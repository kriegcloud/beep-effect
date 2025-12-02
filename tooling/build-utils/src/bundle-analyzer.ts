import type {NextConfig} from "next";
import {Effect, pipe} from "effect";
import * as S from "effect/Schema";
import NextBundleAnalyzer from "@next/bundle-analyzer";
import {EnvValue} from "@beep/constants";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import {constant} from "effect/Function";

export type BundleAnalyzerOptions = {
  readonly enabled: boolean | undefined,
  readonly openAnalyzer?: boolean
  readonly analyzerMode?: "json" | "static",
  readonly logLevel?: "info" | "warn" | "error" | "silent" | undefined
}
// NextBundleAnalyzer(options)(config)
export const withBundleAnalyzer = (options?: BundleAnalyzerOptions) =>
  (config?: undefined | NextConfig) =>
    Effect.gen(function* () {
      const enabled = yield* pipe(
        options,
        O.fromNullable,
        O.flatMap(({enabled}) => O.fromNullable(enabled)),
        O.liftPredicate(P.isBoolean),
        O.match({
          onNone: constant(Effect.gen(function* () {
            return EnvValue.is.dev(yield* S.Config("ENV", EnvValue));
          }).pipe(Effect.orDie)),
          onSome: Effect.succeed,
        })
      );
      return NextBundleAnalyzer({
        ...options,
        enabled,
      })(config);
    });