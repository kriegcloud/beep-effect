/**
 * Schema-first lookup request and response models for repo-codegraph.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCodegraphId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCodegraphId.create("RepoCodegraphLookup.model");
const emptyStringArray = (): [] => [];

/**
 * Lookup result schema version.
 *
 * @example
 * ```ts
 * import { RepoCodegraphLookupSchemaVersion } from "@beep/repo-codegraph"
 * console.log(RepoCodegraphLookupSchemaVersion.Enum["repo-codegraph.lookup/v1"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoCodegraphLookupSchemaVersion = LiteralKit(["repo-codegraph.lookup/v1"] as const).annotate(
  $I.annote("RepoCodegraphLookupSchemaVersion", {
    description: "Schema version for deterministic repo-codegraph lookup results.",
  })
);

/**
 * Runtime type for {@link RepoCodegraphLookupSchemaVersion}.
 *
 * @example
 * ```ts
 * import type { RepoCodegraphLookupSchemaVersion } from "@beep/repo-codegraph"
 * const version: RepoCodegraphLookupSchemaVersion = "repo-codegraph.lookup/v1"
 * console.log(version)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoCodegraphLookupSchemaVersion = typeof RepoCodegraphLookupSchemaVersion.Type;

/**
 * Freshness state for the export catalog used by a lookup.
 *
 * @example
 * ```ts
 * import { RepoCodegraphFreshnessStatus } from "@beep/repo-codegraph"
 * console.log(RepoCodegraphFreshnessStatus.Enum.unchecked)
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoCodegraphFreshnessStatus = LiteralKit(["unchecked", "current"] as const).annotate(
  $I.annote("RepoCodegraphFreshnessStatus", {
    description: "Freshness posture of the export catalog used by a lookup request.",
  })
);

/**
 * Runtime type for {@link RepoCodegraphFreshnessStatus}.
 *
 * @example
 * ```ts
 * import type { RepoCodegraphFreshnessStatus } from "@beep/repo-codegraph"
 * const status: RepoCodegraphFreshnessStatus = "current"
 * console.log(status)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoCodegraphFreshnessStatus = typeof RepoCodegraphFreshnessStatus.Type;

/**
 * Advisory boundary status for a candidate import.
 *
 * @example
 * ```ts
 * import { RepoCodegraphBoundaryStatus } from "@beep/repo-codegraph"
 * console.log(RepoCodegraphBoundaryStatus.Enum.allowed)
 * ```
 * @category models
 * @since 0.0.0
 */
export const RepoCodegraphBoundaryStatus = LiteralKit(["allowed", "advisory", "blocked", "unknown"] as const).annotate(
  $I.annote("RepoCodegraphBoundaryStatus", {
    description: "Advisory architecture-boundary status for a candidate import.",
  })
);

/**
 * Runtime type for {@link RepoCodegraphBoundaryStatus}.
 *
 * @example
 * ```ts
 * import type { RepoCodegraphBoundaryStatus } from "@beep/repo-codegraph"
 * const status: RepoCodegraphBoundaryStatus = "advisory"
 * console.log(status)
 * ```
 * @category models
 * @since 0.0.0
 */
export type RepoCodegraphBoundaryStatus = typeof RepoCodegraphBoundaryStatus.Type;

