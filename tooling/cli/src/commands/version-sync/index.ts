import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";
import { handleVersionSync } from "./handler.js";
import type { VersionSyncMode } from "./types.js";

/**
 * Resolve command mode from flags.
 *
 * @since 0.0.0
 * @category functions
 * @param write - Whether `--write` was passed.
 * @param dryRun - Whether `--dry-run` was passed.
 * @returns The resolved command execution mode.
 */
const resolveMode = (write: boolean, dryRun: boolean): VersionSyncMode => {
  if (write && dryRun) return "dry-run";
  if (write) return "write";
  return "check";
};

/**
 * CLI command for synchronizing version pins across the monorepo.
 *
 * @since 0.0.0
 * @category commands
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
  },
  Effect.fn(function* ({ write, dryRun, skipNetwork, bunOnly, nodeOnly, dockerOnly, biomeOnly }) {
    const mode = resolveMode(write, dryRun);

    yield* handleVersionSync({
      mode,
      skipNetwork,
      bunOnly,
      nodeOnly,
      dockerOnly,
      biomeOnly,
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
    "Detect and fix version drift across .bun-version, package.json, .nvmrc, CI workflows, docker-compose.yml, and biome.jsonc"
  )
);
