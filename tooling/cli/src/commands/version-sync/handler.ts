/**
 * Version sync handler — orchestrates resolution, reporting, and file updates.
 *
 * @since 0.0.0
 * @module
 */

import { findRepoRoot, type NoSuchFileError } from "@beep/repo-utils";
import { Console, Effect, type FileSystem, MutableHashMap, Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type { HttpClient } from "effect/unstable/http";
import { buildBiomeReport, resolveBiomeSchema, updateBiomeSchema } from "./resolvers/biome.js";
import { type BunVersionState, buildBunReport, resolveBunVersions } from "./resolvers/bun.js";
import { buildDockerReport, type DockerImageState, resolveDockerImages } from "./resolvers/docker.js";
import { buildNodeReport, resolveNodeVersions } from "./resolvers/node.js";
import type { VersionCategoryReport, VersionSyncMode, VersionSyncOptions, VersionSyncReport } from "./types.js";
import { VersionSyncDriftError, type VersionSyncError } from "./types.js";
import { updatePackageManagerField } from "./updaters/package-json.js";
import { updatePlainTextFile } from "./updaters/plain-text.js";
import { replaceNodeVersionWithFile, updateYamlValue } from "./updaters/yaml-file.js";

// ── Report rendering ────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category functions
 */
const renderCategoryReport: (report: VersionCategoryReport) => Effect.Effect<void> = Effect.fn(function* (report) {
  const categoryLabel =
    report.category === "bun"
      ? "Bun Runtime"
      : report.category === "node"
        ? "Node.js Runtime"
        : report.category === "biome"
          ? "Biome Schema"
          : "Docker Images";

  yield* Console.log(`\n${categoryLabel}:`);

  if (O.isSome(report.latest)) {
    yield* Console.log(`  Latest: ${report.latest.value}`);
  }

  if (A.length(report.items) === 0) {
    yield* Console.log("  Status: OK (no drift)");
    return;
  }

  for (const item of report.items) {
    const arrow = item.current !== item.expected ? ` -> ${item.expected}` : "";
    yield* Console.log(`  ${item.file} ${item.field}: ${item.current}${arrow}`);
  }

  const statusText =
    report.status === "drift"
      ? "DRIFT"
      : report.status === "unpinned"
        ? "UNPINNED"
        : report.status === "error"
          ? "ERROR"
          : "OK";

  yield* Console.log(`  Status: ${statusText}`);

  if (O.isSome(report.error)) {
    yield* Console.log(`  Error: ${report.error.value}`);
  }
});

/**
 * @since 0.0.0
 * @category functions
 */
const renderReport: (report: VersionSyncReport, mode: VersionSyncMode) => Effect.Effect<void> = Effect.fn(
  function* (report, mode) {
    const modeLabel = mode === "check" ? "Check" : mode === "dry-run" ? "Dry Run" : "Write";
    yield* Console.log(`\nVersion Sync Report (${modeLabel})`);
    yield* Console.log("===================");

    for (const category of report.categories) {
      yield* renderCategoryReport(category);
    }

    if (report.hasDrift) {
      if (mode === "check") {
        yield* Console.log("\nRun `beep version-sync --write` to apply fixes.");
      } else if (mode === "dry-run") {
        yield* Console.log("\nRun `beep version-sync --write` to apply these changes.");
      }
    } else {
      yield* Console.log("\nAll versions are in sync.");
    }
  }
);

// ── Write mode ──────────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category functions
 */
const applyBunUpdates: (
  repoRoot: string,
  report: VersionCategoryReport
) => Effect.Effect<number, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, report) {
    const path = yield* Path.Path;
    let filesChanged = 0;

    for (const item of report.items) {
      if (item.file === ".bun-version") {
        const filePath = path.join(repoRoot, ".bun-version");
        const changed = yield* updatePlainTextFile(filePath, item.expected);
        if (changed) filesChanged += 1;
      } else if (item.file === "package.json" && item.field === "packageManager") {
        const filePath = path.join(repoRoot, "package.json");
        // Extract version from "bun@X.Y.Z"
        const version = Str.replace(/^bun@/, "")(item.expected);
        const changed = yield* updatePackageManagerField(filePath, version);
        if (changed) filesChanged += 1;
      }
    }

    return filesChanged;
  }
);

