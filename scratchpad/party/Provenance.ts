/**
 * Evidence plane: immutable content, occurrences, provenance activities, and
 * exact evidence anchors. PROV-O shaped: content and text are `prov:Entity`,
 * runs are `prov:Activity`. Provenance records lineage; it never grades truth.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { ActivityId, ContentId, Digest, OccurrenceId, PrincipalId } from "./Ids.ts";
import { UtcInstant } from "./Time.ts";

const $I = $ScratchpadId.create("party/Provenance");

/**
 * Which side of the matter an artifact came from. The admission layer uses
 * this: an adversary's self-description is testimony from an interested
 * source, not neutral record.
 *
 * @category provenance
 * @since 0.0.0
 */
export const CollectionSide = LiteralKit([
  "client-file",
  "adversary-production",
  "third-party-production",
  "public-record",
  "open-source",
]).pipe(
  $I.annoteSchema("CollectionSide", { description: "Which side of the matter an artifact came from." }));
export type CollectionSide = typeof CollectionSide.Type;

/**
 * Where an occurrence sits. Bates ranges are first-class because courts,
 * protective orders, and opposing counsel cite them, not file paths.
 *
 * @category provenance
 * @since 0.0.0
 */
export const Locator = S.TaggedUnion({
  Bates: {
    production: S.NonEmptyString,
    begin: S.NonEmptyString,
    end: S.NonEmptyString,
  },
  ContainerChild: { parent: OccurrenceId, path: S.NonEmptyString },
  FilePath: { root: S.NonEmptyString, path: S.NonEmptyString },
  Url: { url: S.NonEmptyString },
}).pipe($I.annoteSchema("Locator", { description: "Where an occurrence sits." }));
export type Locator = typeof Locator.Type;

/**
 * One occurrence of immutable content. Same bytes at two paths: one content,
 * two occurrences. Different bytes at one path over time: two contents.
 *
 * @category provenance
 * @since 0.0.0
 */
export const ArtifactOccurrence = S.Struct({
  id: OccurrenceId,
  content: ContentId,
  locator: Locator,
  side: CollectionSide,
  /** Custodian label exactly as the production metadata states it. */
  custodianLabel: S.OptionFromNullOr(S.String),
  acquiredBy: ActivityId,
}).pipe($I.annoteSchema("ArtifactOccurrence", { description: "One occurrence of immutable content." }));
export type ArtifactOccurrence = typeof ArtifactOccurrence.Type;

/**
 * What kind of work an activity did.
 *
 * @category provenance
 * @since 0.0.0
 */
export const ActivityKind = LiteralKit([
  "acquisition",
  "container-expansion",
  "header-extraction",
  "metadata-extraction",
  "text-reading",
  "llm-extraction",
  "classifier",
  "resolver",
  "assessor",
  "human-review",
  "admission",
  "projection",
]).pipe(
  $I.annoteSchema("ActivityKind", { description: "What kind of work an activity did." }));

/**
 * Terminal status of an activity. Partial and failed runs are data: an
 * incomplete collection must never become a negative fact.
 *
 * @category provenance
 * @since 0.0.0
 */
export const ActivityStatus = S.TaggedUnion({
  Completed: {},
  Partial: { reason: S.NonEmptyString },
  Failed: { reason: S.NonEmptyString },
}).pipe($I.annoteSchema("ActivityStatus", { description: "Terminal activity status." }));

/**
 * Who did the work: software at a pinned version, or a human principal.
 *
 * @category provenance
 * @since 0.0.0
 */
export const Producer = S.TaggedUnion({
  Software: { name: S.NonEmptyString, version: S.NonEmptyString, configDigest: Digest },
  Model: {
    provider: S.NonEmptyString,
    model: S.NonEmptyString,
    promptDigest: Digest,
  },
  Human: { principal: PrincipalId },
}).pipe($I.annoteSchema("Producer", { description: "Who did the work." }));
export type Producer = typeof Producer.Type;

/**
 * A provenance activity (`prov:Activity`). Replay-identifiable: producer,
 * input basis digest, and status.
 *
 * @category provenance
 * @since 0.0.0
 */
export const Activity = S.Struct({
  id: ActivityId,
  kind: ActivityKind,
  producer: Producer,
  inputBasis: Digest,
  startedAt: UtcInstant,
  status: ActivityStatus,
}).pipe($I.annoteSchema("Activity", { description: "Replay-identifiable provenance activity." }));
export type Activity = typeof Activity.Type;

/**
 * Header namespaces. MAPI and RFC 5322 disagree often enough (sender vs
 * sent-representing) that the namespace is part of the evidence.
 *
 * @category provenance
 * @since 0.0.0
 */
export const HeaderNamespace = LiteralKit(["rfc5322", "mapi", "x-header", "load-file"]).pipe(
  $I.annoteSchema("HeaderNamespace", { description: "Header namespace an evidence field came from." })
);

/**
 * The exact place evidence comes from. A claim with no anchor cannot exist.
 *
 * @category provenance
 * @since 0.0.0
 */
export const EvidenceAnchor = S.Union([
  S.TaggedStruct("HeaderField", {
    occurrence: OccurrenceId,
    namespace: HeaderNamespace,
    field: S.NonEmptyString,
  }),
  S.TaggedStruct("TextSpan", {
    occurrence: OccurrenceId,
    textDigest: Digest,
    start: S.Int.check(S.isGreaterThanOrEqualTo(0)),
    end: S.Int.check(S.isGreaterThanOrEqualTo(1)),
    quote: S.NonEmptyString,
  }).check(
    S.makeFilter(({ start, end }) => start < end, {
      identifier: $I`TextSpanOrderCheck`,
      message: "Expected span start before end.",
    })
  ),
  S.TaggedStruct("MetadataTag", {
    occurrence: OccurrenceId,
    namespace: S.NonEmptyString,
    tag: S.NonEmptyString,
  }),
  S.TaggedStruct("RecordRow", { occurrence: OccurrenceId, rowKey: S.NonEmptyString }),
]).pipe(S.toTaggedUnion("_tag"), $I.annoteSchema("EvidenceAnchor", { description: "Exact evidence location." }));
export type EvidenceAnchor = typeof EvidenceAnchor.Type;
