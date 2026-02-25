/**
 * Purge command - remove root and workspace build artifacts.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError, findRepoRoot, resolveWorkspaceDirs } from "@beep/repo-utils";
import { Console, Effect, FileSystem, MutableHashSet, Path } from "effect";
import { Command, Flag } from "effect/unstable/cli";

/**
 * Workspace-local artifact names to purge.
 *
 * Matches legacy purge intent from `@beep/repo-scripts`.
 *
 * @since 0.0.0
 * @category constants
 */
const WORKSPACE_ARTIFACTS = [
  ".tsbuildinfo",
  "tsconfig.tsbuildinfo",
  "build",
  "dist",
  "docs",
  ".next",
  "coverage",
  ".turbo",
  "storybook-static",
  "node_modules",
] as const;

/**
 * Root-level artifacts always purged.
 *
 * @since 0.0.0
 * @category constants
 */
const ROOT_ARTIFACTS = ["node_modules", ".turbo", "dist", "docs"] as const;

/**
 * Optional root lock artifact purged with `--lock` / `-l`.
 *
 * @since 0.0.0
 * @category constants
 */
const ROOT_LOCK_ARTIFACT = "bun.lock" as const;

/**
 * Summary statistics returned after a purge run.
 *
 * @since 0.0.0
 * @category models
 */
export interface PurgeSummary {
  readonly targetedCount: number;
  readonly removedCount: number;
  readonly workspaceCount: number;
}

/**
 * Build absolute purge targets from root + workspace artifact rules.
 *
 * @param rootDir - Absolute repo root directory.
 * @param removeLock - Whether to include root `bun.lock`.
 * @returns Deduplicated absolute paths to purge and workspace count.
 * @since 0.0.0
 * @category functions
 * @internal
 */
const buildPurgeTargets = Effect.fn(function* (rootDir: string, removeLock: boolean) {
  const path = yield* Path.Path;
  const workspaceDirsByName = yield* resolveWorkspaceDirs(rootDir);

  const targets = MutableHashSet.empty<string>();

  for (const artifact of ROOT_ARTIFACTS) {
    MutableHashSet.add(targets, path.join(rootDir, artifact));
  }
  if (removeLock) {
    MutableHashSet.add(targets, path.join(rootDir, ROOT_LOCK_ARTIFACT));
  }

  let workspaceCount = 0;
  for (const [, workspaceDir] of workspaceDirsByName) {
    workspaceCount += 1;
    for (const artifact of WORKSPACE_ARTIFACTS) {
      MutableHashSet.add(targets, path.join(workspaceDir, artifact));
    }
  }

  return {
    targets: Array.from(targets),
    workspaceCount,
  } as const;
});

/**
 * Purge root/workspace artifacts under a specific root directory.
 *
 * @param rootDir - Absolute repo root directory.
 * @param removeLock - Whether to include root `bun.lock`.
 * @returns Purge summary with targeted and existing-removed counts.
 * @since 0.0.0
 * @category functions
 */
export const purgeAtRoot = Effect.fn(function* (rootDir: string, removeLock: boolean) {
  const fs = yield* FileSystem.FileSystem;

  const { targets, workspaceCount } = yield* buildPurgeTargets(rootDir, removeLock);

  yield* Console.log(`Purging ${String(targets.length)} path(s) across ${String(workspaceCount)} workspace(s)...`);

  const existedBefore = yield* Effect.forEach(
    targets,
    (target) =>
      fs
        .exists(target)
        .pipe(
          Effect.mapError((cause) => new DomainError({ message: `Failed to check purge target "${target}"`, cause }))
        ),
    { concurrency: "unbounded" }
  );

  yield* Effect.forEach(
    targets,
    (target) =>
      fs
        .remove(target, { recursive: true, force: true })
        .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to purge target "${target}"`, cause }))),
    { discard: true, concurrency: "unbounded" }
  );

  const removedCount = existedBefore.reduce((count, existed) => (existed ? count + 1 : count), 0);

  yield* Console.log(
    `Purge complete: targeted ${String(targets.length)} path(s), removed ${String(removedCount)} existing path(s).`
  );

  return {
    targetedCount: targets.length,
    removedCount,
    workspaceCount,
  } as const satisfies PurgeSummary;
});

/**
 * CLI command to purge workspace/root build artifacts.
 *
 * @since 0.0.0
 * @category commands
 */
export const purgeCommand = Command.make(
  "purge",
  {
    lock: Flag.boolean("lock").pipe(Flag.withAlias("l"), Flag.withDescription("Also remove root bun.lock")),
  },
  Effect.fn(function* ({ lock }) {
    const rootDir = yield* findRepoRoot();
    yield* purgeAtRoot(rootDir, lock);
  })
).pipe(Command.withDescription("Remove root and workspace build artifacts"));
