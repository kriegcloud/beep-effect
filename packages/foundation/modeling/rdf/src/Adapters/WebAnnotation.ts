/**
 * Web Annotation seam DTOs for optional evidence interop.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @packageDocumentation
 */

import { $RdfId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Match } from "effect";
import * as S from "effect/Schema";
import {
  EvidenceAnchor,
  EvidenceSelector,
  EvidenceTarget,
  FragmentSelector,
  TextPositionSelector,
  TextQuoteSelector,
} from "../Evidence.ts";
import { IRIReference } from "../Iri.ts";
import { makeSemanticSchemaMetadata } from "../SemanticSchemaMetadata.ts";

const $I = $RdfId.create("adapters/web-annotation");

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
 * @example
 * ```ts
 * import { WebAnnotationTextQuoteSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(WebAnnotationTextQuoteSelector)
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { WebAnnotationTextPositionSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(WebAnnotationTextPositionSelector)
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { WebAnnotationFragmentSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(WebAnnotationFragmentSelector)
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { WebAnnotationSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(WebAnnotationSelector)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const WebAnnotationSelector = S.Union([
  WebAnnotationTextQuoteSelector,
  WebAnnotationTextPositionSelector,
  WebAnnotationFragmentSelector,
]).pipe(
  $I.annoteSchema("WebAnnotationSelector", {
    description: "Web Annotation selector union.",
  })
);

/**
 * Type for {@link WebAnnotationSelector}.
 *
 * @example
 * ```ts
 * import type { WebAnnotationSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * const acceptWebAnnotationSelector = (value: WebAnnotationSelector) => value
 * console.log(acceptWebAnnotationSelector)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type WebAnnotationSelector = typeof WebAnnotationSelector.Type;

/**
 * Web Annotation target DTO.
 *
 * @example
 * ```ts
 * import { WebAnnotationTarget } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(WebAnnotationTarget)
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { WebAnnotation } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(WebAnnotation)
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { evidenceSelectorToWebAnnotationSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(evidenceSelectorToWebAnnotationSelector)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const evidenceSelectorToWebAnnotationSelector = (selector: EvidenceSelector): WebAnnotationSelector =>
  EvidenceSelector.match(selector, {
    "text-quote": (value) =>
      WebAnnotationTextQuoteSelector.make({
        type: "TextQuoteSelector",
        exact: value.exact,
        prefix: value.prefix,
        suffix: value.suffix,
      }),
    "text-position": (value) =>
      WebAnnotationTextPositionSelector.make({
        type: "TextPositionSelector",
        start: value.start,
        end: value.end,
      }),
    fragment: (value) =>
      WebAnnotationFragmentSelector.make({
        type: "FragmentSelector",
        value: value.value,
        conformsTo: value.conformsTo,
      }),
  });

/**
 * Map a Web Annotation selector DTO to an evidence selector.
 *
 * @param selector - Web Annotation selector DTO.
 * @returns Evidence selector.
 * @example
 * ```ts
 * import { webAnnotationSelectorToEvidenceSelector } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(webAnnotationSelectorToEvidenceSelector)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const webAnnotationSelectorToEvidenceSelector = (selector: WebAnnotationSelector): EvidenceSelector =>
  Match.value(selector).pipe(
    Match.when({ type: "TextQuoteSelector" }, (value) =>
      TextQuoteSelector.make({
        kind: "text-quote",
        exact: value.exact,
        prefix: value.prefix,
        suffix: value.suffix,
      })
    ),
    Match.when({ type: "TextPositionSelector" }, (value) =>
      TextPositionSelector.make({
        kind: "text-position",
        start: value.start,
        end: value.end,
      })
    ),
    Match.orElse((value) =>
      FragmentSelector.make({
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
 * @example
 * ```ts
 * import { evidenceTargetToWebAnnotationTarget } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(evidenceTargetToWebAnnotationTarget)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const evidenceTargetToWebAnnotationTarget = (target: EvidenceTarget): WebAnnotationTarget =>
  WebAnnotationTarget.make({
    source: target.source,
    selector: evidenceSelectorToWebAnnotationSelector(target.selector),
  });

/**
 * Map a Web Annotation target DTO to an evidence target.
 *
 * @param target - Web Annotation target DTO.
 * @returns Evidence target.
 * @example
 * ```ts
 * import { webAnnotationTargetToEvidenceTarget } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(webAnnotationTargetToEvidenceTarget)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const webAnnotationTargetToEvidenceTarget = (target: WebAnnotationTarget): EvidenceTarget =>
  EvidenceTarget.make({
    source: target.source,
    selector: webAnnotationSelectorToEvidenceSelector(target.selector),
  });

/**
 * Map an evidence anchor to a Web Annotation DTO.
 *
 * @param anchor - Evidence anchor.
 * @returns Web Annotation DTO.
 * @example
 * ```ts
 * import { evidenceAnchorToWebAnnotation } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(evidenceAnchorToWebAnnotation)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const evidenceAnchorToWebAnnotation = (anchor: EvidenceAnchor): WebAnnotation =>
  WebAnnotation.make({
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
 * @example
 * ```ts
 * import { webAnnotationToEvidenceAnchor } from "@beep/rdf/Adapters/WebAnnotation"
 *
 * console.log(webAnnotationToEvidenceAnchor)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export const webAnnotationToEvidenceAnchor = (annotation: WebAnnotation): EvidenceAnchor =>
  EvidenceAnchor.make({
    id: annotation.id,
    target: webAnnotationTargetToEvidenceTarget(annotation.target),
    note: annotation.bodyValue,
  });