/**
 * Deterministic lookup request.
 *
 * @example
 * ```ts
 * import { RepoCodegraphLookupRequest } from "@beep/repo-codegraph"
 * import * as O from "effect/Option"
 * const request = RepoCodegraphLookupRequest.make({
 *   fromPackage: O.none(),
 *   limit: 8,
 *   query: "UnknownRecord"
 * })
 * console.log(request.query)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphLookupRequest extends S.Class<RepoCodegraphLookupRequest>($I`RepoCodegraphLookupRequest`)(
  {
    query: S.NonEmptyString,
    fromPackage: S.OptionFromNullOr(S.String),
    limit: S.Number.pipe(S.withConstructorDefault(Effect.succeed(8)), S.withDecodingDefault(Effect.succeed(8))),
  },
  $I.annote("RepoCodegraphLookupRequest", {
    description: "Deterministic symbol and intent lookup request over the generated repo export catalog.",
  })
) {}

/**
 * Machine-readable score components for one lookup match.
 *
 * @example
 * ```ts
 * import { RepoCodegraphLookupScore } from "@beep/repo-codegraph"
 * const score = RepoCodegraphLookupScore.make({
 *   boundary: 5,
 *   exact: 80,
 *   graph: 8,
 *   lexical: 20,
 *   semantic: 10,
 *   total: 123
 * })
 * console.log(score.total)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphLookupScore extends S.Class<RepoCodegraphLookupScore>($I`RepoCodegraphLookupScore`)(
  {
    exact: S.Number,
    lexical: S.Number,
    semantic: S.Number,
    graph: S.Number,
    boundary: S.Number,
    total: S.Number,
  },
  $I.annote("RepoCodegraphLookupScore", {
    description: "Explainable deterministic score components for a repo-codegraph lookup match.",
  })
) {}

/**
 * One legal import option for a matched symbol.
 *
 * @example
 * ```ts
 * import { RepoCodegraphImportCandidate } from "@beep/repo-codegraph"
 * import * as O from "effect/Option"
 * const candidate = RepoCodegraphImportCandidate.make({
 *   exportSubpath: ".",
 *   importSpecifier: "@beep/schema",
 *   isRecommended: true,
 *   reason: O.some("Shortest public export.")
 * })
 * console.log(candidate.importSpecifier)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphImportCandidate extends S.Class<RepoCodegraphImportCandidate>(
  $I`RepoCodegraphImportCandidate`
)(
  {
    importSpecifier: S.NonEmptyString,
    exportSubpath: S.NonEmptyString,
    isRecommended: S.Boolean,
    reason: S.OptionFromNullOr(S.String),
  },
  $I.annote("RepoCodegraphImportCandidate", {
    description: "A legal public import specifier for a matched catalog export.",
  })
) {}

/**
 * Advisory architecture boundary note for a match.
 *
 * @example
 * ```ts
 * import { RepoCodegraphBoundaryAdvice } from "@beep/repo-codegraph"
 * const advice = RepoCodegraphBoundaryAdvice.make({
 *   citations: ["standards/ARCHITECTURE.md"],
 *   reason: "No caller package was supplied.",
 *   status: "unknown"
 * })
 * console.log(advice.status)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphBoundaryAdvice extends S.Class<RepoCodegraphBoundaryAdvice>($I`RepoCodegraphBoundaryAdvice`)(
  {
    status: RepoCodegraphBoundaryStatus,
    reason: S.String,
    citations: S.Array(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(emptyStringArray())),
      S.withDecodingDefault(Effect.succeed(emptyStringArray()))
    ),
  },
  $I.annote("RepoCodegraphBoundaryAdvice", {
    description: "Advisory boundary guidance for the source and target package relationship.",
  })
) {}

/**
 * One scored lookup match.
 *
 * @example
 * ```ts
 * import { RepoCodegraphLookupMatch } from "@beep/repo-codegraph"
 * console.log(RepoCodegraphLookupMatch)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphLookupMatch extends S.Class<RepoCodegraphLookupMatch>($I`RepoCodegraphLookupMatch`)(
  {
    packageName: S.NonEmptyString,
    packagePath: S.NonEmptyString,
    symbolName: S.NonEmptyString,
    exportKind: S.NonEmptyString,
    sourcePath: S.NonEmptyString,
    sourceLine: S.Number,
    summary: S.OptionFromNullOr(S.String),
    recommendedImport: RepoCodegraphImportCandidate,
    legalImports: S.Array(RepoCodegraphImportCandidate),
    boundary: RepoCodegraphBoundaryAdvice,
    score: RepoCodegraphLookupScore,
  },
  $I.annote("RepoCodegraphLookupMatch", {
    description: "One scored public export match with import guidance and boundary advice.",
  })
) {}

/**
 * Aggregate match counts for a lookup result.
 *
 * @example
 * ```ts
 * import { RepoCodegraphLookupTotals } from "@beep/repo-codegraph"
 * const totals = RepoCodegraphLookupTotals.make({
 *   catalogEntries: 10,
 *   matchedEntries: 2,
 *   returnedMatches: 1
 * })
 * console.log(totals.returnedMatches)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphLookupTotals extends S.Class<RepoCodegraphLookupTotals>($I`RepoCodegraphLookupTotals`)(
  {
    catalogEntries: S.Number,
    matchedEntries: S.Number,
    returnedMatches: S.Number,
  },
  $I.annote("RepoCodegraphLookupTotals", {
    description: "Aggregate counts for a deterministic repo-codegraph lookup result.",
  })
) {}

/**
 * Deterministic lookup result.
 *
 * @example
 * ```ts
 * import { RepoCodegraphLookupResult } from "@beep/repo-codegraph"
 * console.log(RepoCodegraphLookupResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphLookupResult extends S.Class<RepoCodegraphLookupResult>($I`RepoCodegraphLookupResult`)(
  {
    schemaVersion: RepoCodegraphLookupSchemaVersion,
    query: S.NonEmptyString,
    fromPackage: S.OptionFromNullOr(S.String),
    limit: S.Number,
    freshnessStatus: RepoCodegraphFreshnessStatus,
    warnings: S.Array(S.String),
    matches: S.Array(RepoCodegraphLookupMatch),
    totals: RepoCodegraphLookupTotals,
  },
  $I.annote("RepoCodegraphLookupResult", {
    description: "Machine-readable deterministic lookup result over public repo exports.",
  })
) {}

/**
 * Preferred import rule recorded in package-local repo-codegraph policy.
 *
 * @example
 * ```ts
 * import { RepoCodegraphPreferredImport } from "@beep/repo-codegraph"
 * import * as O from "effect/Option"
 * const preferred = RepoCodegraphPreferredImport.make({
 *   importSpecifier: "@beep/schema",
 *   reason: O.some("Use the package root for public schemas."),
 *   symbols: ["UnknownRecord"]
 * })
 * console.log(preferred.importSpecifier)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphPreferredImport extends S.Class<RepoCodegraphPreferredImport>(
  $I`RepoCodegraphPreferredImport`
)(
  {
    importSpecifier: S.NonEmptyString,
    symbols: S.Array(S.NonEmptyString).pipe(
      S.withConstructorDefault(Effect.succeed(emptyStringArray())),
      S.withDecodingDefault(Effect.succeed(emptyStringArray()))
    ),
    reason: S.OptionFromNullOr(S.String),
  },
  $I.annote("RepoCodegraphPreferredImport", {
    description: "Package-local preferred import rule consumed by repo-codegraph lookup.",
  })
) {}

/**
 * Package-local import policy consumed by lookup.
 *
 * @example
 * ```ts
 * import { RepoCodegraphPackageImportPolicy } from "@beep/repo-codegraph"
 * const policy = RepoCodegraphPackageImportPolicy.make({
 *   packageName: "@beep/schema",
 *   packagePath: "packages/foundation/modeling/schema",
 *   preferredImports: []
 * })
 * console.log(policy.packageName)
 * ```
 * @category models
 * @since 0.0.0
 */
export class RepoCodegraphPackageImportPolicy extends S.Class<RepoCodegraphPackageImportPolicy>(
  $I`RepoCodegraphPackageImportPolicy`
)(
  {
    packageName: S.NonEmptyString,
    packagePath: S.NonEmptyString,
    preferredImports: S.Array(RepoCodegraphPreferredImport),
  },
  $I.annote("RepoCodegraphPackageImportPolicy", {
    description: "Import preference policy attached to one workspace package.",
  })
) {}

/**
 * Encode a lookup result into its JSON-safe representation.
 *
 * @example
 * ```ts
 * import { encodeRepoCodegraphLookupResult } from "@beep/repo-codegraph"
 * console.log(encodeRepoCodegraphLookupResult)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const encodeRepoCodegraphLookupResult = S.encodeEffect(RepoCodegraphLookupResult);
