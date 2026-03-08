import { Console, Effect } from "effect";
import * as Bool from "effect/Boolean";
import { Command, Flag } from "effect/unstable/cli";
import { handleVersionSync } from "./internal/Handler.js";
import type { VersionSyncMode } from "./internal/Models.js";

/**
 * Resolve command mode from flags.
 *
 * @since 0.0.0
 * @category Utility
 * @param write - Whether `--write` was passed.
 * @param dryRun - Whether `--dry-run` was passed.
 * @returns The resolved command execution mode.
 */
const resolveMode = (write: boolean, dryRun: boolean): VersionSyncMode => {
  return Bool.match(write, {
    onTrue: () =>
      Bool.match(dryRun, {
        onTrue: () => "dry-run" as const,
        onFalse: () => "write" as const,
      }),
    onFalse: () => "check" as const,
  });
};

/**
 * CLI command for synchronizing version pins across the monorepo.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const versionSyncCommand = Command.make(
  "version-sync",
  {
    write: Flag.boolean("write").pipe(
      Flag.withAlias("w"),
      Flag.withDescription("Apply version updates (without this, only reports drift)")
    ),
    dryRun: Flag.boolean("dry-run").pipe(
      Flag.withAlias("d"),
      Flag.withDescription("Show what --write would do without modifying files")
    ),
    skipNetwork: Flag.boolean("skip-network").pipe(
      Flag.withAlias("s"),
      Flag.withDescription("Skip upstream version resolution (only check internal consistency)")
    ),
    bunOnly: Flag.boolean("bun-only").pipe(Flag.withDescription("Only sync Bun versions")),
    nodeOnly: Flag.boolean("node-only").pipe(Flag.withDescription("Only sync Node versions")),
    dockerOnly: Flag.boolean("docker-only").pipe(Flag.withDescription("Only sync Docker image versions")),
    biomeOnly: Flag.boolean("biome-only").pipe(Flag.withDescription("Only sync Biome schema version")),
    effectOnly: Flag.boolean("effect-only").pipe(
      Flag.withDescription("Only sync lockstep Effect catalog versions in the root package.json")
    ),
  },
  Effect.fn(function* ({ write, dryRun, skipNetwork, bunOnly, nodeOnly, dockerOnly, biomeOnly, effectOnly }) {
    const mode = resolveMode(write, dryRun);

    yield* handleVersionSync({
      mode,
      skipNetwork,
      bunOnly,
      nodeOnly,
      dockerOnly,
      biomeOnly,
      effectOnly,
    }).pipe(
      Effect.catchTag(
        "VersionSyncDriftError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`version-sync: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`version-sync: ${error.message} (${error.file})`);
        })
      ),
      Effect.catchTag(
        "NoSuchFileError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`version-sync: ${error.message}`);
        })
      )
    );
  })
).pipe(
  Command.withDescription(
    "Detect and fix version drift across .bun-version, package.json, .nvmrc, CI workflows, docker-compose.yml, biome.jsonc, and the root Effect catalog"
  )
);
