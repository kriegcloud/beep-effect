/**
 * Web Annotation seam DTOs for optional evidence interop.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import * as S from "effect/Schema";
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
    start: S.Number,
    end: S.Number,
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
    target: WebAnnotationTarget,
  },
  $I.annote("WebAnnotation", {
    description: "Web Annotation DTO.",
    semanticSchemaMetadata: adapterMetadata("WebAnnotation", "Web Annotation DTO."),
  })
) {}