/**
 * @since 0.0.0
 * @category functions
 */
const applyNodeUpdates: (
  repoRoot: string,
  workflowLocations: ReadonlyArray<{ readonly file: string; readonly yamlPath: ReadonlyArray<string | number> }>
) => Effect.Effect<number, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, workflowLocations) {
    const path = yield* Path.Path;

    // Group locations by file
    const byFile = MutableHashMap.empty<string, Array<{ readonly yamlPath: ReadonlyArray<string | number> }>>();
    for (const loc of workflowLocations) {
      const existing = MutableHashMap.get(byFile, loc.file);
      if (O.isSome(existing)) {
        MutableHashMap.set(byFile, loc.file, A.append(existing.value, { yamlPath: loc.yamlPath }));
      } else {
        MutableHashMap.set(byFile, loc.file, [{ yamlPath: loc.yamlPath }]);
      }
    }

    let filesChanged = 0;

    for (const [file, locations] of byFile) {
      const filePath = path.join(repoRoot, file);
      const changed = yield* replaceNodeVersionWithFile(filePath, locations);
      if (changed) filesChanged += 1;
    }

    return filesChanged;
  }
);

/**
 * @since 0.0.0
 * @category functions
 */
const applyDockerUpdates: (
  repoRoot: string,
  report: VersionCategoryReport
) => Effect.Effect<number, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, report) {
    const path = yield* Path.Path;
    const composePath = path.join(repoRoot, "docker-compose.yml");
    let filesChanged = 0;

    for (const item of report.items) {
      if (item.expected.includes("<pin to")) {
        // Can't update without a resolved version
        continue;
      }

      // Extract the image tag from expected (repository:tag)
      const colonIdx = O.getOrElse(O.fromUndefinedOr(Str.lastIndexOf(":")(item.expected)), () => -1);
      if (colonIdx < 0) continue;

      const newImageValue = item.expected;

      // Extract the service name from field "image (serviceName)"
      const serviceMatch = Str.match(/\(([^)]+)\)/)(item.field);
      if (serviceMatch === null) continue;
      const serviceName = serviceMatch[1];

      const yamlPath = ["services", serviceName, "image"];
      const changed = yield* updateYamlValue(composePath, yamlPath, newImageValue);
      if (changed) filesChanged += 1;
    }

    return filesChanged;
  }
);

/**
 * @since 0.0.0
 * @category functions
 */
const applyBiomeUpdates: (
  repoRoot: string,
  report: VersionCategoryReport
) => Effect.Effect<number, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot, report) {
    const path = yield* Path.Path;
    let filesChanged = 0;

    for (const item of report.items) {
      if (item.file === "biome.jsonc" && item.field === "$schema version") {
        const filePath = path.join(repoRoot, "biome.jsonc");
        const changed = yield* updateBiomeSchema(filePath, item.expected);
        if (changed) filesChanged += 1;
      }
    }

    return filesChanged;
  }
);

// ── Main handler ────────────────────────────────────────────────────────────

/**
 * Execute the version-sync command.
 *
 * @since 0.0.0
 * @category functions
 */
export const handleVersionSync: (
  options: VersionSyncOptions
) => Effect.Effect<
  void,
  VersionSyncError | VersionSyncDriftError | NoSuchFileError,
  FileSystem.FileSystem | Path.Path | HttpClient.HttpClient
