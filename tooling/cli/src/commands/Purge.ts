/**
 * Purge command - remove root and workspace build artifacts.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError, findRepoRoot, resolveWorkspaceDirs } from "@beep/repo-utils";
import { normalizePath } from "@beep/schema";
import { Console, Effect, FileSystem, MutableHashSet, Path } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";

const $I = $RepoCliId.create("purge");
/**
 * Workspace-local artifact names to purge.
 *
 * Matches legacy purge intent from `@beep/repo-scripts`.
 *
 * @category Configuration
 * @since 0.0.0
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
 * @category Configuration
 * @since 0.0.0
 */
const ROOT_ARTIFACTS = ["node_modules", ".turbo", "dist", "docs"] as const;

/**
 * Optional root lock artifact purged with `--lock` / `-l`.
 *
 * @category Configuration
 * @since 0.0.0
 */
const ROOT_LOCK_ARTIFACT = "bun.lock" as const;

const resolveCanonicalPurgePath = Effect.fn(function* (target: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const resolvedTarget = path.resolve(target);
  let candidate = resolvedTarget;

  while (true) {
    const exists = yield* fs
      .exists(candidate)
      .pipe(
        Effect.mapError((cause) => new DomainError({ message: `Failed to inspect purge path "${candidate}"`, cause }))
      );

    if (exists) {
      const canonicalCandidate = yield* fs
        .realPath(candidate)
        .pipe(
          Effect.mapError((cause) => new DomainError({ message: `Failed to resolve purge path "${candidate}"`, cause }))
        );
      const relativeSuffix = normalizePath(path.relative(candidate, resolvedTarget));
      return relativeSuffix === "." ? canonicalCandidate : path.resolve(canonicalCandidate, relativeSuffix);
    }

    const parent = path.dirname(candidate);
    if (parent === candidate) {
      return yield* new DomainError({
        message: `Failed to find an existing ancestor for purge path "${target}"`,
      });
    }
    candidate = parent;
  }
});

const ensureContainedPurgeTarget = Effect.fn(function* (rootDir: string, target: string) {
  const path = yield* Path.Path;
  const canonicalRoot = yield* resolveCanonicalPurgePath(rootDir);
  const canonicalTarget = yield* resolveCanonicalPurgePath(target);
  const relativeFromRoot = normalizePath(path.relative(canonicalRoot, canonicalTarget));

  if (path.isAbsolute(relativeFromRoot) || relativeFromRoot === ".." || Str.startsWith("../")(relativeFromRoot)) {
    return yield* new DomainError({
      message: `Refusing to purge path outside repository root: "${target}"`,
    });
  }

  return canonicalTarget;
});

/**
 * Summary statistics returned after a purge run.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class PurgeSummary extends S.Class<PurgeSummary>($I`PurgeSummary`)(
  {
    targetedCount: S.Number,
    removedCount: S.Number,
    workspaceCount: S.Number,
  },
  $I.annote("PurgeSummary", {
    description: "Summary statistics returned after a purge run.",
  })
) {}

/**
 * Build absolute purge targets from root + workspace artifact rules.
 *
 * @internal
 * @param rootDir - Absolute repo root directory.
 * @param removeLock - Whether to include root `bun.lock`.
 * @returns Deduplicated absolute paths to purge and workspace count.
 * @category Utility
 * @since 0.0.0
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
    targets: [...targets],
    workspaceCount,
  } as const;
});

/**
 * Purge root/workspace artifacts under a specific root directory.
 *
 * @param rootDir - Absolute repo root directory.
 * @param removeLock - Whether to include root `bun.lock`.
 * @returns Purge summary with targeted and existing-removed counts.
 * @category Utility
 * @since 0.0.0
 */
export const purgeAtRoot = Effect.fn(function* (rootDir: string, removeLock: boolean) {
  const fs = yield* FileSystem.FileSystem;

  const { targets, workspaceCount } = yield* buildPurgeTargets(rootDir, removeLock);
  const safeTargets = yield* Effect.forEach(targets, (target) => ensureContainedPurgeTarget(rootDir, target), {
    concurrency: "unbounded",
  });

  yield* Console.log(`Purging ${safeTargets.length} path(s) across ${workspaceCount} workspace(s)...`);

  const existedBefore = yield* Effect.forEach(
    safeTargets,
    (target) =>
      fs
        .exists(target)
        .pipe(
          Effect.mapError((cause) => new DomainError({ message: `Failed to check purge target "${target}"`, cause }))
        ),
    { concurrency: "unbounded" }
  );

  yield* Effect.forEach(
    safeTargets,
    (target) =>
      fs
        .remove(target, { recursive: true, force: true })
        .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to purge target "${target}"`, cause }))),
    { discard: true, concurrency: "unbounded" }
  );

  const removedCount = A.reduce(existedBefore, 0, (count, existed) => (existed ? count + 1 : count));

  yield* Console.log(
    `Purge complete: targeted ${safeTargets.length} path(s), removed ${removedCount} existing path(s).`
  );

  return {
    targetedCount: safeTargets.length,
    removedCount,
    workspaceCount,
  } as const satisfies PurgeSummary;
});

/**
 * CLI command to purge workspace/root build artifacts.
 *
 * @category UseCase
 * @since 0.0.0
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
