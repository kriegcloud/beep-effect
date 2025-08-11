#!/usr/bin/env node
import { Repo } from "@beep/tooling-utils";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as Command from "@effect/platform/Command";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const BREAKING_DEPS = [
  "react-day-picker",
  "embla-carousel",
  "embla-carousel-auto-height",
  "embla-carousel-auto-scroll",
  "embla-carousel-autoplay",
  "embla-carousel-fade",
  "embla-carousel-react",
  "@tiptap/core",
  "@tiptap/extension-code-block",
  "@tiptap/extension-code-block-lowlight",
  "@tiptap/extension-image",
  "@tiptap/extension-link",
  "@tiptap/extension-placeholder",
  "@tiptap/extension-text-align",
  "@tiptap/extension-underline",
  "@tiptap/pm",
  "@tiptap/react",
  "@tiptap/starter-kit",
  "@fullcalendar/core",
  "@fullcalendar/daygrid",
  "@fullcalendar/interaction",
  "@fullcalendar/list",
  "@fullcalendar/react",
  "@fullcalendar/timegrid",
  "@fullcalendar/timeline",
];

/**
 * Core Dependencies Updater
 *
 * This script updates core dependencies across all packages in the monorepo
 * to their latest versions using pnpm update --recursive --latest.
 *
 * Usage:
 *   pnpm update-core-deps        # From repo root
 *   pnpm run update-core-deps    # From packages/tooling/scripts
 *
 * Features:
 * - Updates dependencies concurrently (up to 5 at a time)
 * - Provides detailed logging and progress updates
 * - Handles both regular dependencies and dev dependencies
 * - Reports success/failure statistics
 *
 * The script uses Effect for functional programming patterns and error handling.
 */

/**
 * Updates all packages in the given array with a single pnpm command
 */
const updatePackages = (packages: string[], label: string) =>
  Effect.gen(function* () {
    yield* Effect.log(`Starting ${label} updates`);
    yield* Console.log(`\n🚀 Starting ${label} updates...`);
    yield* Console.log(`📦 Packages to update: ${packages.join(", ")}`);

    const packagesArg = F.pipe(packages, A.join(" "));
    const command = Command.make(
      "pnpm",
      "update",
      "--recursive",
      "--latest",
      ...packages,
    );

    yield* Console.log(
      `\n🔄 Running: pnpm update --recursive --latest ${packagesArg}`,
    );
    yield* Effect.log(
      `Executing command: pnpm update --recursive --latest ${packagesArg}`,
    );

    // Try to get the command output and handle errors
    const result = yield* Command.string(command).pipe(
      Effect.tapError((error) =>
        Effect.gen(function* () {
          yield* Effect.log(`Command failed with error: ${String(error)}`);
          yield* Console.log(`❌ Command failed: ${String(error)}`);

          // Try to get the exit code for additional info
          const exitCode = yield* Command.exitCode(command).pipe(
            Effect.catchAll(() => Effect.succeed(1)),
          );

          yield* Effect.log(`Exit code: ${exitCode}`);
          yield* Console.log(`💥 Exit code: ${exitCode}`);
        }),
      ),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.log(`Failed to update ${label}: ${String(error)}`);
          yield* Console.log(
            `❌ Failed to update ${label.toLowerCase()}: ${String(error)}`,
          );
          return Effect.fail(
            new Error(`Failed to update ${label}: ${String(error)}`),
          );
        }).pipe(Effect.flatten),
      ),
    );

    yield* Effect.log(`Command output: ${result}`);
    yield* Console.log(`✅ Successfully updated all ${label.toLowerCase()}`);
    yield* Console.log(
      `📝 Output: ${result.slice(0, 200)}${result.length > 200 ? "..." : ""}`,
    );

    return { successful: packages.length, failed: 0 };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* Effect.log(`Update packages failed: ${String(error)}`);
        yield* Console.log(
          `❌ Failed to update ${label.toLowerCase()}: ${String(error)}`,
        );
        return { successful: 0, failed: packages.length };
      }),
    ),
  );

/**
 * Main program that updates all core dependencies
 */
const program = Effect.gen(function* () {
  yield* Console.log("🔧 Starting core dependency update process...");
  yield* Console.log(
    "This will update packages across all workspaces in the monorepo\n",
  );
  const { dependencies, devDependencies } = yield* Repo.getUniqueDeps;
  const CORE_DEPS = A.filter(
    dependencies,
    (dep) => !BREAKING_DEPS.includes(dep),
  );
  const CORE_DEV_DEPS = A.filter(
    devDependencies,
    (dep) => !BREAKING_DEPS.includes(dep),
  );

  // Update core dependencies
  const depsResults = yield* updatePackages(CORE_DEPS, "Core Dependencies");

  // Update core dev dependencies
  const devDepsResults = yield* updatePackages(
    CORE_DEV_DEPS,
    "Core Dev Dependencies",
  );

  // Summary
  const totalSuccessful = depsResults.successful + devDepsResults.successful;
  const totalFailed = depsResults.failed + devDepsResults.failed;
  const totalPackages = CORE_DEPS.length + CORE_DEV_DEPS.length;

  yield* Console.log(`\n🎉 Update process completed!`);
  yield* Console.log(`📦 Total packages: ${totalPackages}`);
  yield* Console.log(`✅ Successfully updated: ${totalSuccessful}`);
  yield* Console.log(`❌ Failed to update: ${totalFailed}`);

  if (totalFailed > 0) {
    yield* Console.log(
      `\n⚠️  Some packages failed to update. Please check the logs above.`,
    );
    yield* Effect.log(
      `Update failed: ${totalFailed} out of ${totalPackages} packages failed to update`,
    );
    return yield* Effect.fail(
      new Error(`${totalFailed} packages failed to update`),
    );
  }

  yield* Console.log(
    `\n🎊 All core dependencies have been successfully updated!`,
  );
  yield* Effect.log(
    `Update completed successfully: ${totalSuccessful} packages updated`,
  );
});

// Run the program with better error handling
const mainProgram = program.pipe(
  Effect.provide([NodeContext.layer, FsUtilsLive]),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      yield* Effect.log(`Program failed with error: ${String(error)}`);
      yield* Console.log(`\n💥 Program failed: ${String(error)}`);

      // Log the cause for debugging
      const cause = Cause.fail(error);
      yield* Effect.log(`Error cause: ${Cause.pretty(cause)}`);
      yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);

      // Exit with error code
      return yield* Effect.fail(error);
    }),
  ),
);

NodeRuntime.runMain(mainProgram);
