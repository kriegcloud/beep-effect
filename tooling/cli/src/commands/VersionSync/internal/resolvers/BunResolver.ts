/**
 * Bun version resolver.
 *
 * Reads current Bun version from `.bun-version` and `package.json` `packageManager`,
 * and optionally fetches the latest stable release from GitHub.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { decodeJsoncTextAs } from "@beep/schema/Jsonc";
import { A as CommonArray, thunkEmptyStr } from "@beep/utils";
import { Effect, FileSystem, Inspectable, identity, Path } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import {
  NetworkUnavailableError,
  VersionCategoryReport,
  VersionCategoryStatusThunk,
  VersionDriftItem,
  VersionSyncError,
} from "../Models.js";

const $I = $RepoCliId.create("commands/VersionSync/internal/resolvers/BunResolver");
// ── GitHub API schema ───────────────────────────────────────────────────────

/**
 * @category Validation
 * @since 0.0.0
 */

class BunRelease extends S.Class<BunRelease>($I`BunRelease`)(
  {
    tag_name: S.String,
    prerelease: S.Boolean,
    draft: S.Boolean,
  },
  $I.annote("BunRelease", {
    description: "GitHub release schema for Bun releases",
  })
) {}

class BunPackageJsonDocument extends S.Class<BunPackageJsonDocument>($I`BunPackageJsonDocument`)(
  {
    packageManager: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
  },
  $I.annote("BunPackageJsonDocument", {
    description: "Subset of root package.json fields required by the Bun resolver.",
  })
) {}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * @category Configuration
 * @since 0.0.0
 */
const BUN_RELEASE_URL = "https://api.github.com/repos/oven-sh/bun/releases/latest";

/**
 * Strip the `bun-v` prefix from a GitHub release tag name.
 *
 * @param tagName - The GitHub release tag (e.g. `bun-v1.3.9`).
 * @returns The bare version string.
 * @category Utility
 * @since 0.0.0
 */
const extractBunVersion = Str.replace(/^bun-v/, "");

/**
 * Strip the `bun@` prefix from a `packageManager` field value.
 *
 * @param value - The packageManager field value (e.g. `bun@1.3.9`).
 * @returns The bare version string.
 * @category Utility
 * @since 0.0.0
 */
const extractPackageManagerVersion = Str.replace(/^bun@/, "");
const BUN_SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const NUMERIC_PRERELEASE_IDENTIFIER = /^\d+$/;

type BunSemverIdentifier = number | string;

type BunSemver = Readonly<{
  readonly core: readonly [number, number, number];
  readonly prerelease: O.Option<A.NonEmptyReadonlyArray<BunSemverIdentifier>>;
}>;

const parseBunVersionPart = (value: string): O.Option<number> => {
  const parsed = globalThis.Number(value);
  return globalThis.Number.isInteger(parsed) && parsed >= 0 ? O.some(parsed) : O.none();
};

const parsePrereleaseIdentifier = (value: string): O.Option<BunSemverIdentifier> =>
  O.isSome(Str.match(NUMERIC_PRERELEASE_IDENTIFIER)(value))
    ? parseBunVersionPart(value)
    : Str.isNonEmpty(value)
      ? O.some(value)
      : O.none();

const parsePrerelease = (value: string): O.Option<A.NonEmptyReadonlyArray<BunSemverIdentifier>> => {
  const identifiers = A.filter(Str.split(".")(value), Str.isNonEmpty);
  if (A.isReadonlyArrayEmpty(identifiers)) {
    return O.none();
  }

  let parsed = A.empty<BunSemverIdentifier>();
  for (const identifier of identifiers) {
    const next = parsePrereleaseIdentifier(identifier);
    if (O.isNone(next)) {
      return O.none();
    }
    parsed = A.append(parsed, next.value);
  }

  return A.isReadonlyArrayNonEmpty(parsed) ? O.some(parsed) : O.none();
};

const parseBunSemver = (value: string): O.Option<BunSemver> => {
  const match = BUN_SEMVER_PATTERN.exec(value);
  if (match === null) {
    return O.none();
  }

  const major = parseBunVersionPart(match[1]);
  const minor = parseBunVersionPart(match[2]);
  const patch = parseBunVersionPart(match[3]);

  if (O.isNone(major) || O.isNone(minor) || O.isNone(patch)) {
    return O.none();
  }

  const prerelease = O.flatMap(O.fromNullishOr(match[4]), (identifier) =>
    Str.isNonEmpty(identifier) ? parsePrerelease(identifier) : O.none()
  );

  return O.some({
    core: [major.value, minor.value, patch.value] as const,
    prerelease,
  });
};

const compareBunSemverIdentifier = (left: BunSemverIdentifier, right: BunSemverIdentifier): number => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  if (typeof left === "number") {
    return -1;
  }
  if (typeof right === "number") {
    return 1;
  }
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
};

const comparePrerelease = (
  left: O.Option<A.NonEmptyReadonlyArray<BunSemverIdentifier>>,
  right: O.Option<A.NonEmptyReadonlyArray<BunSemverIdentifier>>
): number => {
  if (O.isNone(left) && O.isNone(right)) {
    return 0;
  }
  if (O.isNone(left)) {
    return 1;
  }
  if (O.isNone(right)) {
    return -1;
  }

  const length = Math.min(left.value.length, right.value.length);
  for (let index = 0; index < length; index += 1) {
    const result = compareBunSemverIdentifier(left.value[index], right.value[index]);
    if (result !== 0) {
      return result;
    }
  }

  if (left.value.length < right.value.length) {
    return -1;
  }
  if (left.value.length > right.value.length) {
    return 1;
  }
  return 0;
};

