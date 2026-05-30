/**
 * Environment file resolution and provider environment merging.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SandboxId } from "@beep/identity";
import { A, Str, Struct } from "@beep/utils";
import { Effect, FileSystem, HashSet, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { InitError } from "./Sandbox.errors.ts";

const $I = $SandboxId.create("Env");
const emptyEnv: Record<string, string> = {};

/**
 * Provider environment merge options.
 *
 * @example
 * ```ts
 * import { MergeProviderEnvOptions } from "@beep/sandbox/Env"
 *
 * console.log(MergeProviderEnvOptions)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class MergeProviderEnvOptions extends S.Class<MergeProviderEnvOptions>($I`MergeProviderEnvOptions`)(
  {
    agentProviderEnv: S.Record(S.String, S.String),
    resolvedEnv: S.Record(S.String, S.String),
    sandboxProviderEnv: S.Record(S.String, S.String),
  },
  $I.annote("MergeProviderEnvOptions", {
    description: "Provider environment merge options.",
  })
) {}

const parseEnvLine = (line: string): O.Option<readonly [string, string]> => {
  const trimmed = Str.trim(line);
  if (trimmed.length === 0 || Str.startsWith("#")(trimmed)) {
    return O.none();
  }

  const separatorIndex = pipe(trimmed, Str.indexOf("="));
  if (O.isNone(separatorIndex)) {
    return O.none();
  }

  const key = pipe(trimmed, Str.slice(0, separatorIndex.value), Str.trim);
  const rawValue = pipe(trimmed, Str.slice(separatorIndex.value + 1), Str.trim);
  const value =
    rawValue.length >= 2 &&
    ((Str.startsWith('"')(rawValue) && Str.endsWith('"')(rawValue)) ||
      (Str.startsWith("'")(rawValue) && Str.endsWith("'")(rawValue)))
      ? Str.slice(1, -1)(rawValue)
      : rawValue;

  return key.length === 0 ? O.none() : O.some([key, value] as const);
};

const parseEnvFile = (content: string): Record<string, string> => {
  const entries = A.empty<readonly [string, string]>();

  for (const line of Str.split("\n")(content)) {
    const parsed = parseEnvLine(line);
    if (O.isSome(parsed)) {
      A.appendInPlace(entries, parsed.value);
    }
  }

  return Struct.fromEntries(entries);
};

/**
 * Resolve declared sandbox environment variables from `.sandcastle/.env`.
 *
 * @example
 * ```ts
 * import { resolveEnv } from "@beep/sandbox/Env"
 *
 * console.log(resolveEnv)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const resolveEnv = Effect.fn("Env.resolveEnv")(function* (
  repoDir: string,
  runtimeEnv: NodeJS.ProcessEnv = process.env
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const envPath = path.join(repoDir, ".sandcastle", ".env");
  const declared = yield* fs.readFileString(envPath).pipe(
    Effect.map(parseEnvFile),
    Effect.orElseSucceed(() => emptyEnv)
  );
  const resolved = R.empty<string, string>();

  for (const [key, value] of Struct.entries(declared)) {
    const fallback = runtimeEnv[key];
    if (value.length > 0) {
      resolved[key] = value;
    } else if (fallback !== undefined && fallback.length > 0) {
      resolved[key] = fallback;
    }
  }

  return resolved;
});

/**
 * Merge resolved environment variables with agent and sandbox provider env.
 *
 * @example
 * ```ts
 * import { mergeProviderEnv } from "@beep/sandbox/Env"
 *
 * console.log(mergeProviderEnv)
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mergeProviderEnv = Effect.fn("Env.mergeProviderEnv")(function* (options: MergeProviderEnvOptions) {
  const sandboxKeys = HashSet.fromIterable(Struct.keys(options.sandboxProviderEnv));
  const overlapping = pipe(
    Struct.keys(options.agentProviderEnv),
    A.filter((key) => HashSet.has(sandboxKeys, key))
  );

  if (overlapping.length > 0) {
    return yield* InitError.new(
      "provider environment conflict",
      `Overlapping env keys between agent provider and sandbox provider: ${A.join(overlapping, ", ")}`
    );
  }

  return {
    ...options.resolvedEnv,
    ...options.sandboxProviderEnv,
    ...options.agentProviderEnv,
  };
});