> = Effect.fn(function* (options) {
  const repoRoot = yield* findRepoRoot();

  const shouldCheck = (category: "bun" | "node" | "docker" | "biome"): boolean => {
    if (!options.bunOnly && !options.nodeOnly && !options.dockerOnly && !options.biomeOnly) return true;
    if (category === "bun") return options.bunOnly;
    if (category === "node") return options.nodeOnly;
    if (category === "docker") return options.dockerOnly;
    if (category === "biome") return options.biomeOnly;
    return false;
  };

  let categories = A.empty<VersionCategoryReport>();

  // Store resolver state for write mode
  let nodeLocations: ReadonlyArray<{ readonly file: string; readonly yamlPath: ReadonlyArray<string | number> }> =
    A.empty();

  // Resolve Bun
  if (shouldCheck("bun")) {
    const bunState = yield* resolveBunVersions(repoRoot, options.skipNetwork).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (e) {
          yield* Effect.logWarning(`Bun resolution failed: ${e.message}`);
          return {
            bunVersionFile: "",
            packageManagerField: "",
            latest: O.none<string>(),
          } satisfies BunVersionState;
        })
      )
    );
    if (bunState.bunVersionFile !== "") {
      categories = A.append(categories, buildBunReport(bunState));
    }
  }

  // Resolve Node
  if (shouldCheck("node")) {
    const nodeState = yield* resolveNodeVersions(repoRoot);
    categories = A.append(categories, buildNodeReport(nodeState));

    // Store locations for write mode
    nodeLocations = A.filter(nodeState.workflowLocations, (loc) => loc.currentValue !== nodeState.nvmrc);
  }

  // Resolve Docker
  if (shouldCheck("docker")) {
    const dockerState = yield* resolveDockerImages(repoRoot, options.skipNetwork).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (e) {
          yield* Effect.logWarning(`Docker resolution failed: ${e.message}`);
          return { images: A.empty() } satisfies DockerImageState;
        })
      )
    );
    categories = A.append(categories, buildDockerReport(dockerState));
  }

  // Resolve Biome schema
  if (shouldCheck("biome")) {
    const biomeState = yield* resolveBiomeSchema(repoRoot).pipe(
      Effect.catchTag(
        "VersionSyncError",
        Effect.fn(function* (e) {
          yield* Effect.logWarning(`Biome schema resolution failed: ${e.message}`);
          return { schemaUrl: "", schemaVersion: O.none<string>(), installedVersion: "" };
        })
      )
    );
    if (!Str.isEmpty(biomeState.installedVersion)) {
      categories = A.append(categories, buildBiomeReport(biomeState));
    }
  }

  const hasDrift = A.some(categories, (c) => c.status !== "ok");
  const report: VersionSyncReport = { categories, hasDrift };

  // Render report
  yield* renderReport(report, options.mode);

  // Apply updates in write mode
  if (options.mode === "write" && hasDrift) {
    let totalChanges = 0;

    const bunReport = A.findFirst(categories, (c) => c.category === "bun");
    if (O.isSome(bunReport) && A.length(bunReport.value.items) > 0) {
      const changed = yield* applyBunUpdates(repoRoot, bunReport.value);
      totalChanges += changed;
    }

    if (A.length(nodeLocations) > 0) {
      const changed = yield* applyNodeUpdates(repoRoot, nodeLocations);
      totalChanges += changed;
    }

    const dockerReport = A.findFirst(categories, (c) => c.category === "docker");
    if (O.isSome(dockerReport) && A.length(dockerReport.value.items) > 0) {
      const changed = yield* applyDockerUpdates(repoRoot, dockerReport.value);
      totalChanges += changed;
    }

    const biomeReport = A.findFirst(categories, (c) => c.category === "biome");
    if (O.isSome(biomeReport) && A.length(biomeReport.value.items) > 0) {
      const changed = yield* applyBiomeUpdates(repoRoot, biomeReport.value);
      totalChanges += changed;
    }

    yield* Console.log(`\nApplied ${String(totalChanges)} file update(s).`);
  }

  // Exit code in check mode
  if (options.mode === "check" && hasDrift) {
    const driftCount = A.reduce(categories, 0, (acc, c) => acc + A.length(c.items));
    return yield* new VersionSyncDriftError({
      message: `Version drift detected: ${String(driftCount)} item(s) need updating`,
      driftCount,
    });
  }
});