const compareBunSemver = (left: BunSemver, right: BunSemver): number => {
  if (left.core[0] !== right.core[0]) {
    return left.core[0] - right.core[0];
  }
  if (left.core[1] !== right.core[1]) {
    return left.core[1] - right.core[1];
  }
  if (left.core[2] !== right.core[2]) {
    return left.core[2] - right.core[2];
  }
  return comparePrerelease(left.prerelease, right.prerelease);
};

const selectLatestLocalBunVersion = (state: BunVersionState): string => {
  const bunVersionFile = parseBunSemver(state.bunVersionFile);
  const packageManagerField = parseBunSemver(state.packageManagerField);

  if (O.isSome(bunVersionFile) && O.isSome(packageManagerField)) {
    return compareBunSemver(bunVersionFile.value, packageManagerField.value) >= 0
      ? state.bunVersionFile
      : state.packageManagerField;
  }
  if (O.isSome(bunVersionFile)) {
    return state.bunVersionFile;
  }
  if (O.isSome(packageManagerField)) {
    return state.packageManagerField;
  }

  return Str.isNonEmpty(state.bunVersionFile) ? state.bunVersionFile : state.packageManagerField;
};

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolved Bun version state.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class BunVersionState extends S.Class<BunVersionState>($I`BunVersionState`)(
  {
    bunVersionFile: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
    packageManagerField: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(thunkEmptyStr)
    ),
    latest: S.Option(S.String).pipe(S.withConstructorDefault(() => O.some(O.none<string>()))),
  },
  $I.annote("BunVersionState", {
    description: "Resolved Bun version state from local files and optionally GitHub",
  })
) {}

/**
 * Resolve current Bun versions from local files and optionally fetch latest from GitHub.
 *
 * @category Utility
 * @since 0.0.0
 */
export const resolveBunVersions: (
  repoRoot: string,
  skipNetwork: boolean
) => Effect.Effect<BunVersionState, VersionSyncError, FileSystem.FileSystem | Path.Path | HttpClient.HttpClient> =
  Effect.fn(function* (repoRoot, skipNetwork) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Read .bun-version
    const bunVersionPath = path.join(repoRoot, ".bun-version");
    const bunVersionFile = yield* fs.readFileString(bunVersionPath).pipe(
      Effect.map(Str.trim),
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to read .bun-version: ${Inspectable.toStringUnknown(e, 0)}`,
            file: ".bun-version",
          })
      )
    );

    // Read package.json packageManager field
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

    const pkgJson = yield* decodeJsoncTextAs(BunPackageJsonDocument)(pkgJsonContent).pipe(
      Effect.mapError(
        (e) =>
          new VersionSyncError({
            message: `Failed to parse package.json: ${e.message}`,
            file: "package.json",
          })
      )
    );
    const packageManagerField = extractPackageManagerVersion(pkgJson.packageManager);

    const latest = yield* Bool.match(skipNetwork, {
      onTrue: () => Effect.succeed(O.none<string>()),
      onFalse: () => fetchLatestBunVersion().pipe(Effect.map(O.some), Effect.orElseSucceed(O.none<string>)),
    });

    return new BunVersionState({ bunVersionFile, packageManagerField, latest });
  });

/**
 * Fetch the latest stable Bun release version from GitHub.
 *
 * @category Utility
 * @since 0.0.0
 */
const fetchLatestBunVersion: () => Effect.Effect<string, NetworkUnavailableError, HttpClient.HttpClient> = Effect.fn(
  function* () {
    const client = yield* HttpClient.HttpClient;
    const response = yield* client
      .get(BUN_RELEASE_URL, { headers: { "User-Agent": "beep-cli/0.0.0", Accept: "application/vnd.github+json" } })
      .pipe(
        Effect.mapError(
          (e) =>
            new NetworkUnavailableError({ message: `GitHub API request failed: ${Inspectable.toStringUnknown(e, 0)}` })
        )
      );
    const body = yield* HttpClientResponse.schemaBodyJson(BunRelease)(response).pipe(
      Effect.mapError(
        (e) =>
          new NetworkUnavailableError({
            message: `Failed to parse GitHub API response: ${Inspectable.toStringUnknown(e, 0)}`,
          })
      )
    );
    return extractBunVersion(body.tag_name);
  }
);

/**
 * Build the Bun category report from resolved state.
 *
 * @param state - The resolved Bun version state.
 * @returns The version category report for Bun.
 * @category Utility
 * @since 0.0.0
 */
export const buildBunReport: (state: BunVersionState) => VersionCategoryReport = (state) => {
  let items = A.empty<VersionDriftItem>();

  const target = O.match(state.latest, {
    onSome: identity,
    onNone: () => selectLatestLocalBunVersion(state),
  });

  if (state.bunVersionFile !== target) {
    items = A.append(
      items,
      new VersionDriftItem({
        file: ".bun-version",
        field: "version",
        current: state.bunVersionFile,
        expected: target,
        line: O.none(),
      })
    );
  }

  if (state.packageManagerField !== target) {
    items = A.append(
      items,
      new VersionDriftItem({
        file: "package.json",
        field: "packageManager",
        current: `bun@${state.packageManagerField}`,
        expected: `bun@${target}`,
        line: O.none(),
      })
    );
  }

  const hasDrift = CommonArray.matchToBoolean(items);
  const hasInternalMismatch = state.bunVersionFile !== state.packageManagerField;

  return VersionCategoryReport.cases.bun.makeUnsafe({
    status: Bool.match(hasDrift || hasInternalMismatch, {
      onTrue: VersionCategoryStatusThunk.drift,
      onFalse: VersionCategoryStatusThunk.ok,
    }),
    items,
    latest: state.latest,
    error: O.none(),
  });
};
