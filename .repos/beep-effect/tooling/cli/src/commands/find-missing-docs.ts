/**
 * @file find-missing-docs CLI Command
 *
 * Finds packages missing AGENTS.md and/or README.md documentation files.
 * Replaces scripts/find-missing-agents.ts with dynamic package discovery
 * via RepoUtils instead of hardcoded paths and node:fs.
 *
 * @module find-missing-docs
 * @since 0.1.0
 */

import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { FileSystem, Path } from "@effect/platform";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import color from "picocolors";

// =============================================================================
// Types
// =============================================================================

interface PackageDocStatus {
  readonly packageName: string;
  readonly relativePath: string;
  readonly hasAgentsMd: boolean;
  readonly hasReadmeMd: boolean;
}

// =============================================================================
// Options
// =============================================================================

const checkOption = Options.boolean("check").pipe(
  Options.withDefault(false),
  Options.withDescription("Exit with non-zero code if docs are missing (for CI)")
);

const typeOption = Options.choice("type", ["all", "agents", "readme"]).pipe(
  Options.withDefault("all" as const),
  Options.withDescription("Filter which doc types to check")
);

// =============================================================================
// Handler
// =============================================================================

const handleFindMissingDocs = (options: { readonly check: boolean; readonly type: "all" | "agents" | "readme" }) =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    yield* Console.log(color.cyan("Scanning packages for missing documentation files...\n"));

    const workspaceEntries = F.pipe(HashMap.toEntries(repo.RepoWorkspaceMap), A.fromIterable);

    // Check each package for doc files
    const statuses = yield* Effect.all(
      A.map(workspaceEntries, ([packageName, packageDir]) =>
        Effect.gen(function* () {
          const agentsPath = path.join(packageDir, "AGENTS.md");
          const readmePath = path.join(packageDir, "README.md");

          const hasAgentsMd = yield* fs.exists(agentsPath);
          const hasReadmeMd = yield* fs.exists(readmePath);

          const relativePath = F.pipe(packageDir, Str.replace(Str.concat(repo.REPOSITORY_ROOT, "/"), ""));

          return {
            packageName,
            relativePath,
            hasAgentsMd,
            hasReadmeMd,
          } satisfies PackageDocStatus;
        })
      ),
      { concurrency: "unbounded" }
    );

    // Sort by relative path for consistent output
    const byRelativePath: Order.Order<PackageDocStatus> = Order.mapInput(
      Order.string,
      (s: PackageDocStatus) => s.relativePath
    );
    const sortedStatuses = A.sort(statuses, byRelativePath);

    // Filter missing AGENTS.md
    const missingAgents = F.pipe(
      sortedStatuses,
      A.filter((s) => !s.hasAgentsMd)
    );

    // Filter missing README.md
    const missingReadme = F.pipe(
      sortedStatuses,
      A.filter((s) => !s.hasReadmeMd)
    );

    // Print results based on type filter
    if (options.type === "all" || options.type === "agents") {
      yield* Console.log(color.bold("## Missing AGENTS.md Files\n"));

      if (A.isEmptyReadonlyArray(missingAgents)) {
        yield* Console.log(color.green("None - all packages have AGENTS.md files!\n"));
      } else {
        yield* Effect.forEach(
          missingAgents,
          (s) => Console.log(color.yellow(`  - ${s.relativePath} (${s.packageName})`)),
          { discard: true }
        );
        yield* Console.log("");
      }
    }

    if (options.type === "all" || options.type === "readme") {
      yield* Console.log(color.bold("## Missing README.md Files\n"));

      if (A.isEmptyReadonlyArray(missingReadme)) {
        yield* Console.log(color.green("None - all packages have README.md files!\n"));
      } else {
        yield* Effect.forEach(
          missingReadme,
          (s) => Console.log(color.yellow(`  - ${s.relativePath} (${s.packageName})`)),
          { discard: true }
        );
        yield* Console.log("");
      }
    }

    // Summary
    const totalPackages = A.length(sortedStatuses);
    const missingAgentsCount = A.length(missingAgents);
    const missingReadmeCount = A.length(missingReadme);

    yield* Console.log(color.bold("\n## Summary"));
    yield* Console.log(`  Total packages found: ${totalPackages}`);

    if (options.type === "all" || options.type === "agents") {
      const agentsColor = missingAgentsCount > 0 ? color.yellow : color.green;
      yield* Console.log(agentsColor(`  Missing AGENTS.md: ${missingAgentsCount}`));
    }

    if (options.type === "all" || options.type === "readme") {
      const readmeColor = missingReadmeCount > 0 ? color.yellow : color.green;
      yield* Console.log(readmeColor(`  Missing README.md: ${missingReadmeCount}`));
    }

    // CI check mode: exit non-zero if any docs are missing
    if (options.check) {
      const hasMissingDocs =
        ((options.type === "all" || options.type === "agents") && missingAgentsCount > 0) ||
        ((options.type === "all" || options.type === "readme") && missingReadmeCount > 0);

      if (hasMissingDocs) {
        yield* Console.log(color.red("\nCI check failed: missing documentation files detected."));
        return yield* Effect.die("Missing documentation files detected");
      }

      yield* Console.log(color.green("\nCI check passed: all required documentation files present."));
    }
  }).pipe(Effect.withSpan("findMissingDocs"));

// =============================================================================
// Service Layer
// =============================================================================

/**
 * Service layer for find-missing-docs command.
 *
 * RepoUtilsLive already includes BunFileSystem.layer and BunPath.layerPosix,
 * so no additional filesystem layers are needed.
 */
const FindMissingDocsServiceLayer = RepoUtilsLive;

// =============================================================================
// Command
// =============================================================================

/**
 * CLI command that finds packages missing AGENTS.md or README.md documentation.
 *
 * Uses RepoUtils for dynamic workspace package discovery rather than
 * hardcoded directory scanning. Supports filtering by doc type and
 * a CI check mode that exits non-zero when docs are missing.
 *
 * @since 0.1.0
 * @category constructors
 */
export const findMissingDocsCommand = Command.make(
  "find-missing-docs",
  { check: checkOption, type: typeOption },
  (options) => handleFindMissingDocs(options)
).pipe(
  Command.withDescription("Find packages missing AGENTS.md or README.md documentation"),
  Command.provide(FindMissingDocsServiceLayer)
);
