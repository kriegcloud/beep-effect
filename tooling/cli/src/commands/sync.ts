/**
 * @fileoverview Workspace environment synchronization command
 *
 * Synchronizes the root .env file to all workspace packages that require it
 * (apps/mail, apps/server) and regenerates TypeScript type definitions for
 * environment variables. Ensures consistency across the monorepo.
 *
 * @module @beep/tooling-cli/commands/sync
 * @since 1.0.0
 * @category Commands
 *
 * @example
 * ```typescript
 * import { syncCommand } from "@beep/tooling-cli/commands/sync"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Run synchronization
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([syncCommand])
 * )
 * ```
 */

import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as CliCommand from "@effect/cli/Command";
import * as ProcessCommand from "@effect/platform/Command";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import color from "picocolors";

const envCopies = ["apps/mail/.dev.vars", "apps/mail/.env", "apps/server/.dev.vars"] as const;

const typeTargets = [
  { label: "apps/mail", relativeDir: "apps/mail" },
  { label: "apps/server", relativeDir: "apps/server" },
] as const;

const copyEnvFile = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  envSourcePath: string,
  repoRoot: string,
  destinationRelative: string
) =>
  Effect.gen(function* () {
    const target = path.join(repoRoot, destinationRelative);
    const directory = path.dirname(target);
    yield* fs.makeDirectory(directory, { recursive: true });
    yield* Console.log(color.cyan(`Syncing env → ${destinationRelative}`));
    yield* fs.copy(envSourcePath, target);
  });

const runTypesCommand = (path: Path.Path, repoRoot: string, relativeDir: string) =>
  Effect.gen(function* () {
    const cwd = path.join(repoRoot, relativeDir);
    yield* Console.log(color.cyan(`Running bun run types in ${relativeDir}`));
    const command = F.pipe(
      ProcessCommand.make("bun", "run", "types"),
      ProcessCommand.workingDirectory(cwd),
      ProcessCommand.stdout("inherit"),
      ProcessCommand.stderr("inherit")
    );
    const exitCode = Number(yield* ProcessCommand.exitCode(command));
    if (exitCode !== 0) {
      return yield* Effect.fail(new Error(`Types generation failed in ${relativeDir} (exit ${exitCode}).`));
    }
  });

const handleSyncCommand = Effect.gen(function* () {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const repoRoot = yield* findRepoRoot;

  const envPath = path.join(repoRoot, ".env");
  const envExists = yield* fs.exists(envPath);
  if (!envExists) {
    yield* Console.log(color.red("No .env file exists. Run `beep env` before syncing."));
    return yield* Effect.fail(new Error("Missing .env file."));
  }

  yield* Effect.forEach(envCopies, (destination) => copyEnvFile(fs, path, envPath, repoRoot, destination), {
    discard: true,
  });

  yield* Effect.forEach(typeTargets, (target) => runTypesCommand(path, repoRoot, target.relativeDir), {
    discard: true,
  });

  yield* Console.log(color.green("Environment variables and generated types are synced."));
});

/**
 * Synchronizes environment variables and generated types across workspaces.
 *
 * Copies the root .env file to all workspace packages and regenerates TypeScript
 * type definitions for environment variables, ensuring consistency across the monorepo.
 *
 * @example
 * ```ts
 * import { syncCommand } from "@beep/repo-cli/commands/sync"
 * import * as CliCommand from "@effect/cli/Command"
 *
 * // Add to CLI
 * const cli = CliCommand.make("beep").pipe(
 *   CliCommand.withSubcommands([syncCommand])
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const syncCommand = CliCommand.make("sync", {}, () => handleSyncCommand).pipe(
  CliCommand.withDescription("Copy .env to workspaces and regenerate type definitions.")
);
