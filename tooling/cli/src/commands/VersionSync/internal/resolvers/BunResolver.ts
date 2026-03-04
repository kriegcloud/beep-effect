/**
 * Bun version resolver.
 *
 * Reads current Bun version from `.bun-version` and `package.json` `packageManager`,
 * and optionally fetches the latest stable release from GitHub.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Boolean as Bool, Effect, FileSystem, Inspectable, identity, Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { decodeJsoncTextAs, JsoncCodecServiceLive } from "../../../Shared/SchemaCodecs/index.js";
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
 * @since 0.0.0
 * @category Validation
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
      S.withDecodingDefault(() => "")
    ),
  },
  $I.annote("BunPackageJsonDocument", {
    description: "Subset of root package.json fields required by the Bun resolver.",
  })
) {}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category Configuration
 */
const BUN_RELEASE_URL = "https://api.github.com/repos/oven-sh/bun/releases/latest";

/**
 * Strip the `bun-v` prefix from a GitHub release tag name.
 *
 * @since 0.0.0
 * @category Utility
 * @param tagName - The GitHub release tag (e.g. `bun-v1.3.9`).
 * @returns The bare version string.
 */
const extractBunVersion = Str.replace(/^bun-v/, "");

/**
 * Strip the `bun@` prefix from a `packageManager` field value.
 *
 * @since 0.0.0
 * @category Utility
 * @param value - The packageManager field value (e.g. `bun@1.3.9`).
 * @returns The bare version string.
 */
const extractPackageManagerVersion = Str.replace(/^bun@/, "");

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolved Bun version state.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BunVersionState extends S.Class<BunVersionState>($I`BunVersionState`)(
  {
    bunVersionFile: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(() => "")
    ),
    packageManagerField: S.String.pipe(
      S.withConstructorDefault(() => O.some("")),
      S.withDecodingDefault(() => "")
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
 * @since 0.0.0
 * @category Utility
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
      Effect.provide(JsoncCodecServiceLive),
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
 * @since 0.0.0
 * @category Utility
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
 * @since 0.0.0
 * @category Utility
 * @param state - The resolved Bun version state.
 * @returns The version category report for Bun.
 */
export const buildBunReport: (state: BunVersionState) => VersionCategoryReport = (state) => {
  let items = A.empty<VersionDriftItem>();

  const target = O.match(state.latest, {
    onSome: identity,
    onNone: () =>
      Bool.match(state.bunVersionFile >= state.packageManagerField, {
        onTrue: () => state.bunVersionFile,
        onFalse: () => state.packageManagerField,
      }),
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

  const hasDrift = A.match(items, {
    onEmpty: () => false,
    onNonEmpty: () => true,
  });
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
