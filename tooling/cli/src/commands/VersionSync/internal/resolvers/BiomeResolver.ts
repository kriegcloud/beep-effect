/**
 * Biome schema version resolver.
 *
 * Compares the `$schema` URL version in `biome.jsonc` against the installed
 * `@biomejs/biome` version from the root `package.json` catalog.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { thunkEmptyRecord, thunkEmptyStr, thunkSomeEmptyRecord } from "@beep/utils";
import { Effect, FileSystem, Inspectable, identity, Path, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as jsonc from "jsonc-parser";
import { decodeJsoncTextAsLive } from "../../../Shared/SchemaCodecs/index.js";
import {
  VersionCategoryReport,
  VersionCategoryStatusEnum,
  VersionCategoryStatusThunk,
  VersionDriftItem,
  VersionSyncError,
} from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/resolvers/BiomeResolver");

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
const BIOME_SCHEMA_URL_PATTERN = /^https:\/\/biomejs\.dev\/schemas\/[^/]+\/schema\.json$/;

const BiomeSchemaUrl = S.String.check(S.isPattern(BIOME_SCHEMA_URL_PATTERN)).pipe(
  S.brand("BiomeSchemaUrl"),
  S.annotate(
    $I.annote("BiomeSchemaUrl", {
      description: "Biome schema URL in canonical https://biomejs.dev/schemas/<version>/schema.json format.",
    })
  )
);

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract the version from a Biome schema URL.
 *
 * @since 0.0.0
 * @category Utility
 * @param schemaUrl - The `$schema` URL from `biome.jsonc`.
 * @returns The extracted version, or `None` if the URL format is unrecognized.
 */
const BiomeSchemaUrlToVersion = BiomeSchemaUrl.pipe(
  S.decodeTo(
    S.String,
    SchemaTransformation.transform({
      decode: (schemaUrl) => Str.slice(BIOME_SCHEMA_PREFIX.length, -BIOME_SCHEMA_SUFFIX.length)(schemaUrl),
      encode: (version) => BiomeSchemaUrl.makeUnsafe(`${BIOME_SCHEMA_PREFIX}${version}${BIOME_SCHEMA_SUFFIX}`),
    })
  ),
  S.annotate(
    $I.annote("BiomeSchemaUrlToVersion", {
      description: "Schema transformation between canonical Biome schema URL and bare version string.",
    })
  )
);

/**
 * Extract exact version from a catalog version specifier (strip `^`, `~`, etc.).
 *
 * @since 0.0.0
 * @category Utility
 * @param version - The version specifier (e.g. `^2.4.4`).
 * @returns The bare version string without range prefix.
 */
const VersionSpecifierToExactVersion = S.String.pipe(
  S.decodeTo(
    S.String,
    SchemaTransformation.transform({
      decode: Str.replace(/^[~^>=<]+/, ""),
      encode: identity,
    })
  ),
  S.annotate(
    $I.annote("VersionSpecifierToExactVersion", {
      description: "Schema transformation that strips semver range prefixes from dependency version specifiers.",
    })
  )
);

/**
 * Build a schema URL from a version string.
 *
 * @since 0.0.0
 * @category Utility
 * @param version - The Biome version (e.g. `2.4.4`).
 * @returns The full `$schema` URL for `biome.jsonc`.
 */
const buildSchemaUrl = (version: string): string => `${BIOME_SCHEMA_PREFIX}${version}${BIOME_SCHEMA_SUFFIX}`;
const decodeSchemaVersion = S.decodeUnknownOption(BiomeSchemaUrlToVersion);
const decodeExactVersion = S.decodeUnknownSync(VersionSpecifierToExactVersion);

class BiomeJsoncDocument extends S.Class<BiomeJsoncDocument>($I`BiomeJsoncDocument`)(
  {
    $schema: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
  },
  $I.annote("BiomeJsoncDocument", {
    description: "Subset of biome.jsonc used to resolve current schema URL.",
  })
) {}

