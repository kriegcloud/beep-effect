#!/usr/bin/env node
import { findRepoRoot } from "@beep/tooling-utils/repo/index";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Glob from "glob";

const FILES_TO_PURGE = [".tsbuildinfo", "build", "dist", ".next", "coverage", ".turbo", "node_modules"] as const;

const ROOT_ARTIFACTS = ["node_modules", ".turbo"] as const;
const LOCK_FILE = "bun.lock";

const WORKSPACE_PATTERNS = [
  "apps/*/",
  "packages/_internal/*/",
  "packages/common/*/",
  "packages/core/*/",
  "packages/workspaces/*/",
  "packages/iam/*/",
  "packages/runtime/*/",
  "packages/shared/*/",
  "packages/ui/*/",
  "packages/knowledge/*/",
  "packages/customization/*/",
  "packages/integrations/*/*/",
  "packages/comms/*/",
  "packages/calendar/*/",
  "tooling/*/",
] as const;

const purge = Effect.fn(
  function* (removeLock: boolean) {
    const fs = yield* FileSystem.FileSystem;
    const repoRoot = yield* findRepoRoot;
    const path = yield* Path.Path;

    const DIRS = F.pipe(
      WORKSPACE_PATTERNS,
      A.flatMap((pattern) => Glob.sync(pattern, { cwd: repoRoot, absolute: true }))
    );

    const removeTarget = (target: string) =>
      fs
        .remove(target, { recursive: true, force: true })
        .pipe(Effect.tap(() => Console.log(`Preparing to remove ${target}`)));

    const rootArtifacts = removeLock ? F.pipe(ROOT_ARTIFACTS, A.append(LOCK_FILE)) : ROOT_ARTIFACTS;

    const rootRemovals = F.pipe(
      rootArtifacts,
      A.map((artifact) => removeTarget(path.join(repoRoot, artifact)))
    );

    const subDirRemovals = F.pipe(
      DIRS,
      A.flatMap((pkg) =>
        F.pipe(
          FILES_TO_PURGE,
          A.map((file) => removeTarget(path.join(pkg, file)))
        )
      )
    );

    const allRemovals = F.pipe(subDirRemovals, A.appendAll(rootRemovals));
    const total = A.length(allRemovals);

    yield* Console.log(`\n🧹 Removing ${total} paths...`);
    yield* Effect.all(allRemovals, { concurrency: total });
  },
  Effect.catchAll(
    Effect.fnUntraced(function* (error) {
      const msg = String(error);
      yield* Console.log(`\n💥 Program failed: ${msg}`);
      const cause = Cause.fail(error);
      yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
      return yield* error;
    })
  )
);

const lockOption = F.pipe(Options.boolean("lock"), Options.withAlias("l"), Options.withDefault(false));

const purgeCommand = Command.make("purge", { lock: lockOption }, ({ lock }) => purge(lock)).pipe(
  Command.withDescription("Remove build artifacts across all workspaces.")
);

const purgeCli = Command.run(purgeCommand, {
  name: "beep-purge",
  version: "0.0.0",
});

export const runPurgeCli = (argv: ReadonlyArray<string>) =>
  purgeCli(argv).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);

if (import.meta.main) {
  runPurgeCli(process.argv);
}
