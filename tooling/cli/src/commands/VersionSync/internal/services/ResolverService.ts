/**
 * Resolver orchestration service for version-sync.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Effect, type FileSystem, Layer, type Path, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { HttpClient } from "effect/unstable/http";
import {
  type VersionCategoryReport,
  VersionCategoryStatus,
  type VersionSyncError,
  type VersionSyncOptions,
  VersionSyncReport,
  VersionSyncResolution,
  VersionSyncUpdateLocation,
} from "../Models.js";
import { BiomeSchemaState, buildBiomeReport, resolveBiomeSchema } from "../resolvers/BiomeResolver.js";
import { BunVersionState, buildBunReport, resolveBunVersions } from "../resolvers/BunResolver.js";
import { buildDockerReport, DockerImageState, resolveDockerImages } from "../resolvers/DockerResolver.js";
import { buildEffectReport, EffectCatalogState, resolveEffectCatalog } from "../resolvers/EffectResolver.js";
import { buildNodeReport, resolveNodeVersions } from "../resolvers/NodeResolver.js";
import { CategorySelectionService } from "./CategorySelectionService.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/services/ResolverService");
const stringEquivalence = S.toEquivalence(S.String);
const versionCategoryStatusEquivalence = S.toEquivalence(VersionCategoryStatus);

type ResolverEnvironment = FileSystem.FileSystem | Path.Path | HttpClient.HttpClient | CategorySelectionService;

/**
 * Service contract for resolving version drift state.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ResolverServiceShape = {
  readonly resolve: (
    repoRoot: string,
    options: VersionSyncOptions
  ) => Effect.Effect<VersionSyncResolution, VersionSyncError, ResolverEnvironment>;
};

/**
 * Service tag for resolver orchestration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class ResolverService extends ServiceMap.Service<ResolverService, ResolverServiceShape>()($I`ResolverService`) {}

const resolve: ResolverServiceShape["resolve"] = Effect.fn(function* (repoRoot, options) {
  const categorySelection = yield* CategorySelectionService;
  let categories = A.empty<VersionCategoryReport>();
  let nodeLocations = A.empty<VersionSyncUpdateLocation>();

  if (categorySelection.shouldCheck(options, "bun")) {
    const bunState = yield* resolveBunVersions(repoRoot, options.skipNetwork).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (error) {
          yield* Effect.logWarning(`Bun resolution failed: ${error.message}`);
          return new BunVersionState({});
        })
      )
    );

    if (Str.isNonEmpty(bunState.bunVersionFile)) {
      categories = A.append(categories, buildBunReport(bunState));
    }
  }

  if (categorySelection.shouldCheck(options, "node")) {
    const nodeState = yield* resolveNodeVersions(repoRoot);
    categories = A.append(categories, buildNodeReport(nodeState));

    nodeLocations = A.map(
      A.filter(nodeState.workflowLocations, (location) => !stringEquivalence(location.currentValue, nodeState.nvmrc)),
      (location) =>
        new VersionSyncUpdateLocation({
          file: location.file,
          yamlPath: location.yamlPath,
        })
    );
  }

  if (categorySelection.shouldCheck(options, "docker")) {
    const dockerState = yield* resolveDockerImages(repoRoot, options.skipNetwork).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (error) {
          yield* Effect.logWarning(`Docker resolution failed: ${error.message}`);
          return new DockerImageState({});
        })
      )
    );

    categories = A.append(categories, buildDockerReport(dockerState));
  }

  if (categorySelection.shouldCheck(options, "biome")) {
    const biomeState = yield* resolveBiomeSchema(repoRoot).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (error) {
          yield* Effect.logWarning(`Biome schema resolution failed: ${error.message}`);
          return new BiomeSchemaState({});
        })
      )
    );

    if (Str.isNonEmpty(biomeState.installedVersion)) {
      categories = A.append(categories, buildBiomeReport(biomeState));
    }
  }

  if (categorySelection.shouldCheck(options, "effect")) {
    const effectState = yield* resolveEffectCatalog(repoRoot).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (error) {
          yield* Effect.logWarning(`Effect catalog resolution failed: ${error.message}`);
          return new EffectCatalogState({});
        })
      )
    );

    categories = A.append(categories, buildEffectReport(effectState));
  }

  const report = new VersionSyncReport({
    categories,
    hasDrift: A.some(categories, (category) => !versionCategoryStatusEquivalence(category.status, "ok")),
  });

  return new VersionSyncResolution({
    report,
    nodeLocations,
  });
});

/**
 * Live layer for resolver orchestration.
 *
 * @since 0.0.0
 * @category Layers
 */
export const ResolverServiceLive = Layer.succeed(
  ResolverService,
  ResolverService.of({
    resolve,
  })
);