class RootPackageJsonDocument extends S.Class<RootPackageJsonDocument>($I`RootPackageJsonDocument`)(
  {
    catalog: S.Record(S.String, S.String).pipe(
      S.withConstructorDefault(thunkSomeEmptyRecord<string, string>),
      S.withDecodingDefault(thunkEmptyRecord<string, string>)
    ),
    devDependencies: S.Record(S.String, S.String).pipe(
      S.withConstructorDefault(thunkSomeEmptyRecord<string, string>),
      S.withDecodingDefault(thunkEmptyRecord<string, string>)
    ),
  },
  $I.annote("RootPackageJsonDocument", {
    description: "Subset of root package.json fields required for Biome version resolution.",
  })
) {}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolved Biome schema state.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BiomeSchemaState extends S.Class<BiomeSchemaState>($I`BiomeSchemaState`)(
  {
    schemaUrl: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
    schemaVersion: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
    installedVersion: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
  },
  $I.annote("BiomeSchemaState", {
    description: "Resolved Biome schema state.",
  })
) {}

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
    const biomeContent = yield* fs.readFileString(biomePath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read biome.jsonc: ${Inspectable.toStringUnknown(e, 0)}`,
            file: "biome.jsonc",
          })
      )
    );

    const biomeJson = yield* decodeJsoncTextAsLive(BiomeJsoncDocument)(biomeContent).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to parse biome.jsonc: ${e.message}`,
            file: "biome.jsonc",
          })
      )
    );

    const schemaUrl = biomeJson.$schema;
    const schemaVersion = decodeSchemaVersion(schemaUrl);

    // Read installed version from root package.json catalog
    const pkgJsonPath = path.join(repoRoot, "package.json");
    const pkgJsonContent = yield* fs.readFileString(pkgJsonPath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read package.json: ${Inspectable.toStringUnknown(e, 0)}`,
            file: "package.json",
          })
      )
    );

    const pkgJson = yield* decodeJsoncTextAsLive(RootPackageJsonDocument)(pkgJsonContent).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to parse package.json: ${e.message}`,
            file: "package.json",
          })
      )
    );

    const rawVersion = O.getOrElse(
      O.orElse(R.get(pkgJson.catalog, "@biomejs/biome"), () => R.get(pkgJson.devDependencies, "@biomejs/biome")),
      thunkEmptyStr
    );

    const installedVersion = decodeExactVersion(rawVersion);

    return new BiomeSchemaState({ schemaUrl, schemaVersion, installedVersion });
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
  let items = A.empty<VersionDriftItem>();

  if (Str.isEmpty(state.installedVersion)) {
    return VersionCategoryReport.cases.biome.makeUnsafe({
      status: VersionCategoryStatusEnum.ok,
      items,
      latest: O.none(),
      error: O.some("@biomejs/biome not found in catalog or devDependencies"),
    });
  }

  const currentVersion = O.getOrElse(state.schemaVersion, () => "<missing>");
  const expectedVersion = state.installedVersion;

  if (currentVersion !== expectedVersion) {
    items = A.append(
      items,
      new VersionDriftItem({
        file: "biome.jsonc",
        field: "$schema version",
        current: currentVersion,
        expected: expectedVersion,
        line: O.none(),
      })
    );
  }

  return VersionCategoryReport.cases.biome.makeUnsafe({
    status: A.match(items, {
      onEmpty: VersionCategoryStatusThunk.ok,
      onNonEmpty: VersionCategoryStatusThunk.drift,
    }),
    items,
    latest: O.some(expectedVersion),
    error: O.none(),
  });
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
) => Effect.Effect<boolean, VersionSyncError, FileSystem.FileSystem> = Effect.fn("updateBiomeSchema")(
  function* (filePath, version) {
    const fs = yield* FileSystem.FileSystem;

    const original = yield* fs.readFileString(filePath).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    const newSchemaUrl = buildSchemaUrl(version);

    const edits = jsonc.modify(original, ["$schema"], newSchemaUrl, {
      formattingOptions: { tabSize: 2, insertSpaces: true },
    });

    if (A.isReadonlyArrayEmpty(edits)) {
      return false;
    }

    const updated = jsonc.applyEdits(original, edits);

    if (updated === original) {
      return false;
    }

    yield* fs.writeFileString(filePath, updated).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to write ${filePath}: ${Inspectable.toStringUnknown(e, 0)}`,
            file: filePath,
          })
      )
    );

    return true;
  }
);
