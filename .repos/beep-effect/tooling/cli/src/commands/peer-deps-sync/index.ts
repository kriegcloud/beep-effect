/**
 * @file peer-deps-sync CLI Command
 *
 * Deprecated compatibility command for the manifest-policy phase of
 * config-sync / tsconfig-sync.
 *
 * @module peer-deps-sync
 * @since 0.1.0
 */

import { RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import color from "picocolors";
import type { DriftDetectedError, ReferenceRepoNotFoundError } from "./errors.js";
import { peerDepsSyncHandler } from "./handler.js";
import { PeerDepsSyncInput } from "./schemas.js";

const checkOption = Options.boolean("check").pipe(
  Options.withDefault(false),
  Options.withDescription("Validate without modification (exit code 1 on drift)")
);

const dryRunOption = Options.boolean("dry-run").pipe(
  Options.withDefault(false),
  Options.withDescription("Preview changes without writing files")
);

const filterOption = Options.text("filter").pipe(
  Options.optional,
  Options.withDescription('Scope to a specific workspace package (e.g., "@beep/schema")')
);

const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false),
  Options.withDescription("Show detailed output")
);

const preCommitOption = Options.boolean("pre-commit").pipe(
  Options.withDefault(false),
  Options.withDescription("Run in pre-commit mode (scope to staged relevant manifests when possible)")
);

const PeerDepsSyncServiceLayer = Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer);

export const peerDepsSyncCommand = Command.make(
  "peer-deps-sync",
  {
    check: checkOption,
    dryRun: dryRunOption,
    filter: filterOption,
    verbose: verboseOption,
    preCommit: preCommitOption,
  },
  ({ check, dryRun, filter, verbose, preCommit }) =>
    Effect.gen(function* () {
      const input = new PeerDepsSyncInput({
        check,
        dryRun,
        filter: O.getOrUndefined(filter),
        verbose,
        preCommit,
      });

      yield* peerDepsSyncHandler(input).pipe(
        Effect.catchIf(
          (err): err is DriftDetectedError =>
            "_tag" in err && typeof err._tag === "string" && err._tag.endsWith("DriftDetectedError"),
          (err) =>
            Effect.gen(function* () {
              yield* Console.log(color.red(`\nDrift detected: ${err.summary}`));
              yield* Console.log(color.yellow("Run without --check to apply fixes."));
              yield* Effect.die(new Error("Peer dependency drift detected"));
            })
        ),
        Effect.catchIf(
          (err): err is ReferenceRepoNotFoundError =>
            "_tag" in err && typeof err._tag === "string" && err._tag.endsWith("ReferenceRepoNotFoundError"),
          (err) =>
            Effect.gen(function* () {
              yield* Console.log(color.red(`\nError: ${err.displayMessage}`));
              yield* Effect.die(new Error(err.displayMessage));
            })
        ),
        Effect.catchAll((err) =>
          Effect.gen(function* () {
            const message =
              typeof err === "object" &&
              err !== null &&
              "displayMessage" in err &&
              typeof err.displayMessage === "string"
                ? err.displayMessage
                : String(err);
            yield* Console.log(color.red(`\nError: ${message}`));
            yield* Effect.die(new Error(message));
          })
        )
      );
    })
).pipe(
  Command.withDescription("Deprecated compatibility alias for peer dependency policy sync"),
  Command.provide(PeerDepsSyncServiceLayer)
);
