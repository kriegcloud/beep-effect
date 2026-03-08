/**
 * JSON-LD value families and normalized document shapes.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { AbsoluteIRI, IRI, IRIReference } from "./iri.ts";
import { makeSemanticSchemaMetadata } from "./semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("jsonld");

const JsonLdScalar = S.Union([S.String, S.Number, S.Boolean]).annotate(
  $I.annote("JsonLdScalar", {
    description: "Scalar JSON-LD literal value input used by bounded document helpers.",
  })
);

const jsonLdBlankNodeIdentifierChecks = S.makeFilterGroup(
  [
    S.isPattern(/^_:[^\s]+$/, {
      identifier: $I`JsonLdBlankNodeIdentifierPatternCheck`,
      title: "JSON-LD Blank Node Identifier Pattern",
      description: "A JSON-LD blank-node identifier beginning with `_:` and containing no whitespace.",
      message: "Blank-node identifiers must begin with `_:`, and must not contain whitespace",
    }),
  ],
  {
    identifier: $I`JsonLdBlankNodeIdentifierChecks`,
    title: "JSON-LD Blank Node Identifier",
    description: "Checks for bounded JSON-LD blank-node identifiers.",
  }
);

/**
 * JSON-LD keyword surface used by the bounded v1 model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdKeyword = LiteralKit([
  "@base",
  "@context",
  "@graph",
  "@id",
  "@language",
  "@type",
  "@value",
  "@vocab",
] as const).annotate(
  $I.annote("JsonLdKeyword", {
    description: "JSON-LD keyword surface used by the bounded v1 model.",
  })
);

/**
 * Type for {@link JsonLdKeyword}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JsonLdKeyword = typeof JsonLdKeyword.Type;

/**
 * Normalized JSON-LD term definition used by the bounded context model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdTermDefinition extends S.Class<JsonLdTermDefinition>($I`JsonLdTermDefinition`)(
  {
    "@id": S.String,
    "@type": S.OptionFromOptionalKey(S.String),
  },
  $I.annote("JsonLdTermDefinition", {
    description: "Normalized JSON-LD term definition used by the bounded context model.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdTermDefinition",
      overview: "Normalized JSON-LD term definition used by the bounded context model.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "Term Definitions", disposition: "normative" }],
      equivalenceBasis: "Exact @id and optional @type equality.",
      representations: [{ kind: "JSON-LD" }],
    }),
  })
) {}

/**
 * Normalized JSON-LD context model with bounded base, vocab, and term bindings.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdContext extends S.Class<JsonLdContext>($I`JsonLdContext`)(
  {
    "@base": S.OptionFromOptionalKey(AbsoluteIRI),
    "@vocab": S.OptionFromOptionalKey(IRI),
    terms: S.Record(S.String, S.Union([S.String, JsonLdTermDefinition])),
  },
  $I.annote("JsonLdContext", {
    description: "Normalized JSON-LD context model with bounded base, vocab, and term bindings.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdContext",
      overview: "Normalized JSON-LD context model with bounded base, vocab, and term bindings.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "Context Definitions", disposition: "normative" }],
      equivalenceBasis: "Exact base, vocab, and term binding equality.",
      representations: [{ kind: "JSON-LD" }],
      canonicalizationRequired: false,
    }),
  })
) {}

/**
 * JSON-LD blank-node identifier used by the bounded document model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdBlankNodeIdentifier = S.String.check(jsonLdBlankNodeIdentifierChecks).pipe(
  S.brand("JsonLdBlankNodeIdentifier"),
  S.annotate(
    $I.annote("JsonLdBlankNodeIdentifier", {
      description: "JSON-LD blank-node identifier used by the bounded document model.",
      semanticSchemaMetadata: makeSemanticSchemaMetadata({
        kind: "identifier",
        canonicalName: "JsonLdBlankNodeIdentifier",
        overview: "JSON-LD blank-node identifier used by the bounded document model.",
        status: "stable",
        specifications: [{ name: "JSON-LD 1.1", section: "Node Identifiers", disposition: "normative" }],
        equivalenceBasis: "Exact blank-node identifier equality within a bounded document.",
        canonicalizationRequired: true,
        representations: [{ kind: "JSON-LD" }, { kind: "RDF/JS", note: "Bridges to RDF blank-node labels." }],
      }),
    })
  )
);

/**
 * Type for {@link JsonLdBlankNodeIdentifier}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JsonLdBlankNodeIdentifier = typeof JsonLdBlankNodeIdentifier.Type;

/**
 * JSON-LD node identifier used by the bounded document model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdNodeIdentifier = S.Union([IRIReference, JsonLdBlankNodeIdentifier]).annotate(
  $I.annote("JsonLdNodeIdentifier", {
    description: "JSON-LD node identifier used by the bounded document model.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "identifier",
      canonicalName: "JsonLdNodeIdentifier",
      overview: "JSON-LD node identifier used by the bounded document model.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "Node Identifiers", disposition: "normative" }],
      equivalenceBasis: "Identifier equality after bounded context-aware compaction or expansion.",
      canonicalizationRequired: true,
      representations: [{ kind: "JSON-LD" }, { kind: "RDF/JS", note: "Bridges to named nodes or blank nodes." }],
    }),
  })
);

/**
 * Type for {@link JsonLdNodeIdentifier}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JsonLdNodeIdentifier = typeof JsonLdNodeIdentifier.Type;

/**
 * JSON-LD node reference value.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdReferenceValue extends S.Class<JsonLdReferenceValue>($I`JsonLdReferenceValue`)(
  {
    "@id": JsonLdNodeIdentifier,
  },
  $I.annote("JsonLdReferenceValue", {
    description: "JSON-LD node reference value.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdReferenceValue",
      overview: "JSON-LD node reference value.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "Node References", disposition: "normative" }],
      equivalenceBasis: "Identifier equality after context-aware compaction or expansion.",
      representations: [{ kind: "JSON-LD" }],
      canonicalizationRequired: true,
    }),
  })
) {}

/**
 * JSON-LD literal value object.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdLiteralValue extends S.Class<JsonLdLiteralValue>($I`JsonLdLiteralValue`)(
  {
    "@value": JsonLdScalar,
    "@type": S.OptionFromOptionalKey(IRIReference),
    "@language": S.OptionFromOptionalKey(S.String),
  },
  $I.annote("JsonLdLiteralValue", {
    description: "JSON-LD literal value object.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdLiteralValue",
      overview: "JSON-LD literal value object used in bounded document bridging.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "Value Objects", disposition: "normative" }],
      equivalenceBasis: "Exact value, optional @type, and optional @language equality.",
      representations: [{ kind: "JSON-LD" }],
    }),
  })
) {}

/**
 * JSON-LD property value union used by bounded node objects.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsonLdPropertyValue = S.Union([JsonLdReferenceValue, JsonLdLiteralValue]).annotate(
  $I.annote("JsonLdPropertyValue", {
    description: "JSON-LD property value union used by bounded node objects.",
  })
);

/**
 * Type for {@link JsonLdPropertyValue}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JsonLdPropertyValue = typeof JsonLdPropertyValue.Type;

/**
 * JSON-LD node object used by bounded document and framing helpers.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdNodeObject extends S.Class<JsonLdNodeObject>($I`JsonLdNodeObject`)(
  {
    "@id": S.OptionFromOptionalKey(JsonLdNodeIdentifier),
    "@type": S.OptionFromOptionalKey(S.Array(IRIReference)),
    properties: S.Record(S.String, S.Array(JsonLdPropertyValue)),
  },
  $I.annote("JsonLdNodeObject", {
    description: "JSON-LD node object used by bounded document and framing helpers.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdNodeObject",
      overview: "JSON-LD node object used by bounded document and framing helpers.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "Node Objects", disposition: "normative" }],
      equivalenceBasis: "Exact identifier, type, and property-value equality.",
      representations: [{ kind: "JSON-LD" }, { kind: "RDF/JS", note: "Bridge source for quad generation." }],
      canonicalizationRequired: true,
    }),
  })
) {}

/**
 * Bounded JSON-LD document model with normalized context and graph content.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdDocument extends S.Class<JsonLdDocument>($I`JsonLdDocument`)(
  {
    "@context": S.OptionFromOptionalKey(JsonLdContext),
    "@graph": S.Array(JsonLdNodeObject),
  },
  $I.annote("JsonLdDocument", {
    description: "Bounded JSON-LD document model with normalized context and graph content.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdDocument",
      overview: "Bounded JSON-LD document model with normalized context and graph content.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1", section: "JSON-LD Documents", disposition: "normative" }],
      equivalenceBasis:
        "Document-shape equality only; RDF semantic identity requires explicit bridging and canonicalization.",
      representations: [{ kind: "JSON-LD" }, { kind: "RDF/JS", note: "Produced through document service bridging." }],
      canonicalizationRequired: true,
    }),
  })
) {}

/**
 * Bounded JSON-LD frame model.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsonLdFrame extends S.Class<JsonLdFrame>($I`JsonLdFrame`)(
  {
    "@type": S.OptionFromOptionalKey(IRIReference),
    includeProperties: S.OptionFromOptionalKey(S.Array(S.String)),
  },
  $I.annote("JsonLdFrame", {
    description: "Bounded JSON-LD frame model.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "jsonldConstruct",
      canonicalName: "JsonLdFrame",
      overview: "Bounded JSON-LD frame model.",
      status: "stable",
      specifications: [{ name: "JSON-LD 1.1 Framing", disposition: "informative" }],
      equivalenceBasis: "Exact frame-shape equality.",
      representations: [{ kind: "JSON-LD" }],
    }),
  })
) {}
