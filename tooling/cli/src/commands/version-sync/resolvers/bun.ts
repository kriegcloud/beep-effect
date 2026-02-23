/**
 * Bun version resolver.
 *
 * Reads current Bun version from `.bun-version` and `package.json` `packageManager`,
 * and optionally fetches the latest stable release from GitHub.
 *
 * @since 0.0.0
 * @module
 */

import { FileSystem, Path } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as Schema from "effect/Schema";
import * as Str from "effect/String";
import * as jsonc from "jsonc-parser";
import { HttpClient, HttpClientResponse } from "effect/unstable/http";
import { NetworkUnavailableError, type VersionCategoryReport, type VersionDriftItem, VersionSyncError } from "../types.js";

// ── GitHub API schema ───────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category schemas
 */
const BunRelease = Schema.Struct({
  tag_name: Schema.String,
  prerelease: Schema.Boolean,
  draft: Schema.Boolean,
});

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * @since 0.0.0
 * @category constants
 */
const BUN_RELEASE_URL = "https://api.github.com/repos/oven-sh/bun/releases/latest";

/**
 * @since 0.0.0
 * @category functions
 */
const extractBunVersion = (tagName: string): string => tagName.replace(/^bun-v/, "");

/**
 * @since 0.0.0
 * @category functions
 */
const extractPackageManagerVersion = (value: string): string => value.replace(/^bun@/, "");

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Resolved Bun version state.
 *
 * @since 0.0.0
 * @category models
 */
export interface BunVersionState {
  readonly bunVersionFile: string;
  readonly packageManagerField: string;
  readonly latest: O.Option<string>;
}

/**
 * Resolve current Bun versions from local files and optionally fetch latest from GitHub.
 *
 * @since 0.0.0
 * @category functions
 */
export const resolveBunVersions: (
  repoRoot: string,
  skipNetwork: boolean
) => Effect.Effect<
  BunVersionState,
  VersionSyncError,
  FileSystem.FileSystem | Path.Path | HttpClient.HttpClient
> = Effect.fn(function* (repoRoot, skipNetwork) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // Read .bun-version
  const bunVersionPath = path.join(repoRoot, ".bun-version");
  const bunVersionFile = yield* fs
    .readFileString(bunVersionPath)
    .pipe(
      Effect.map(Str.trim),
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to read .bun-version: ${String(e)}`, file: ".bun-version" })
      )
    );

  // Read package.json packageManager field
  const pkgJsonPath = path.join(repoRoot, "package.json");
  const pkgJsonContent = yield* fs
    .readFileString(pkgJsonPath)
    .pipe(
      Effect.mapError(
        (e) => new VersionSyncError({ message: `Failed to read package.json: ${String(e)}`, file: "package.json" })
      )
    );

  const parseErrors: Array<jsonc.ParseError> = [];
  const pkgJson = jsonc.parse(pkgJsonContent, parseErrors);
  if (parseErrors.length > 0 || typeof pkgJson !== "object" || pkgJson === null) {
    return yield* new VersionSyncError({ message: "Failed to parse package.json", file: "package.json" });
  }
  const rawPm = typeof pkgJson.packageManager === "string" ? pkgJson.packageManager : "";
  const packageManagerField = extractPackageManagerVersion(rawPm);

  // Optionally fetch latest
  let latest: O.Option<string> = O.none();
  if (!skipNetwork) {
    latest = yield* fetchLatestBunVersion().pipe(
      Effect.map(O.some),
      Effect.orElseSucceed(() => O.none<string>())
    );
  }

  return { bunVersionFile, packageManagerField, latest };
});

/**
 * Fetch the latest stable Bun release version from GitHub.
 *
 * @since 0.0.0
 * @category functions
 */
const fetchLatestBunVersion: () => Effect.Effect<
  string,
  NetworkUnavailableError,
  HttpClient.HttpClient
> = Effect.fn(function* () {
  const client = yield* HttpClient.HttpClient;
  const response = yield* client
    .get(BUN_RELEASE_URL, { headers: { "User-Agent": "beep-cli/0.0.0", Accept: "application/vnd.github+json" } })
    .pipe(
      Effect.mapError(
        (e) => new NetworkUnavailableError({ message: `GitHub API request failed: ${String(e)}` })
      )
    );
  const body = yield* HttpClientResponse
    .schemaBodyJson(BunRelease)(response)
    .pipe(
      Effect.mapError(
        (e) => new NetworkUnavailableError({ message: `Failed to parse GitHub API response: ${String(e)}` })
      )
    );
  return extractBunVersion(body.tag_name);
});

/**
 * Build the Bun category report from resolved state.
 *
 * @since 0.0.0
 * @category functions
 */
export const buildBunReport: (state: BunVersionState) => VersionCategoryReport = (state) => {
  const items: Array<VersionDriftItem> = [];

  // Determine the target version: latest if available, otherwise the higher of the two local values
  const target = O.isSome(state.latest)
    ? state.latest.value
    : state.bunVersionFile >= state.packageManagerField
      ? state.bunVersionFile
      : state.packageManagerField;

  if (state.bunVersionFile !== target) {
    items.push({
      file: ".bun-version",
      field: "version",
      current: state.bunVersionFile,
      expected: target,
      line: O.none(),
    });
  }

  if (state.packageManagerField !== target) {
    items.push({
      file: "package.json",
      field: "packageManager",
      current: `bun@${state.packageManagerField}`,
      expected: `bun@${target}`,
      line: O.none(),
    });
  }

  const hasDrift = A.length(items) > 0;
  const hasInternalMismatch = state.bunVersionFile !== state.packageManagerField;

  let statusLabel: "ok" | "drift" = "ok";
  if (hasDrift || hasInternalMismatch) {
    statusLabel = "drift";
  }

  return {
    category: "bun" as const,
    status: statusLabel,
    items,
    latest: state.latest,
    error: O.none(),
  };
};
