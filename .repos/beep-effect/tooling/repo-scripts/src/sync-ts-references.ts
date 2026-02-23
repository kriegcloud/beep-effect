#!/usr/bin/env node
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { collectTsConfigPaths } from "@beep/tooling-utils/repo/TsConfigIndex";
import * as Command from "@effect/platform/Command";
import type * as CommandExecutor from "@effect/platform/CommandExecutor";
import type * as PlatformError from "@effect/platform/Error";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

/**
 * Sync TypeScript project references and path mappings across the monorepo
 * using the `update-ts-references` CLI. We intentionally avoid the YAML
 * config and instead run the necessary commands directly in sequence.
 *
 * Usage:
 *   bunx turbo run sync-ts --filter=@beep/repo-scripts               # apply changes
 *   bunx turbo run sync-ts --filter=@beep/repo-scripts -- --check    # check mode (no changes)
 */

const hasFileNamed = (files: ReadonlyArray<string>, name: string): boolean =>
  A.some(files, (p) => p.endsWith(`/${name}`) || p.endsWith(`\\${name}`));

const runStep: (
  label: string,
  args: ReadonlyArray<string>
) => Effect.Effect<void, PlatformError.PlatformError, CommandExecutor.CommandExecutor> = Effect.fn(
  function* (label, args) {
    const cmd = Command.make("bunx", "update-ts-references", ...args);

    yield* Console.log(`\n▶ ${label}`);
    yield* Console.log(`   $ bunx update-ts-references ${args.join(" ")}`);

    const out = yield* Command.string(cmd).pipe(
      Effect.tapError((err) => Console.log(`❌ ${label} failed: ${String(err)}`))
    );

    yield* Console.log(`✅ ${label} completed`);
    if (out.trim().length > 0) {
      yield* Console.log(`   output: ${out.slice(0, 400)}${out.length > 400 ? "..." : ""}`);
    }
  }
);

const program = Effect.gen(function* () {
  yield* Console.log("🔧 Syncing TypeScript project references...");

  const detection = yield* collectTsConfigPaths.pipe(
    Effect.map((map) => {
      const all = A.flatten(Array.from(map).map(([, files]) => files));
      return {
        hasBuild: hasFileNamed(all, "tsconfig.build.json"),
        hasSrc: hasFileNamed(all, "tsconfig.src.json"),
        hasTest: hasFileNamed(all, "tsconfig.test.json"),
        hasTsx: hasFileNamed(all, "tsconfig.tsx.json"),
        hasDrizzle: hasFileNamed(all, "tsconfig.drizzle.json"),
      } as const;
    }),
    Effect.catchAll((err) =>
      Effect.gen(function* () {
        yield* Console.log(
          `⚠️  Could not fully inspect tsconfig files (${String(err)}). Proceeding with all usecases enabled...`
        );
        return {
          hasBuild: true,
          hasSrc: true,
          hasTest: true,
          hasTsx: true,
          hasDrizzle: true,
        } as const;
      })
    )
  );

  const { hasBuild, hasSrc, hasTest, hasTsx, hasDrizzle } = detection;

  const checkMode = process.argv.includes("--check");

  // Steps to run. We avoid YAML and call the CLI with flags directly.
  const steps: Array<readonly [string, ReadonlyArray<string>]> = [];

  // 1) Generate/refresh central alias path mappings in root tsconfig.base.json
  //    (also updates package tsconfig.json files). Useful for IDE speed.
  steps.push([
    "Update path mappings in tsconfig.base.jsonc",
    [
      "--configName",
      "tsconfig.json",
      "--rootConfigName",
      "tsconfig.base.jsonc",
      "--createPathMappings",
      ...(checkMode ? ["--check"] : []),
    ],
  ] as const);

  // 2) Root tsconfig.json references + per-package tsconfig.json refs
  steps.push([
    "Update references for tsconfig.json",
    ["--configName", "tsconfig.json", "--rootConfigName", "tsconfig.json", ...(checkMode ? ["--check"] : [])],
  ] as const);

  // 3) Build graph (references only, no paths)
  if (hasBuild) {
    steps.push([
      "Update references for tsconfig.build.json",
      [
        "--configName",
        "tsconfig.build.json",
        "--rootConfigName",
        "tsconfig.build.json",
        ...(checkMode ? ["--check"] : []),
      ],
    ] as const);
  }

  // 4) Optional per-variant configs (no root update). Include paths for IDE.
  if (hasSrc) {
    steps.push([
      "Update references for tsconfig.src.json",
      [
        "--configName",
        "tsconfig.src.json",
        "--withoutRootConfig",
        "--createPathMappings",
        ...(checkMode ? ["--check"] : []),
      ],
    ] as const);
  }

  if (hasTest) {
    steps.push([
      "Update references for tsconfig.test.json",
      [
        "--configName",
        "tsconfig.test.json",
        "--withoutRootConfig",
        "--createPathMappings",
        ...(checkMode ? ["--check"] : []),
      ],
    ] as const);
  }

  if (hasTsx) {
    steps.push([
      "Update references for tsconfig.tsx.json",
      [
        "--configName",
        "tsconfig.tsx.json",
        "--withoutRootConfig",
        "--createPathMappings",
        ...(checkMode ? ["--check"] : []),
      ],
    ] as const);
  }

  if (hasDrizzle) {
    steps.push([
      "Update references for tsconfig.drizzle.json",
      [
        "--configName",
        "tsconfig.drizzle.json",
        "--withoutRootConfig",
        "--createPathMappings",
        ...(checkMode ? ["--check"] : []),
      ],
    ] as const);
  }

  // Execute in order
  for (const [label, args] of steps) {
    yield* runStep(label, args);
  }

  yield* Console.log("\n🎉 TS references sync finished.");
});

const main = program.pipe(
  Effect.provide([BunContext.layer, FsUtilsLive]),
  Effect.catchAll((error) =>
    Effect.gen(function* () {
      const msg = String(error);
      yield* Console.log(`\n💥 Program failed: ${msg}`);
      const cause = Cause.fail(error);
      yield* Console.log(`\n🔍 Error details: ${Cause.pretty(cause)}`);
      return yield* error;
    })
  )
);

BunRuntime.runMain(main);
