#!/usr/bin/env node
import nodePath from "node:path";
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { findRepoRoot, resolveWorkspaceDirs } from "@beep/tooling-utils/repo";
import * as Command from "@effect/cli/Command";
import * as Prompt from "@effect/cli/Prompt";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as A from "effect/Array";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";
import type { PackageResult, ScriptOptions } from "./utils/enforce-js-import-suffix/engine";
import {
  buildPackageChoices,
  defaultSelectedPackages,
  loadPackageTargets,
  processPackage,
} from "./utils/enforce-js-import-suffix/engine";

const commandHandler = Effect.gen(function* () {
  const path_ = yield* Path.Path;
  const repoRoot = yield* findRepoRoot;
  const workspaceMap = yield* resolveWorkspaceDirs;

  const packages = loadPackageTargets(repoRoot, workspaceMap, path_);
  if (A.isEmptyReadonlyArray(packages)) {
    yield* Console.log("⚠️  No workspaces discovered. Nothing to enforce.");
    return;
  }

  const defaults = yield* defaultSelectedPackages(repoRoot, path_);
  const choices = buildPackageChoices(packages, defaults);

  const selectedPackages = yield* Prompt.run(
    Prompt.multiSelect({
      message: "Select the packages to enforce .js suffixes for relative imports",
      choices,
      maxPerPage: 20,
    })
  );

  if (A.isEmptyReadonlyArray(selectedPackages)) {
    yield* Console.log("ℹ️  No packages selected. Exiting without changes.");
    return;
  }

  const applyChanges = yield* Prompt.run(
    Prompt.confirm({
      message: "Apply .js suffix updates now? Selecting no will run in check-only mode.",
      initial: false,
    })
  );

  const options: ScriptOptions = { checkMode: !applyChanges };

  yield* Console.log(Str.concat("📦 Packages selected: ", String(selectedPackages.length)));

  const results = yield* Effect.forEach(selectedPackages, (pkg) => processPackage(pkg, options, repoRoot), {
    concurrency: 1,
  });

  yield* Effect.forEach(results, (result) => Console.log(formatSummaryLine(result)), { discard: true });

  const totals = summarize(results);

  yield* Console.log(Str.concat("✅ Total specifiers updated: ", String(totals.specifiers)));
  yield* Console.log(Str.concat("📄 Files touched: ", String(totals.files)));

  if (options.checkMode) {
    yield* Console.log("🔍 Check mode completed. No files were modified.");
  } else {
    yield* Console.log("💾 Changes written to disk. Review the diff before committing.");
  }

  if (!A.isEmptyReadonlyArray(totals.fallbacks)) {
    yield* Console.log("⚠️  Fallback heuristics were applied to the following specifiers:");
    yield* Effect.forEach(
      totals.fallbacks,
      (notice) =>
        Effect.gen(function* () {
          const relativePath = nodePath.relative(repoRoot, notice.file);
          const line = Str.concat(Str.concat("   - ", relativePath), Str.concat(" :: ", notice.specifier));
          yield* Console.log(line);
        }),
      { discard: true }
    );
  }
});

const command = Command.make("enforce-js-import-suffix", {}, () => commandHandler).pipe(
  Command.withDescription("Interactively enforce .js suffixes on relative imports across selected packages.")
);

const cli = Command.run(command, {
  name: "enforce-js-import-suffix",
  version: "0.2.0",
});

const layer = Layer.mergeAll(BunContext.layer, BunTerminal.layer, FsUtilsLive);

cli(process.argv)
  .pipe(
    Effect.provide(layer),
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        const header = Str.concat("💥 Program failed: ", String(error));
        yield* Console.log(header);
        const cause = Cause.fail(error);
        yield* Console.log(Str.concat("🔍 Details: ", Cause.pretty(cause)));
        return yield* Effect.fail(error);
      })
    )
  )
  .pipe(BunRuntime.runMain);

type Totals = {
  readonly packages: number;
  readonly files: number;
  readonly specifiers: number;
  readonly fallbacks: ReadonlyArray<{ readonly file: string; readonly specifier: string }>;
};

const summarize = (results: ReadonlyArray<PackageResult>): Totals =>
  A.reduce(
    results,
    {
      packages: 0,
      files: 0,
      specifiers: 0,
      fallbacks: [] as ReadonlyArray<{ readonly file: string; readonly specifier: string }>,
    },
    (state, result) => ({
      packages: state.packages + 1,
      files: state.files + result.filesTouched,
      specifiers: state.specifiers + result.specifiersUpdated,
      fallbacks: A.appendAll(state.fallbacks, result.fallbackNotices),
    })
  );

const formatSummaryLine = (result: PackageResult): string => {
  const base = Str.concat("• ", result.packageName);
  const specifiers = Str.concat(" — specifiers: ", String(result.specifiersUpdated));
  const files = Str.concat(" files: ", String(result.filesTouched));
  return Str.concat(Str.concat(base, specifiers), files);
};
