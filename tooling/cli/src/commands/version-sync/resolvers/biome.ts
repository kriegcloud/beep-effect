/**
 * Biome schema version resolver.
 *
 * Compares the `$schema` URL version in `biome.jsonc` against the installed
 * `@biomejs/biome` version from the root `package.json` catalog.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as jsonc from "jsonc-parser";
import type { VersionCategoryReport, VersionDriftItem } from "../types.js";
import { VersionSyncError } from "../types.js";

// ── Constants ───────────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category Configuration
 */
const BIOME_SCHEMA_PREFIX = "https://biomejs.dev/schemas/";

/**
 * @since 0.0.0
 * @category Configuration
 */
const BIOME_SCHEMA_SUFFIX = "/schema.json";

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the version from a Biome schema URL.
 *
 * @since 0.0.0
 * @category Utility
 * @param schemaUrl - The `$schema` URL from `biome.jsonc`.
 * @returns The extracted version, or `None` if the URL format is unrecognized.
 */
const extractSchemaVersion = (schemaUrl: string): O.Option<string> => {
  if (!Str.startsWith(BIOME_SCHEMA_PREFIX)(schemaUrl)) return O.none();
  if (!Str.endsWith(BIOME_SCHEMA_SUFFIX)(schemaUrl)) return O.none();
  const version = Str.slice(BIOME_SCHEMA_PREFIX.length, -BIOME_SCHEMA_SUFFIX.length)(schemaUrl);
  return Str.isEmpty(version) ? O.none() : O.some(version);
};

/**
 * Extract exact version from a catalog version specifier (strip `^`, `~`, etc.).
 *
 * @since 0.0.0
 * @category Utility
 * @param version - The version specifier (e.g. `^2.4.4`).
 * @returns The bare version string without range prefix.
 */
const stripVersionPrefix = Str.replace(/^[~^>=<]+/, "");

/**
 * Build a schema URL from a version string.
 *
 * @since 0.0.0
 * @category Utility
 * @param version - The Biome version (e.g. `2.4.4`).
 * @returns The full `$schema` URL for `biome.jsonc`.
 */
const buildSchemaUrl = (version: string): string => `${BIOME_SCHEMA_PREFIX}${version}${BIOME_SCHEMA_SUFFIX}`;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolved Biome schema state.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface BiomeSchemaState {
  readonly schemaUrl: string;
  readonly schemaVersion: O.Option<string>;
  readonly installedVersion: string;
}

/**
 * Resolve current Biome schema version from `biome.jsonc` and installed version from `package.json` catalog.
 *
 * @since 0.0.0
 * @category Utility
 */
export const resolveBiomeSchema: (
  repoRoot: string
) => Effect.Effect<BiomeSchemaState, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Read biome.jsonc
    const biomePath = path.join(repoRoot, "biome.jsonc");
    const biomeContent = yield* fs
      .readFileString(biomePath)
      .pipe(
        Effect.mapError(
          (e) => new VersionSyncError({ message: `Failed to read biome.jsonc: ${String(e)}`, file: "biome.jsonc" })
        )
      );

    const biomeParseErrors = A.empty<jsonc.ParseError>();
    const biomeJson = jsonc.parse(biomeContent, biomeParseErrors);
    if (A.length(biomeParseErrors) > 0 || !isRecord(biomeJson)) {
      return yield* new VersionSyncError({ message: "Failed to parse biome.jsonc", file: "biome.jsonc" });
    }

    const schemaUrl = P.isString(biomeJson.$schema) ? biomeJson.$schema : "";
    const schemaVersion = extractSchemaVersion(schemaUrl);

    // Read installed version from root package.json catalog
    const pkgJsonPath = path.join(repoRoot, "package.json");
    const pkgJsonContent = yield* fs
      .readFileString(pkgJsonPath)
      .pipe(
        Effect.mapError(
          (e) => new VersionSyncError({ message: `Failed to read package.json: ${String(e)}`, file: "package.json" })
        )
      );

    const pkgParseErrors = A.empty<jsonc.ParseError>();
    const pkgJson = jsonc.parse(pkgJsonContent, pkgParseErrors);
    if (A.length(pkgParseErrors) > 0 || !isRecord(pkgJson)) {
      return yield* new VersionSyncError({ message: "Failed to parse package.json", file: "package.json" });
    }

    // Look in catalog first, then devDependencies
    const catalog = isRecord(pkgJson.catalog) ? pkgJson.catalog : {};
    const devDeps = isRecord(pkgJson.devDependencies) ? pkgJson.devDependencies : {};

    const rawVersion: string = Str.isString(catalog["@biomejs/biome"])
      ? catalog["@biomejs/biome"]
      : Str.isString(devDeps["@biomejs/biome"])
        ? devDeps["@biomejs/biome"]
        : "";

    const installedVersion = stripVersionPrefix(rawVersion);

    return { schemaUrl, schemaVersion, installedVersion };
  }
);

/**
 * Build the Biome schema category report from resolved state.
 *
 * @since 0.0.0
 * @category Utility
 * @param state - The resolved Biome schema state.
 * @returns The version category report for the Biome schema.
 */
export const buildBiomeReport: (state: BiomeSchemaState) => VersionCategoryReport = (state) => {
  const items = A.empty<VersionDriftItem>();

  if (Str.isEmpty(state.installedVersion)) {
    return {
      category: "biome" as const,
      status: "ok" as const,
      items,
      latest: O.none(),
      error: O.some("@biomejs/biome not found in catalog or devDependencies"),
    };
  }

  const currentVersion = O.getOrElse(state.schemaVersion, () => "<missing>");
  const expectedVersion = state.installedVersion;

  if (currentVersion !== expectedVersion) {
    items.push({
      file: "biome.jsonc",
      field: "$schema version",
      current: currentVersion,
      expected: expectedVersion,
      line: O.none(),
    });
  }

  return {
    category: "biome" as const,
    status: A.length(items) > 0 ? ("drift" as const) : ("ok" as const),
    items,
    latest: O.some(expectedVersion),
    error: O.none(),
  };
};

/**
 * Update the `$schema` field in `biome.jsonc` to match the installed version.
 *
 * @since 0.0.0
 * @category Utility
 */
export const updateBiomeSchema: (
  filePath: string,
  version: string
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn(function* (filePath, version) {
  const fs = yield* FileSystem.FileSystem;

  const original = yield* fs
    .readFileString(filePath)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to read ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  const newSchemaUrl = buildSchemaUrl(version);

  const edits = jsonc.modify(original, ["$schema"], newSchemaUrl, {
    formattingOptions: { tabSize: 2, insertSpaces: true },
  });

  if (A.length(edits) === 0) {
    return false;
  }

  const updated = jsonc.applyEdits(original, edits);

  if (updated === original) {
    return false;
  }

  yield* fs
    .writeFileString(filePath, updated)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to write ${filePath}: ${String(e)}`, file: filePath })
      )
    );

  return true;
});
