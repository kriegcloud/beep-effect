/**
 * Version-sync handler orchestration.
 *
 * @module
 * @since 0.0.0
 */

import { findRepoRoot, type NoSuchFileError } from "@beep/repo-utils";
import { Console, Effect, type FileSystem, Layer, Number as Num, type Path } from "effect";
import * as A from "effect/Array";
import type { HttpClient } from "effect/unstable/http";
import {
    VersionSyncDriftError,
    type VersionSyncError,
    VersionSyncModeMatch,
    type VersionSyncOptions,
} from "./Models.js";
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

  const applyWriteUpdates = Effect.fn("VersionSync.handle.write.applyUpdates")(function* () {
    const totalChanges = yield* updater.apply(repoRoot, resolution);
    yield* Console.log(`\nApplied ${totalChanges} file update(s).`);
  });

  const failOnDrift = Effect.fn("VersionSync.handle.check.failOnDrift")(function* () {
    const driftCount = A.reduce(resolution.report.categories, 0, (count, category) =>
      Num.sum(count, A.length(category.items))
    );

    return yield* new VersionSyncDriftError({
      message: `Version drift detected: ${driftCount} item(s) need updating`,
      driftCount,
    });
  });

  yield* VersionSyncModeMatch(options.mode, {
    write: () => applyWriteUpdates().pipe(Effect.when(Effect.succeed(resolution.report.hasDrift)), Effect.asVoid),
    check: () => failOnDrift().pipe(Effect.when(Effect.succeed(resolution.report.hasDrift)), Effect.asVoid),
    "dry-run": () => Effect.void,
  });
});

/**
 * Execute the version-sync command.
 *
 * @param options - Parsed version-sync options.
 * @returns Effect that resolves or fails with typed version-sync errors.
 * @category UseCase
 * @since 0.0.0
 */
export const handleVersionSync: (
  options: VersionSyncOptions
) => Effect.Effect<
  void,
  VersionSyncError | VersionSyncDriftError | NoSuchFileError,
  FileSystem.FileSystem | Path.Path | HttpClient.HttpClient
> = (options) =>
  Effect.scoped(
    Layer.build(VersionSyncServicesLive).pipe(
      Effect.flatMap((context) => handleVersionSyncProgram(options).pipe(Effect.provide(context)))
    )
  );
