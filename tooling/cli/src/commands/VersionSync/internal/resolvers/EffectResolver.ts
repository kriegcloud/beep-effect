/**
 * Effect catalog version resolver.
 *
 * Keeps the lockstep Effect v4 package family in the root `package.json`
 * `catalog` aligned with the canonical `effect` entry.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { thunkEmptyRecord, thunkEmptyStr, thunkSomeEmptyRecord } from "@beep/utils";
import { Effect, FileSystem, Inspectable, Order, Path } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { decodeJsoncTextAs, JsoncCodecServiceLive } from "../../../Shared/SchemaCodecs/index.js";
import {
  VersionCategoryReport,
  VersionCategoryStatusEnum,
  VersionCategoryStatusThunk,
  VersionDriftItem,
  VersionSyncError,
} from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/resolvers/EffectResolver");
const VERSION_SPECIFIER_PATTERN = /^([~^<>=\s]*)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;
const EXACT_VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const LOCKSTEP_EFFECT_PACKAGE_PREFIX = "@effect/";

class RootPackageJsonDocument extends S.Class<RootPackageJsonDocument>($I`RootPackageJsonDocument`)(
  {
    catalog: S.Record(S.String, S.String).pipe(
      S.withConstructorDefault(thunkSomeEmptyRecord<string, string>),
      S.withDecodingDefault(thunkEmptyRecord<string, string>)
    ),
  },
  $I.annote("RootPackageJsonDocument", {
    description: "Subset of root package.json fields required for Effect catalog version resolution.",
  })
) {}

class EffectCatalogPackage extends S.Class<EffectCatalogPackage>($I`EffectCatalogPackage`)(
  {
    name: S.String,
    versionSpecifier: S.String,
  },
  $I.annote("EffectCatalogPackage", {
    description: "Tracked Effect catalog dependency and its version specifier.",
  })
) {}

/**
 * Resolved Effect catalog state derived from the root `package.json` catalog entries.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EffectCatalogState extends S.Class<EffectCatalogState>($I`EffectCatalogState`)(
  {
    canonicalSpecifier: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
    packages: S.Array(EffectCatalogPackage).pipe(
      S.withConstructorDefault(() => O.some(A.empty<EffectCatalogPackage>())),
      S.withDecodingDefault(A.empty<EffectCatalogPackage>)
    ),
  },
  $I.annote("EffectCatalogState", {
    description: "Resolved lockstep Effect catalog dependency state from the root package.json.",
  })
) {}

type VersionSpecifierParts = {
  readonly prefix: string;
  readonly exact: string;
};

const splitVersionSpecifier = (specifier: string): O.Option<VersionSpecifierParts> => {
  const match = Str.match(VERSION_SPECIFIER_PATTERN)(Str.trim(specifier));

  if (match === null) {
    return O.none();
  }

  return O.some({
    prefix: match[1],
    exact: match[2],
  });
};

const parseMajorVersion = (exactVersion: string): O.Option<number> => {
  const match = Str.match(EXACT_VERSION_PATTERN)(exactVersion);

  if (match === null) {
    return O.none();
  }

  const major = Number.parseInt(match[1], 10);
  return Number.isNaN(major) ? O.none() : O.some(major);
};

const isLockstepEffectPackage = (packageName: string, versionSpecifier: string, canonicalMajor: number): boolean => {
  if (packageName === "effect") {
    return true;
  }

  if (!Str.startsWith(LOCKSTEP_EFFECT_PACKAGE_PREFIX)(packageName)) {
    return false;
  }

  const parts = splitVersionSpecifier(versionSpecifier);
  if (O.isNone(parts)) {
    return false;
  }

  const major = parseMajorVersion(parts.value.exact);
  return O.isSome(major) && major.value === canonicalMajor;
};

/**
 * Resolve the root package.json Effect catalog state.
 *
 * @since 0.0.0
 * @category Utility
 */
export const resolveEffectCatalog: (
  repoRoot: string
) => Effect.Effect<EffectCatalogState, VersionSyncError, FileSystem.FileSystem | Path.Path> = Effect.fn(
  function* (repoRoot) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
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

    const pkgJson = yield* decodeJsoncTextAs(RootPackageJsonDocument)(pkgJsonContent).pipe(
      Effect.provide(JsoncCodecServiceLive),
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to parse package.json: ${e.message}`,
            file: "package.json",
          })
      )
    );

    const canonicalSpecifier = O.getOrElse(R.get(pkgJson.catalog, "effect"), thunkEmptyStr);
    const canonicalMajor = O.flatMap(splitVersionSpecifier(canonicalSpecifier), (parts) =>
      parseMajorVersion(parts.exact)
    );
    let packages = A.empty<EffectCatalogPackage>();

    if (O.isSome(canonicalMajor)) {
      for (const packageName of A.sort(R.keys(pkgJson.catalog), Order.String)) {
        const versionSpecifier = pkgJson.catalog[packageName];

        if (!isLockstepEffectPackage(packageName, versionSpecifier, canonicalMajor.value)) {
          continue;
        }

        packages = A.append(packages, new EffectCatalogPackage({ name: packageName, versionSpecifier }));
      }
    }

    return new EffectCatalogState({ canonicalSpecifier, packages });
  }
);

/**
 * Build the Effect catalog category report from resolved state.
 *
 * @since 0.0.0
 * @category Utility
 * @param state - Resolved Effect catalog dependency state.
 * @returns The Effect-specific version drift report derived from the catalog state.
 */
export const buildEffectReport: (state: EffectCatalogState) => VersionCategoryReport = (state) => {
  if (Str.isEmpty(state.canonicalSpecifier)) {
    return VersionCategoryReport.cases.effect.makeUnsafe({
      status: VersionCategoryStatusEnum.error,
      items: A.empty(),
      latest: O.none(),
      error: O.some("effect not found in the root package.json catalog"),
    });
  }

  if (O.isNone(splitVersionSpecifier(state.canonicalSpecifier))) {
    return VersionCategoryReport.cases.effect.makeUnsafe({
      status: VersionCategoryStatusEnum.error,
      items: A.empty(),
      latest: O.some(state.canonicalSpecifier),
      error: O.some(`Unsupported effect catalog version specifier: ${state.canonicalSpecifier}`),
    });
  }

  let items = A.empty<VersionDriftItem>();

  for (const pkg of state.packages) {
    if (pkg.versionSpecifier === state.canonicalSpecifier) {
      continue;
    }

    items = A.append(
      items,
      new VersionDriftItem({
        file: "package.json",
        field: `catalog.${pkg.name}`,
        current: pkg.versionSpecifier,
        expected: state.canonicalSpecifier,
        line: O.none(),
      })
    );
  }

  return VersionCategoryReport.cases.effect.makeUnsafe({
    status: A.match(items, {
      onEmpty: VersionCategoryStatusThunk.ok,
      onNonEmpty: VersionCategoryStatusThunk.drift,
    }),
    items,
    latest: O.some(state.canonicalSpecifier),
    error: O.none(),
  });
};
