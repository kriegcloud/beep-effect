/**
 * @fileoverview Interactive environment variable configuration command
 *
 * Guides users through creating or updating a .env file by reading existing
 * .env and .env.example files, prompting for missing required variables,
 * offering defaults from .env.example, and writing the completed configuration.
 *
 * @module @beep/tooling-cli/commands/env
 * @since 1.0.0
 * @category Commands
 *
 * @example
 * ```typescript
 * import { envCommand } from "@beep/tooling-cli/commands/env"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Run interactive env configuration
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([envCommand])
 * )
 *
 * // User is prompted for:
 * // - OAuth provider credentials (required)
 * // - Missing variables from .env.example
 * ```
 */

import { DotEnv, type EnvironmentVariableName, parseEnv } from "@beep/tooling-utils";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as CliCommand from "@effect/cli/Command";
import * as Prompt from "@effect/cli/Prompt";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import type { QuitException } from "@effect/platform/Terminal";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import color from "picocolors";

type EnvMap = HashMap.HashMap<EnvironmentVariableName.Type, string>;

const manualKeys = [
  "OAUTH_PROVIDER_GOOGLE_CLIENT_ID",
  "OAUTH_PROVIDER_GOOGLE_CLIENT_SECRET",
  "OAUTH_PROVIDER_MICROSOFT_CLIENT_ID",
  "OAUTH_PROVIDER_MICROSOFT_CLIENT_SECRET",
] as const;
const emptyEnvMap: EnvMap = HashMap.empty<EnvironmentVariableName.Type, string>();

const formatKey = (key: EnvironmentVariableName.Type): string => color.yellow(key);

const formatMessage = (prefix: string, key: EnvironmentVariableName.Type): string =>
  F.pipe(prefix, Str.concat(formatKey(key)));

const parseContent = (raw: string): EnvMap => parseEnv(raw);

const readEnvMap = (fs: FileSystem.FileSystem, targetPath: string, options: { readonly allowMissing: boolean }) =>
  Effect.gen(function* () {
    const exists = yield* fs.exists(targetPath);

    if (!exists) {
      if (options.allowMissing) {
        return emptyEnvMap;
      }
      return yield* Effect.fail(new Error(`Missing required file: ${targetPath}`));
    }

    const content = yield* fs.readFileString(targetPath);
    return parseContent(content);
  });

const getValueWithFallback = (primary: EnvMap, fallback: EnvMap, key: EnvironmentVariableName.Type): string =>
  F.pipe(
    primary,
    HashMap.get(key),
    O.orElse(() => F.pipe(fallback, HashMap.get(key))),
    O.getOrElse(() => "")
  );

const runValuePrompt = (
  key: EnvironmentVariableName.Type,
  defaultValue: string,
  options: { readonly required: boolean; readonly accent?: string }
) => {
  const message = F.pipe(
    formatMessage("Enter value for ", key),
    Str.concat(options.accent ? F.pipe(" (", Str.concat(options.accent), Str.concat(")")) : "")
  );

  const baseOptions = {
    message,
    default: defaultValue,
  } as const;

  const prompt = options.required
    ? Prompt.text({
        ...baseOptions,
        validate: (value: string) =>
          F.pipe(
            value,
            Str.trim,
            Str.isNonEmpty,
            Bool.match({
              onTrue: () => Effect.succeed(value),
              onFalse: () => Effect.fail("A value is required."),
            })
          ),
      })
    : Prompt.text(baseOptions);

  return Prompt.run(prompt).pipe(
    Effect.map(Str.trim),
    Effect.map((value) => (Str.isEmpty(value) ? defaultValue : value))
  );
};

const promptForKeys = (
  keys: ReadonlyArray<EnvironmentVariableName.Type>,
  initialMap: EnvMap,
  fallback: EnvMap,
  options: { readonly required: boolean; readonly accent?: string }
) => {
  function loop(
    remaining: ReadonlyArray<EnvironmentVariableName.Type>,
    current: EnvMap
  ): Effect.Effect<EnvMap, QuitException, FileSystem.FileSystem | Path.Path | Prompt.Prompt.Environment> {
    return F.pipe(
      remaining,
      A.match({
        onEmpty: () => Effect.succeed(current),
        onNonEmpty: (self) => {
          const [head, ...tailArray] = self;
          const tail = tailArray;
          return runValuePrompt(head, getValueWithFallback(current, fallback, head), options).pipe(
            Effect.flatMap((value) => loop(tail, HashMap.set(head, value)(current)))
          );
        },
      })
    );
  }

  return loop(keys, initialMap);
};

const hashMapKeys = (map: EnvMap): ReadonlyArray<EnvironmentVariableName.Type> =>
  F.pipe(map, HashMap.keys, A.fromIterable);

const findMissingKeys = (current: EnvMap, reference: EnvMap): ReadonlyArray<EnvironmentVariableName.Type> =>
  F.pipe(
    reference,
    hashMapKeys,
    A.filter((key) => F.pipe(current, HashMap.get(key), O.isNone))
  );

const logMissingSummary = (keys: ReadonlyArray<EnvironmentVariableName.Type>, reference: EnvMap) =>
  Effect.gen(function* () {
    if (A.length(keys) === 0) {
      return yield* Console.log(color.green("No missing environment variables detected."));
    }

    yield* Console.log(color.yellow("Missing variables detected in your .env file:"));
    yield* Effect.forEach(
      keys,
      (key) => {
        const preview = F.pipe(
          reference,
          HashMap.get(key),
          O.getOrElse(() => "")
        );
        const valueLabel = Str.isEmpty(preview) ? color.gray("<empty>") : preview;
        return Console.log(`${key}=${valueLabel}`);
      },
      { discard: true }
    );
  });

const writeEnvFile = (fs: FileSystem.FileSystem, targetPath: string, map: EnvMap) =>
  Effect.gen(function* () {
    const instance = DotEnv.make({ env: map });
    const encoded = yield* S.encode(DotEnv)(instance);
    yield* fs.writeFileString(targetPath, encoded.env);
  });

const handleEnvCommand = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const repoRoot = yield* findRepoRoot;

  const envPath = path.join(repoRoot, ".env");
  const examplePath = path.join(repoRoot, ".env.example");

  const currentEnv = yield* readEnvMap(fs, envPath, { allowMissing: true });
  const exampleEnv = yield* readEnvMap(fs, examplePath, { allowMissing: false });

  const manualUpdated = yield* promptForKeys(manualKeys, currentEnv, exampleEnv, {
    required: true,
    accent: "required",
  });

  const missingKeys = findMissingKeys(manualUpdated, exampleEnv);
  yield* logMissingSummary(missingKeys, exampleEnv);

  const completedEnv = yield* promptForKeys(missingKeys, manualUpdated, exampleEnv, {
    required: false,
    accent: "example default available",
  });

  yield* writeEnvFile(fs, envPath, completedEnv);

  yield* Console.log(color.green(F.pipe("Environment variables saved to ", Str.concat(color.cyan(envPath)))));
});

/**
 * Interactive environment variable configuration command.
 *
 * Guides the user through creating or updating a .env file by:
 * - Reading existing .env and .env.example files
 * - Prompting for missing required variables
 * - Offering defaults from .env.example
 * - Writing the completed configuration
 *
 * @example
 * ```ts
 * import { envCommand } from "@beep/repo-cli/commands/env"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Run the env command
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([envCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const envCommand = CliCommand.make("env", {}, () => handleEnvCommand).pipe(
  CliCommand.withDescription("Interactively create or update your .env file.")
);
