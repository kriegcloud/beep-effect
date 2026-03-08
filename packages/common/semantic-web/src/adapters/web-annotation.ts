/**
 * Web Annotation seam DTOs for optional evidence interop.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Match } from "effect";
import * as S from "effect/Schema";
import {
  EvidenceAnchor,
  type EvidenceSelector,
  EvidenceTarget,
  FragmentSelector,
  TextPositionSelector,
  TextQuoteSelector,
} from "../evidence.ts";
import { IRIReference } from "../iri.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("adapters/web-annotation");

const adapterMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "adapterBoundary",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "Web Annotation Data Model", disposition: "informative" }],
    equivalenceBasis: "Exact DTO field equality.",
    representations: [{ kind: "JSON-LD" }],
    evidenceAnchoring: "Optional adapter seam only; not the canonical package storage model.",
  });

/**
 * Web Annotation text-quote selector DTO.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WebAnnotationTextQuoteSelector extends S.Class<WebAnnotationTextQuoteSelector>(
  $I`WebAnnotationTextQuoteSelector`
)(
  {
    type: S.Literal("TextQuoteSelector"),
    exact: S.NonEmptyString,
    prefix: S.OptionFromOptionalKey(S.String),
    suffix: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("WebAnnotationTextQuoteSelector", {
    description: "Web Annotation text-quote selector DTO.",
    semanticSchemaMetadata: adapterMetadata(
      "WebAnnotationTextQuoteSelector",
      "Web Annotation text-quote selector DTO."
    ),
  })
) {}

/**
 * Web Annotation text-position selector DTO.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WebAnnotationTextPositionSelector extends S.Class<WebAnnotationTextPositionSelector>(
  $I`WebAnnotationTextPositionSelector`
)(
  {
    type: S.Literal("TextPositionSelector"),
    start: NonNegativeInt,
    end: NonNegativeInt,
  },
  $I.annote("WebAnnotationTextPositionSelector", {
    description: "Web Annotation text-position selector DTO.",
    semanticSchemaMetadata: adapterMetadata(
      "WebAnnotationTextPositionSelector",
      "Web Annotation text-position selector DTO."
    ),
  })
) {}

/**
 * Web Annotation fragment selector DTO.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WebAnnotationFragmentSelector extends S.Class<WebAnnotationFragmentSelector>(
  $I`WebAnnotationFragmentSelector`
)(
  {
    type: S.Literal("FragmentSelector"),
    value: S.NonEmptyString,
    conformsTo: S.OptionFromOptionalKey(IRIReference),
  },
  $I.annote("WebAnnotationFragmentSelector", {
    description: "Web Annotation fragment selector DTO.",
    semanticSchemaMetadata: adapterMetadata("WebAnnotationFragmentSelector", "Web Annotation fragment selector DTO."),
  })
) {}

/**
 * Web Annotation selector union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const WebAnnotationSelector = S.Union([
  WebAnnotationTextQuoteSelector,
  WebAnnotationTextPositionSelector,
  WebAnnotationFragmentSelector,
]).annotate(
  $I.annote("WebAnnotationSelector", {
    description: "Web Annotation selector union.",
  })
);

/**
 * Type for {@link WebAnnotationSelector}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type WebAnnotationSelector = typeof WebAnnotationSelector.Type;

/**
 * Web Annotation target DTO.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WebAnnotationTarget extends S.Class<WebAnnotationTarget>($I`WebAnnotationTarget`)(
  {
    source: IRIReference,
    selector: WebAnnotationSelector,
  },
  $I.annote("WebAnnotationTarget", {
    description: "Web Annotation target DTO.",
    semanticSchemaMetadata: adapterMetadata("WebAnnotationTarget", "Web Annotation target DTO."),
  })
) {}

/**
 * Web Annotation DTO.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WebAnnotation extends S.Class<WebAnnotation>($I`WebAnnotation`)(
  {
    id: IRIReference,
    type: S.Literal("Annotation"),
    bodyValue: S.OptionFromOptionalKey(S.String),
    target: WebAnnotationTarget,
  },
  $I.annote("WebAnnotation", {
    description: "Web Annotation DTO.",
    semanticSchemaMetadata: adapterMetadata("WebAnnotation", "Web Annotation DTO."),
  })
) {}

/**
 * Map an evidence selector to a Web Annotation selector DTO.
 *
 * @param selector - Evidence selector.
 * @returns Web Annotation selector DTO.
 * @since 0.0.0
 * @category Utility
 */
