/**
 * Resolve Pulumi artifact paths against the workstation artifacts root.
 *
 * Stack files keep artifact paths relative (for example
 * `turbo-cache/2.12.0/turbo-cache.zip`) so no operator home path is ever
 * committed. The root comes from `BEEP_INFRA_ARTIFACTS_ROOT`, falling back to
 * `$HOME/beep-infra-artifacts`, and is resolved when the Pulumi program starts.
 *
 * @since 0.0.0
 */

import * as pulumi from "@pulumi/pulumi";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

const infraArtifactsRootEnvKey = "BEEP_INFRA_ARTIFACTS_ROOT";

/**
 * Process environment slice the artifact resolvers read.
 *
 * @category models
 * @since 0.0.0
 */
export type InfraPathEnv = Readonly<Record<string, string | undefined>>;

const isAbsolutePath = Str.startsWith("/");
const withoutTrailingSlashes = Str.replace(/\/+$/u, "");
const nonEmptyEnvValue = (env: InfraPathEnv, key: string): O.Option<string> =>
  pipe(O.fromUndefinedOr(env[key]), O.filter(Str.isNonEmpty));

const resolveInfraArtifactsRoot = (env: InfraPathEnv): string =>
  pipe(
    nonEmptyEnvValue(env, infraArtifactsRootEnvKey),
    O.orElse(() =>
      pipe(
        nonEmptyEnvValue(env, "HOME"),
        O.map((home) => `${home}/beep-infra-artifacts`)
      )
    ),
    O.filter(isAbsolutePath),
    O.map(withoutTrailingSlashes),
    O.getOrThrowWith(
      () =>
        new pulumi.RunError(
          `Relative artifact paths need an absolute ${infraArtifactsRootEnvKey} or HOME to resolve against`
        )
    )
  );

/**
 * Keep an absolute artifact path as configured, or resolve a relative one
 * against `BEEP_INFRA_ARTIFACTS_ROOT`, or `$HOME/beep-infra-artifacts`
 * when it is unset.
 *
 * @category utilities
 * @since 0.0.0
 */
export const resolveInfraArtifactPath =
  (env: InfraPathEnv) =>
  (path: string): string =>
    pipe(
      path,
      O.liftPredicate(isAbsolutePath),
      O.getOrElse(() => `${resolveInfraArtifactsRoot(env)}/${path}`)
    );
