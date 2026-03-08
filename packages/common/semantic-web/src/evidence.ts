/**
 * Evidence anchors and selectors for provenance-adjacent workflows.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import * as S from "effect/Schema";
import { IRIReference } from "./iri.ts";
import { makeSemanticSchemaMetadata } from "./semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("evidence");

/**
 * Evidence selector discriminator.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EvidenceSelectorKind = LiteralKit(["text-quote", "text-position", "fragment"] as const).annotate(
  $I.annote("EvidenceSelectorKind", {
    description: "Evidence selector discriminator.",
  })
);

/**
 * Type for {@link EvidenceSelectorKind}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EvidenceSelectorKind = typeof EvidenceSelectorKind.Type;

/**
 * Text-quote selector for evidence anchors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TextQuoteSelector extends S.Class<TextQuoteSelector>($I`TextQuoteSelector`)(
  {
    kind: S.Literal("text-quote"),
    exact: S.NonEmptyString,
    prefix: S.OptionFromOptionalKey(S.String),
    suffix: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("TextQuoteSelector", {
    description: "Text-quote selector for evidence anchors.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "TextQuoteSelector",
      overview: "Text-quote selector for evidence anchors.",
      status: "stable",
      specifications: [
        { name: "Web Annotation Data Model", section: "Text Quote Selector", disposition: "informative" },
      ],
      equivalenceBasis: "Exact quote, prefix, and suffix equality.",
      evidenceAnchoring: "Adapter-neutral evidence selector compatible with Web Annotation text selectors.",
    }),
  })
) {}

/**
 * Text-position selector for evidence anchors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TextPositionSelector extends S.Class<TextPositionSelector>($I`TextPositionSelector`)(
  {
    kind: S.Literal("text-position"),
    start: NonNegativeInt,
    end: NonNegativeInt,
  },
  $I.annote("TextPositionSelector", {
    description: "Text-position selector for evidence anchors.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "TextPositionSelector",
      overview: "Text-position selector for evidence anchors.",
      status: "stable",
      specifications: [
        { name: "Web Annotation Data Model", section: "Text Position Selector", disposition: "informative" },
      ],
      equivalenceBasis: "Exact start and end offset equality.",
      evidenceAnchoring: "Adapter-neutral evidence selector compatible with Web Annotation text-position selectors.",
    }),
  })
) {}

/**
 * Fragment selector for evidence anchors.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FragmentSelector extends S.Class<FragmentSelector>($I`FragmentSelector`)(
  {
    kind: S.Literal("fragment"),
    value: S.NonEmptyString,
    conformsTo: S.OptionFromOptionalKey(IRIReference),
  },
  $I.annote("FragmentSelector", {
    description: "Fragment selector for evidence anchors.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "FragmentSelector",
      overview: "Fragment selector for evidence anchors.",
      status: "stable",
      specifications: [{ name: "Media Fragments URI 1.0", disposition: "informative" }],
      equivalenceBasis: "Exact fragment and optional conformsTo equality.",
      evidenceAnchoring: "Adapter-neutral evidence selector for URI fragment addressing.",
    }),
  })
) {}

/**
 * Evidence selector union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EvidenceSelector = S.Union([TextQuoteSelector, TextPositionSelector, FragmentSelector]).annotate(
  $I.annote("EvidenceSelector", {
    description: "Evidence selector union.",
  })
);

/**
 * Type for {@link EvidenceSelector}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EvidenceSelector = typeof EvidenceSelector.Type;

/**
 * Target resource plus selector pair referenced by an evidence anchor.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EvidenceTarget extends S.Class<EvidenceTarget>($I`EvidenceTarget`)(
  {
    source: IRIReference,
    selector: EvidenceSelector,
  },
  $I.annote("EvidenceTarget", {
    description: "Target resource plus selector pair referenced by an evidence anchor.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "EvidenceTarget",
      overview: "Target resource plus selector pair referenced by an evidence anchor.",
      status: "stable",
      specifications: [{ name: "Web Annotation Data Model", section: "Target", disposition: "informative" }],
      equivalenceBasis: "Source and selector equality.",
      evidenceAnchoring: "Core package-owned evidence target that can be mapped to Web Annotation.",
    }),
  })
) {}

/**
 * Evidence anchor value referenced from provenance and verification services.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EvidenceAnchor extends S.Class<EvidenceAnchor>($I`EvidenceAnchor`)(
  {
    id: IRIReference,
    target: EvidenceTarget,
    note: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("EvidenceAnchor", {
    description: "Evidence anchor value referenced from provenance and verification services.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "EvidenceAnchor",
      overview: "Evidence anchor value referenced from provenance and verification services.",
      status: "stable",
      specifications: [{ name: "Web Annotation Data Model", disposition: "informative" }],
      equivalenceBasis: "Identifier and target equality.",
      evidenceAnchoring:
        "Core package-owned evidence anchor that can be mapped to Web Annotation without making that model mandatory.",
    }),
  })
) {}

/**
 * Bounded evidence projection.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BoundedEvidenceProjection extends S.Class<BoundedEvidenceProjection>($I`BoundedEvidenceProjection`)(
  {
    anchors: S.Array(EvidenceAnchor),
    truncated: S.Boolean,
  },
  $I.annote("BoundedEvidenceProjection", {
    description: "Bounded evidence projection.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "provenanceConstruct",
      canonicalName: "BoundedEvidenceProjection",
      overview: "Bounded evidence projection.",
      status: "stable",
      specifications: [{ name: "PROV-O", disposition: "informative" }],
      equivalenceBasis: "Anchor collection equality plus truncated flag equality.",
      evidenceAnchoring: "Projection wrapper that keeps evidence exports bounded.",
    }),
  })
) {}