export const evidenceSelectorToWebAnnotationSelector = (selector: EvidenceSelector): WebAnnotationSelector =>
  Match.value(selector).pipe(
    Match.when({ kind: "text-quote" }, (value) =>
      WebAnnotationTextQuoteSelector.makeUnsafe({
        type: "TextQuoteSelector",
        exact: value.exact,
        prefix: value.prefix,
        suffix: value.suffix,
      })
    ),
    Match.when({ kind: "text-position" }, (value) =>
      WebAnnotationTextPositionSelector.makeUnsafe({
        type: "TextPositionSelector",
        start: value.start,
        end: value.end,
      })
    ),
    Match.orElse((value) =>
      WebAnnotationFragmentSelector.makeUnsafe({
        type: "FragmentSelector",
        value: value.value,
        conformsTo: value.conformsTo,
      })
    )
  );

/**
 * Map a Web Annotation selector DTO to an evidence selector.
 *
 * @param selector - Web Annotation selector DTO.
 * @returns Evidence selector.
 * @since 0.0.0
 * @category Utility
 */
export const webAnnotationSelectorToEvidenceSelector = (selector: WebAnnotationSelector): EvidenceSelector =>
  Match.value(selector).pipe(
    Match.when({ type: "TextQuoteSelector" }, (value) =>
      TextQuoteSelector.makeUnsafe({
        kind: "text-quote",
        exact: value.exact,
        prefix: value.prefix,
        suffix: value.suffix,
      })
    ),
    Match.when({ type: "TextPositionSelector" }, (value) =>
      TextPositionSelector.makeUnsafe({
        kind: "text-position",
        start: value.start,
        end: value.end,
      })
    ),
    Match.orElse((value) =>
      FragmentSelector.makeUnsafe({
        kind: "fragment",
        value: value.value,
        conformsTo: value.conformsTo,
      })
    )
  );

/**
 * Map an evidence target to a Web Annotation target DTO.
 *
 * @param target - Evidence target.
 * @returns Web Annotation target DTO.
 * @since 0.0.0
 * @category Utility
 */
export const evidenceTargetToWebAnnotationTarget = (target: EvidenceTarget): WebAnnotationTarget =>
  WebAnnotationTarget.makeUnsafe({
    source: target.source,
    selector: evidenceSelectorToWebAnnotationSelector(target.selector),
  });

/**
 * Map a Web Annotation target DTO to an evidence target.
 *
 * @param target - Web Annotation target DTO.
 * @returns Evidence target.
 * @since 0.0.0
 * @category Utility
 */
export const webAnnotationTargetToEvidenceTarget = (target: WebAnnotationTarget): EvidenceTarget =>
  EvidenceTarget.makeUnsafe({
    source: target.source,
    selector: webAnnotationSelectorToEvidenceSelector(target.selector),
  });

/**
 * Map an evidence anchor to a Web Annotation DTO.
 *
 * @param anchor - Evidence anchor.
 * @returns Web Annotation DTO.
 * @since 0.0.0
 * @category Utility
 */
export const evidenceAnchorToWebAnnotation = (anchor: EvidenceAnchor): WebAnnotation =>
  WebAnnotation.makeUnsafe({
    id: anchor.id,
    type: "Annotation",
    bodyValue: anchor.note,
    target: evidenceTargetToWebAnnotationTarget(anchor.target),
  });

/**
 * Map a Web Annotation DTO to an evidence anchor.
 *
 * @param annotation - Web Annotation DTO.
 * @returns Evidence anchor.
 * @since 0.0.0
 * @category Utility
 */
export const webAnnotationToEvidenceAnchor = (annotation: WebAnnotation): EvidenceAnchor =>
  EvidenceAnchor.makeUnsafe({
    id: annotation.id,
    target: webAnnotationTargetToEvidenceTarget(annotation.target),
    note: annotation.bodyValue,
  });
