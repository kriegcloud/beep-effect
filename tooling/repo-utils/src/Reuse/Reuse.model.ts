import { $RepoUtilsId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("Reuse/Reuse.model");
const emptyArray = (): [] => [];

/**
 * Catalog entry origin domain.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ReuseCatalogOrigin = S.Union([
  S.Literal("repo-common"),
  S.Literal("repo-tooling"),
  S.Literal("effect-v4-curated"),
]).pipe(
  S.annotate(
    $I.annote("ReuseCatalogOrigin", {
      description: "Origin classification for a reuse-catalog entry.",
    })
  )
);

/**
 * Runtime type for `ReuseCatalogOrigin`.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ReuseCatalogOrigin = typeof ReuseCatalogOrigin.Type;

/**
 * Partition work-unit kind.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ReuseWorkUnitKind = S.Union([S.Literal("scout"), S.Literal("specialist")]).pipe(
  S.annotate(
    $I.annote("ReuseWorkUnitKind", {
      description: "Kind of reuse-analysis work unit emitted for future orchestration.",
    })
  )
);

/**
 * Runtime type for `ReuseWorkUnitKind`.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ReuseWorkUnitKind = typeof ReuseWorkUnitKind.Type;

/**
 * Candidate kind domain for inventory items.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ReuseCandidateKind = S.Union([
  S.Literal("extract-function"),
  S.Literal("extract-schema"),
  S.Literal("extract-type"),
  S.Literal("replace-with-existing"),
]).pipe(
  S.annotate(
    $I.annote("ReuseCandidateKind", {
      description: "High-level remediation class for a reuse opportunity.",
    })
  )
);

/**
 * Runtime type for `ReuseCandidateKind`.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ReuseCandidateKind = typeof ReuseCandidateKind.Type;

/**
 * File-local source symbol reference tied to a reuse opportunity.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReuseSourceSymbolRef extends S.Class<ReuseSourceSymbolRef>($I`ReuseSourceSymbolRef`)(
  {
    symbolId: S.NonEmptyString,
    filePath: S.NonEmptyString,
    symbolName: S.NonEmptyString,
    symbolKind: S.NonEmptyString,
  },
  $I.annote("ReuseSourceSymbolRef", {
    description: "Reference to a scoped symbol that contributes evidence for a reuse candidate.",
  })
) {}

/**
 * Catalog entry describing an existing reusable symbol or curated pattern.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReuseCatalogEntry extends S.Class<ReuseCatalogEntry>($I`ReuseCatalogEntry`)(
  {
    id: S.NonEmptyString,
    origin: ReuseCatalogOrigin,
    packageName: S.NonEmptyString,
    packagePath: S.NonEmptyString,
    modulePath: S.NonEmptyString,
    symbolName: S.NonEmptyString,
    symbolKind: S.NonEmptyString,
    summary: S.OptionFromNullOr(S.NonEmptyString),
    keywords: S.Array(S.NonEmptyString),
    applicability: S.Array(S.NonEmptyString),
  },
  $I.annote("ReuseCatalogEntry", {
    description: "Reusable symbol or curated Effect-v4 pattern available to inventory and find flows.",
  })
) {}

/**
 * Partition work unit emitted for package scouts or hotspot specialists.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReuseWorkUnit extends S.Class<ReuseWorkUnit>($I`ReuseWorkUnit`)(
  {
    id: S.NonEmptyString,
    kind: ReuseWorkUnitKind,
    label: S.NonEmptyString,
    scopeSelector: S.NonEmptyString,
    rationale: S.NonEmptyString,
  },
  $I.annote("ReuseWorkUnit", {
    description: "Future agent work unit for package-scoped scouting or hotspot specialization.",
  })
) {}

/**
 * Partition plan covering scout and specialist work units for a selected scope.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReusePartitionPlan extends S.Class<ReusePartitionPlan>($I`ReusePartitionPlan`)(
  {
    scopeSelector: S.NonEmptyString,
    scoutUnits: S.Array(ReuseWorkUnit).pipe(
      S.withConstructorDefault(Effect.succeed(emptyArray())),
      S.withDecodingDefault(Effect.succeed(emptyArray()))
    ),
    specialistUnits: S.Array(ReuseWorkUnit).pipe(
      S.withConstructorDefault(Effect.succeed(emptyArray())),
      S.withDecodingDefault(Effect.succeed(emptyArray()))
    ),
    catalogEntryCount: NonNegativeInt,
  },
  $I.annote("ReusePartitionPlan", {
    description: "Partition plan for parallel reuse-discovery scouting and hotspot specialist passes.",
  })
) {}

/**
 * Ranked reuse candidate inventory item.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReuseCandidate extends S.Class<ReuseCandidate>($I`ReuseCandidate`)(
  {
    candidateId: S.NonEmptyString,
    kind: ReuseCandidateKind,
    title: S.NonEmptyString,
    sourceSymbols: S.Array(ReuseSourceSymbolRef),
    sourceScopes: S.Array(S.NonEmptyString),
    recommendedAction: S.NonEmptyString,
    proposedDestinationPackage: S.NonEmptyString,
    proposedDestinationModule: S.NonEmptyString,
    confidence: S.Number,
    evidence: S.Array(S.NonEmptyString),
    blockingConcerns: S.Array(S.NonEmptyString),
    implementationSteps: S.Array(S.NonEmptyString),
    verificationCommands: S.Array(S.NonEmptyString),
    catalogMatchIds: S.Array(S.NonEmptyString),
  },
  $I.annote("ReuseCandidate", {
    description: "Ranked reuse opportunity ready to be turned into an implementation packet.",
  })
) {}

/**
 * Inventory payload produced for a requested scope.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReuseInventory extends S.Class<ReuseInventory>($I`ReuseInventory`)(
  {
    scopeSelector: S.NonEmptyString,
    generatedAt: S.NonEmptyString,
    catalogEntryCount: NonNegativeInt,
    candidateCount: NonNegativeInt,
    candidates: S.Array(ReuseCandidate).pipe(
      S.withConstructorDefault(Effect.succeed(emptyArray())),
      S.withDecodingDefault(Effect.succeed(emptyArray()))
    ),
  },
  $I.annote("ReuseInventory", {
    description: "Ranked and deduplicated reuse inventory for a requested scope.",
  })
) {}

/**
 * Materialized implementation packet for one reuse candidate.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReusePacket extends S.Class<ReusePacket>($I`ReusePacket`)(
  {
    candidate: ReuseCandidate,
    catalogMatches: S.Array(ReuseCatalogEntry).pipe(
      S.withConstructorDefault(Effect.succeed(emptyArray())),
      S.withDecodingDefault(Effect.succeed(emptyArray()))
    ),
  },
  $I.annote("ReusePacket", {
    description: "Structured implementation packet for a single reuse candidate.",
  })
) {}

/**
 * Results for local-file reuse lookups.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReuseFindResult extends S.Class<ReuseFindResult>($I`ReuseFindResult`)(
  {
    filePath: S.NonEmptyString,
    query: S.OptionFromNullOr(S.NonEmptyString),
    symbolId: S.OptionFromNullOr(S.NonEmptyString),
    matches: S.Array(ReuseCatalogEntry).pipe(
      S.withConstructorDefault(Effect.succeed(emptyArray())),
      S.withDecodingDefault(Effect.succeed(emptyArray()))
    ),
    candidateSuggestions: S.Array(ReuseCandidate).pipe(
      S.withConstructorDefault(Effect.succeed(emptyArray())),
      S.withDecodingDefault(Effect.succeed(emptyArray()))
    ),
  },
  $I.annote("ReuseFindResult", {
    description: "Focused reuse suggestions for a file-local query or symbol lookup.",
  })
) {}
