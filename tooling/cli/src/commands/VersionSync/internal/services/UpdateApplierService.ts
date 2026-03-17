/**
 * Write-mode update application service for version-sync.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect, type FileSystem, Layer, Match, MutableHashMap, Path, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { VersionCategoryReport, VersionSyncError, VersionSyncResolution } from "../Models.js";
import { updateBiomeSchema } from "../resolvers/BiomeResolver.js";
import { updateCatalogEntry, updatePackageManagerField } from "../updaters/PackageJsonUpdater.js";
import { updatePlainTextFile } from "../updaters/PlainTextUpdater.js";
import { replaceNodeVersionWithFile, updateYamlValue } from "../updaters/YamlFileUpdater.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/services/UpdateApplierService");
const VersionCategoryName = LiteralKit(["bun", "node", "docker", "biome", "effect"]).annotate(
  $I.annote("VersionCategoryName", {
    description: "Supported update categories for write-mode version-sync application.",
  })
);
const versionCategoryNameEquivalence = S.toEquivalence(VersionCategoryName);

type UpdateApplierEnvironment = FileSystem.FileSystem | Path.Path;

/**
 * Service contract for applying report-driven file updates.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UpdateApplierServiceShape = {
  readonly apply: (
    repoRoot: string,
    resolution: VersionSyncResolution
  ) => Effect.Effect<number, VersionSyncError, UpdateApplierEnvironment>;
};

/**
 * Service tag for write-mode update application.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class UpdateApplierService extends ServiceMap.Service<UpdateApplierService, UpdateApplierServiceShape>()(
  $I`UpdateApplierService`
) {}

const applyBunUpdates = Effect.fn(function* (repoRoot: string, report: VersionCategoryReport) {
  const path = yield* Path.Path;
  let filesChanged = 0;

  for (const item of report.items) {
    const changed = yield* Match.value(`${item.file}:${item.field}`).pipe(
      Match.when(".bun-version:version", () => updatePlainTextFile(path.join(repoRoot, ".bun-version"), item.expected)),
      Match.when("package.json:packageManager", () =>
        updatePackageManagerField(path.join(repoRoot, "package.json"), Str.replace(/^bun@/, "")(item.expected))
      ),
      Match.orElse(() => Effect.succeed(false))
    );

    filesChanged += changed ? 1 : 0;
  }

  return filesChanged;
});

const applyNodeUpdates = Effect.fn(function* (
  repoRoot: string,
  locations: ReadonlyArray<{ readonly file: string; readonly yamlPath: ReadonlyArray<string | number> }>
) {
  const path = yield* Path.Path;
  const grouped = MutableHashMap.empty<string, Array<{ readonly yamlPath: ReadonlyArray<string | number> }>>();
  let filesChanged = 0;

  for (const location of locations) {
    const existing = MutableHashMap.get(grouped, location.file);
    MutableHashMap.set(
      grouped,
      location.file,
      O.match(existing, {
        onNone: () => [{ yamlPath: location.yamlPath }],
        onSome: (entries) => A.append(entries, { yamlPath: location.yamlPath }),
      })
    );
  }

  for (const [file, yamlLocations] of grouped) {
    const changed = yield* replaceNodeVersionWithFile(path.join(repoRoot, file), yamlLocations);
    filesChanged += changed ? 1 : 0;
  }

  return filesChanged;
});

const applyDockerUpdates = Effect.fn(function* (repoRoot: string, report: VersionCategoryReport) {
  const path = yield* Path.Path;
  const composePath = path.join(repoRoot, "docker-compose.yml");
  let filesChanged = 0;

  for (const item of report.items) {
    if (Str.includes("<pin to")(item.expected)) {
      continue;
    }

    const colonIdx = O.getOrElse(Str.lastIndexOf(":")(item.expected), () => -1);
    if (colonIdx < 0) {
      continue;
    }

    const serviceName = O.flatMap(Str.match(/\(([^)]+)\)/)(item.field), (match) => O.fromUndefinedOr(match[1]));
    if (O.isNone(serviceName)) {
      continue;
    }

    const changed = yield* updateYamlValue(composePath, ["services", serviceName.value, "image"], item.expected);
    filesChanged += changed ? 1 : 0;
  }

  return filesChanged;
});

const applyBiomeUpdates = Effect.fn(function* (repoRoot: string, report: VersionCategoryReport) {
  const path = yield* Path.Path;
  let filesChanged = 0;

  for (const item of report.items) {
    const changed = yield* Match.value(`${item.file}:${item.field}`).pipe(
      Match.when("biome.jsonc:$schema version", () =>
        updateBiomeSchema(path.join(repoRoot, "biome.jsonc"), item.expected)
      ),
      Match.orElse(() => Effect.succeed(false))
    );
    filesChanged += changed ? 1 : 0;
  }

  return filesChanged;
});

const EFFECT_CATALOG_FIELD_PREFIX = "catalog.";

const applyEffectUpdates = Effect.fn(function* (repoRoot: string, report: VersionCategoryReport) {
  const path = yield* Path.Path;
  const packageJsonPath = path.join(repoRoot, "package.json");
  let filesChanged = 0;

  for (const item of report.items) {
    if (!Str.startsWith(EFFECT_CATALOG_FIELD_PREFIX)(item.field)) {
      continue;
    }

    const dependencyName = Str.slice(EFFECT_CATALOG_FIELD_PREFIX.length)(item.field);
    if (Str.isEmpty(dependencyName)) {
      continue;
    }

    const changed = yield* updateCatalogEntry(packageJsonPath, dependencyName, item.expected);
    filesChanged += changed ? 1 : 0;
  }

  return filesChanged;
});

const apply: UpdateApplierServiceShape["apply"] = Effect.fn(function* (repoRoot, resolution) {
  let totalChanges = 0;

  const bunReport = A.findFirst(resolution.report.categories, (category) =>
    versionCategoryNameEquivalence(category.category, "bun")
  );
  const dockerReport = A.findFirst(resolution.report.categories, (category) =>
    versionCategoryNameEquivalence(category.category, "docker")
  );
  const biomeReport = A.findFirst(resolution.report.categories, (category) =>
    versionCategoryNameEquivalence(category.category, "biome")
  );
  const effectReport = A.findFirst(resolution.report.categories, (category) =>
    versionCategoryNameEquivalence(category.category, "effect")
  );

  totalChanges += yield* O.match(bunReport, {
    onNone: () => Effect.succeed(0),
    onSome: (report) =>
      A.match(report.items, {
        onEmpty: () => Effect.succeed(0),
        onNonEmpty: () => applyBunUpdates(repoRoot, report),
      }),
  });

  totalChanges += yield* A.match(resolution.nodeLocations, {
    onEmpty: () => Effect.succeed(0),
    onNonEmpty: (locations) =>
      applyNodeUpdates(
        repoRoot,
        A.map(locations, (location) => ({ file: location.file, yamlPath: location.yamlPath }))
      ),
  });

  totalChanges += yield* O.match(dockerReport, {
    onNone: () => Effect.succeed(0),
    onSome: (report) =>
      A.match(report.items, {
        onEmpty: () => Effect.succeed(0),
        onNonEmpty: () => applyDockerUpdates(repoRoot, report),
      }),
  });

  totalChanges += yield* O.match(biomeReport, {
    onNone: () => Effect.succeed(0),
    onSome: (report) =>
      A.match(report.items, {
        onEmpty: () => Effect.succeed(0),
        onNonEmpty: () => applyBiomeUpdates(repoRoot, report),
      }),
  });

  totalChanges += yield* O.match(effectReport, {
    onNone: () => Effect.succeed(0),
    onSome: (report) =>
      A.match(report.items, {
        onEmpty: () => Effect.succeed(0),
        onNonEmpty: () => applyEffectUpdates(repoRoot, report),
      }),
  });

  return totalChanges;
});

/**
 * Live layer for update application.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const UpdateApplierServiceLive = Layer.succeed(
  UpdateApplierService,
  UpdateApplierService.of({
    apply,
  })
);
