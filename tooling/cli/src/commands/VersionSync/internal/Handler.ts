/**
 * Version-sync handler orchestration.
 *
 * @since 0.0.0
 * @module
 */

import { findRepoRoot, type NoSuchFileError } from "@beep/repo-utils";
import { Boolean as Bool, Console, Effect, type FileSystem, Layer, type Path } from "effect";
import * as A from "effect/Array";
import type { HttpClient } from "effect/unstable/http";
import { VersionSyncDriftError, type VersionSyncError, VersionSyncMode, type VersionSyncOptions } from "./Models.js";
import { CategorySelectionServiceLive } from "./services/CategorySelectionService.js";
import { ReportRendererService, ReportRendererServiceLive } from "./services/ReportRendererService.js";
import { ResolverService, ResolverServiceLive } from "./services/ResolverService.js";
import { UpdateApplierService, UpdateApplierServiceLive } from "./services/UpdateApplierService.js";

const VersionSyncServicesLive = Layer.mergeAll(
  CategorySelectionServiceLive,
  ResolverServiceLive,
  ReportRendererServiceLive,
  UpdateApplierServiceLive
);

const handleVersionSyncProgram = Effect.fn(function* (options: VersionSyncOptions) {
  const repoRoot = yield* findRepoRoot();
  const resolver = yield* ResolverService;
  const renderer = yield* ReportRendererService;
  const updater = yield* UpdateApplierService;

  const resolution = yield* resolver.resolve(repoRoot, options);
  yield* renderer.renderReport(resolution.report, options.mode);

  yield* VersionSyncMode.$match(options.mode, {
    write: () =>
      Bool.match(resolution.report.hasDrift, {
        onTrue: () =>
          Effect.gen(function* () {
            const totalChanges = yield* updater.apply(repoRoot, resolution);
            yield* Console.log(`\nApplied ${String(totalChanges)} file update(s).`);
          }),
        onFalse: () => Effect.void,
      }),
    check: () =>
      Bool.match(resolution.report.hasDrift, {
        onFalse: () => Effect.void,
        onTrue: () => {
          const driftCount = A.reduce(
            resolution.report.categories,
            0,
            (count, category) => count + A.length(category.items)
          );
          return Effect.fail(
            new VersionSyncDriftError({
              message: `Version drift detected: ${String(driftCount)} item(s) need updating`,
              driftCount,
            })
          );
        },
      }),
    "dry-run": () => Effect.void,
  });
});

/**
 * Execute the version-sync command.
 *
 * @param options - Parsed version-sync options.
 * @returns Effect that resolves or fails with typed version-sync errors.
 * @since 0.0.0
 * @category UseCase
 */
export const handleVersionSync: (
  options: VersionSyncOptions
) => Effect.Effect<
  void,
  VersionSyncError | VersionSyncDriftError | NoSuchFileError,
  FileSystem.FileSystem | Path.Path | HttpClient.HttpClient
> = (options) => handleVersionSyncProgram(options).pipe(Effect.provide(VersionSyncServicesLive));
