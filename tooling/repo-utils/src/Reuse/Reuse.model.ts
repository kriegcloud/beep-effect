/**
 * Reuse-catalog domain models and request/response schemas.
 *
 * @module
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("Reuse/Reuse.model");
const emptyArray = (): [] => [];

/**
 * Catalog entry origin domain.
 *
 * @example
 * ```ts
 * import { ReuseCatalogOrigin } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const schema = ReuseCatalogOrigin
 * void schema
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import type { ReuseCatalogOrigin } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const origin: ReuseCatalogOrigin = "repo-common"
 * void origin
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ReuseCatalogOrigin = typeof ReuseCatalogOrigin.Type;

/**
 * Partition work-unit kind.
 *
 * @example
 * ```ts
 * import { ReuseWorkUnitKind } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const schema = ReuseWorkUnitKind
 * void schema
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import type { ReuseWorkUnitKind } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const kind: ReuseWorkUnitKind = "scout"
 * void kind
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ReuseWorkUnitKind = typeof ReuseWorkUnitKind.Type;

/**
 * Candidate kind domain for inventory items.
 *
 * @example
 * ```ts
 * import { ReuseCandidateKind } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const schema = ReuseCandidateKind
 * void schema
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import type { ReuseCandidateKind } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const kind: ReuseCandidateKind = "extract-schema"
 * void kind
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ReuseCandidateKind = typeof ReuseCandidateKind.Type;

/**
 * File-local source symbol reference tied to a reuse opportunity.
 *
 * @example
 * ```ts
 * import { ReuseSourceSymbolRef } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const ref = new ReuseSourceSymbolRef({
 *   filePath: "src/example.ts",
 *   symbolId: "src/example.ts#makeExample",
 *   symbolKind: "function",
 *   symbolName: "makeExample"
 * })
 * void ref.symbolName
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReuseCatalogEntry } from "@beep/repo-utils/Reuse/Reuse.model"
 * import * as O from "effect/Option"
 *
 * const entry = new ReuseCatalogEntry({
 *   applicability: ["schema models"],
 *   id: "repo-utils:ReuseCatalogEntry",
 *   keywords: ["reuse"],
 *   modulePath: "Reuse/Reuse.model",
 *   origin: "repo-tooling",
 *   packageName: "@beep/repo-utils",
 *   packagePath: "tooling/repo-utils",
 *   summary: O.some("Reusable catalog entry model."),
 *   symbolKind: "class",
 *   symbolName: "ReuseCatalogEntry"
 * })
 * void entry.id
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReuseWorkUnit } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const unit = new ReuseWorkUnit({
 *   id: "scout:repo-utils",
 *   kind: "scout",
 *   label: "Repo utils scan",
 *   rationale: "Find reuse candidates.",
 *   scopeSelector: "tooling/repo-utils"
 * })
 * void unit.kind
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReusePartitionPlan } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const plan = new ReusePartitionPlan({
 *   catalogEntryCount: 0,
 *   scopeSelector: "tooling/repo-utils"
 * })
 * void plan.scopeSelector
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReuseCandidate } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const candidate = new ReuseCandidate({
 *   blockingConcerns: [],
 *   candidateId: "candidate:extract-schema",
 *   catalogMatchIds: [],
 *   confidence: 0.8,
 *   evidence: ["Duplicate schema shape."],
 *   implementationSteps: ["Extract shared schema."],
 *   kind: "extract-schema",
 *   proposedDestinationModule: "src/shared.ts",
 *   proposedDestinationPackage: "@beep/repo-utils",
 *   recommendedAction: "Extract schema.",
 *   sourceScopes: ["tooling/repo-utils"],
 *   sourceSymbols: [],
 *   title: "Extract shared schema",
 *   verificationCommands: ["bun test"]
 * })
 * void candidate.candidateId
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReuseInventory } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const inventory = new ReuseInventory({
 *   candidateCount: 0,
 *   catalogEntryCount: 0,
 *   generatedAt: "2026-04-21T00:00:00.000Z",
 *   scopeSelector: "tooling/repo-utils"
 * })
 * void inventory.candidateCount
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReuseCandidate, ReusePacket } from "@beep/repo-utils/Reuse/Reuse.model"
 *
 * const candidate = new ReuseCandidate({
 *   blockingConcerns: [],
 *   candidateId: "candidate:extract-schema",
 *   catalogMatchIds: [],
 *   confidence: 0.8,
 *   evidence: ["Duplicate schema shape."],
 *   implementationSteps: ["Extract shared schema."],
 *   kind: "extract-schema",
 *   proposedDestinationModule: "src/shared.ts",
 *   proposedDestinationPackage: "@beep/repo-utils",
 *   recommendedAction: "Extract schema.",
 *   sourceScopes: ["tooling/repo-utils"],
 *   sourceSymbols: [],
 *   title: "Extract shared schema",
 *   verificationCommands: ["bun test"]
 * })
 * const packet = new ReusePacket({ candidate })
 * void packet.candidate
 * ```
 *
 * @category models
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
 * @example
 * ```ts
 * import { ReuseFindResult } from "@beep/repo-utils/Reuse/Reuse.model"
 * import * as O from "effect/Option"
 *
 * const result = new ReuseFindResult({
 *   filePath: "src/example.ts",
 *   query: O.some("schema"),
 *   symbolId: O.none()
 * })
 * void result.filePath
 * ```
 *
 * @category models
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
