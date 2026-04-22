/**
 * RDF/JS-aligned value families for `@beep/semantic-web`.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { Order, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { IRI } from "./iri.ts";
import { makeSemanticSchemaMetadata } from "./semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("rdf");

const decodeBlankNode = S.decodeUnknownSync(S.NonEmptyString);

const curieMetadata = makeSemanticSchemaMetadata({
  kind: "identifier",
  canonicalName: "Curie",
  overview: "Compact URI expression used with RDF namespace bindings.",
  status: "stable",
  specifications: [{ name: "CURIE Syntax 1.0", disposition: "informative" }],
  equivalenceBasis: "String equality after explicit prefix expansion.",
});

const namespaceBindingMetadata = makeSemanticSchemaMetadata({
  kind: "rdfConstruct",
  canonicalName: "NamespaceBinding",
  overview: "Prefix-to-IRI binding used for RDF compaction and expansion.",
  status: "stable",
  specifications: [{ name: "RDF 1.1 Concepts", section: "6", disposition: "informative" }],
  equivalenceBasis: "String equality over prefix and namespace pairs.",
});

const namedNodeMetadata = makeSemanticSchemaMetadata({
  kind: "rdfConstruct",
  canonicalName: "NamedNode",
  overview: "RDF named node aligned with the RDF/JS data-model surface.",
  status: "stable",
  specifications: [{ name: "RDF/JS Data Model", section: "NamedNode", disposition: "normative" }],
  canonicalizationRequired: true,
  equivalenceBasis: "IRI equality after identifier-level normalization when callers request normalization.",
  representations: [{ kind: "RDF/JS" }, { kind: "JSON-LD", note: "Used for compacted and expanded identifiers." }],
});

const literalMetadata = makeSemanticSchemaMetadata({
  kind: "rdfConstruct",
  canonicalName: "Literal",
  overview: "RDF literal value with explicit lexical form, datatype, and optional language tag.",
  status: "stable",
  specifications: [{ name: "RDF/JS Data Model", section: "Literal", disposition: "normative" }],
  equivalenceBasis: "Lexical form, datatype, and optional language-tag equality.",
  representations: [{ kind: "RDF/JS" }, { kind: "JSON-LD" }],
});

const quadMetadata = makeSemanticSchemaMetadata({
  kind: "rdfConstruct",
  canonicalName: "Quad",
  overview: "RDF statement value aligned with the RDF/JS quad surface.",
  status: "stable",
  specifications: [{ name: "RDF/JS Data Model", section: "Quad", disposition: "normative" }],
  equivalenceBasis: "Subject, predicate, object, and graph equality by RDF term serialization.",
  canonicalizationRequired: true,
  representations: [{ kind: "RDF/JS" }, { kind: "JSON-LD", note: "Produced by JSON-LD bridging." }],
});

const datasetMetadata = makeSemanticSchemaMetadata({
  kind: "rdfConstruct",
  canonicalName: "Dataset",
  overview: "Collection of RDF quads used as the package's RDF interoperability layer.",
  status: "stable",
  specifications: [{ name: "RDF/JS DatasetCore", disposition: "informative" }],
  equivalenceBasis: "Sorted quad serialization equality.",
  canonicalizationRequired: true,
  representations: [{ kind: "RDF/JS" }, { kind: "TriG" }],
});

const PrefixLabelChecks = S.makeFilterGroup(
  [
    S.isPattern(/^[A-Za-z][A-Za-z0-9._-]*$/, {
      identifier: $I`PrefixLabelPatternCheck`,
      title: "Prefix Label Pattern",
      description: "A prefixed-name label used in RDF namespace bindings.",
      message: "Prefix labels must begin with an ASCII letter and then use letters, digits, dot, underscore, or hyphen",
    }),
  ],
  {
    identifier: $I`PrefixLabelChecks`,
    title: "Prefix Label",
    description: "Checks for RDF prefix labels.",
  }
);

const CurieChecks = S.makeFilterGroup(
  [
    S.isPattern(/^[A-Za-z][A-Za-z0-9._-]*:[^\\s]+$/, {
      identifier: $I`CuriePatternCheck`,
      title: "CURIE Pattern",
      description: "A compact URI expression using a prefix label and a local part.",
      message: "CURIE values must be of the form prefix:suffix without whitespace",
    }),
  ],
  {
    identifier: $I`CurieChecks`,
    title: "CURIE",
    description: "Checks for CURIE syntax.",
  }
);

const LanguageTagChecks = S.makeFilterGroup(
  [
    S.isPattern(/^[A-Za-z]+(?:-[A-Za-z0-9]+)*$/, {
      identifier: $I`LanguageTagPatternCheck`,
      title: "Language Tag Pattern",
      description: "A simple BCP 47-style language tag.",
      message: "Language tags must use alphanumeric subtags separated by hyphens",
    }),
  ],
  {
    identifier: $I`LanguageTagChecks`,
    title: "Language Tag",
    description: "Checks for RDF literal language tags.",
  }
);

const BlankNodeLabelChecks = S.makeFilterGroup(
  [
    S.isNonEmpty({
      identifier: $I`BlankNodeLabelNonEmptyCheck`,
      title: "Blank Node Label Non Empty",
      description: "Blank node labels must not be empty.",
      message: "Blank node labels must not be empty",
    }),
    S.isTrimmed({
      identifier: $I`BlankNodeLabelTrimmedCheck`,
      title: "Blank Node Label Trimmed",
      description: "Blank node labels must not contain leading or trailing whitespace.",
      message: "Blank node labels must not contain leading or trailing whitespace",
    }),
  ],
  {
    identifier: $I`BlankNodeLabelChecks`,
    title: "Blank Node Label",
    description: "Checks for blank node labels.",
  }
);

/**
 * Prefix label used by RDF namespace bindings.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { PrefixLabel } from "@beep/semantic-web/rdf"
 *
 * const decoded = S.decodeUnknownSync(PrefixLabel)("schema")
 * console.log(decoded) // "schema"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PrefixLabel = S.String.check(PrefixLabelChecks).pipe(
  S.brand("PrefixLabel"),
  S.annotate(
    $I.annote("PrefixLabel", {
      description: "Prefix label used by RDF namespace bindings.",
      semanticSchemaMetadata: makeSemanticSchemaMetadata({
        kind: "identifier",
        canonicalName: "PrefixLabel",
        overview: "Prefix label used by RDF namespace bindings.",
        status: "stable",
        specifications: [{ name: "RDF 1.1 Concepts", disposition: "informative" }],
        equivalenceBasis: "Exact string equality.",
      }),
    })
  )
);

/**
 * Type for {@link PrefixLabel}.
 *
 * @example
 * ```ts
 * import type { PrefixLabel } from "@beep/semantic-web/rdf"
 *
 * const acceptPrefixLabel = (value: PrefixLabel) => value
 * void acceptPrefixLabel
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PrefixLabel = typeof PrefixLabel.Type;

/**
 * CURIE-style compact IRI expression.
 *
 * @example
 * ```ts
 * import { Curie } from "@beep/semantic-web/rdf"
 *
 * void Curie
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const Curie = S.String.check(CurieChecks).pipe(
  S.brand("Curie"),
  S.annotate(
    $I.annote("Curie", {
      description: "CURIE-style compact IRI expression.",
      semanticSchemaMetadata: curieMetadata,
    })
  )
);

/**
 * Type for {@link Curie}.
 *
 * @example
 * ```ts
 * import type { Curie } from "@beep/semantic-web/rdf"
 *
 * const acceptCurie = (value: Curie) => value
 * void acceptCurie
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Curie = typeof Curie.Type;

/**
 * RDF literal language tag.
 *
 * @example
 * ```ts
 * import { LanguageTag } from "@beep/semantic-web/rdf"
 *
 * void LanguageTag
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const LanguageTag = S.String.check(LanguageTagChecks).pipe(
  S.brand("LanguageTag"),
  S.annotate(
    $I.annote("LanguageTag", {
      description: "RDF literal language tag.",
      semanticSchemaMetadata: makeSemanticSchemaMetadata({
        kind: "rdfConstruct",
        canonicalName: "LanguageTag",
        overview: "Language tag attached to RDF literals.",
        status: "stable",
        specifications: [{ name: "RDF 1.1 Concepts", section: "Language-Tagged Strings", disposition: "normative" }],
        equivalenceBasis: "Lower-cased language-tag equality.",
      }),
    })
  )
);

/**
 * Type for {@link LanguageTag}.
 *
 * @example
 * ```ts
 * import type { LanguageTag } from "@beep/semantic-web/rdf"
 *
 * const acceptLanguageTag = (value: LanguageTag) => value
 * void acceptLanguageTag
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type LanguageTag = typeof LanguageTag.Type;

/**
 * RDF named node value.
 *
 * @example
 * ```ts
 * import { NamedNode } from "@beep/semantic-web/rdf"
 *
 * void NamedNode
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class NamedNode extends S.Class<NamedNode>($I`NamedNode`)(
  {
    termType: S.Literal("NamedNode"),
    value: IRI,
  },
  $I.annote("NamedNode", {
    description: "RDF named node value aligned with RDF/JS.",
    semanticSchemaMetadata: namedNodeMetadata,
  })
) {}

/**
 * RDF blank node value.
 *
 * @example
 * ```ts
 * import { BlankNode } from "@beep/semantic-web/rdf"
 *
 * void BlankNode
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class BlankNode extends S.Class<BlankNode>($I`BlankNode`)(
  {
    termType: S.Literal("BlankNode"),
    value: S.String.check(BlankNodeLabelChecks),
  },
  $I.annote("BlankNode", {
    description: "RDF blank node value aligned with RDF/JS.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "rdfConstruct",
      canonicalName: "BlankNode",
      overview: "RDF blank node value aligned with the RDF/JS data-model surface.",
      status: "stable",
      specifications: [{ name: "RDF/JS Data Model", section: "BlankNode", disposition: "normative" }],
      equivalenceBasis: "Blank-node label equality within a bounded dataset.",
      canonicalizationRequired: true,
      representations: [{ kind: "RDF/JS" }, { kind: "TriG" }],
    }),
  })
) {}

/**
 * RDF literal value.
 *
 * @example
 * ```ts
 * import { Literal } from "@beep/semantic-web/rdf"
 *
 * void Literal
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Literal extends S.Class<Literal>($I`Literal`)(
  {
    termType: S.Literal("Literal"),
    value: S.String,
    language: S.OptionFromOptionalKey(LanguageTag),
    datatype: NamedNode,
  },
  $I.annote("Literal", {
    description: "RDF literal value aligned with RDF/JS.",
    semanticSchemaMetadata: literalMetadata,
  })
) {}

/**
 * RDF default graph term.
 *
 * @example
 * ```ts
 * import { DefaultGraph } from "@beep/semantic-web/rdf"
 *
 * void DefaultGraph
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class DefaultGraph extends S.Class<DefaultGraph>($I`DefaultGraph`)(
  {
    termType: S.Literal("DefaultGraph"),
    value: S.Literal(""),
  },
  $I.annote("DefaultGraph", {
    description: "RDF default graph term aligned with RDF/JS.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "rdfConstruct",
      canonicalName: "DefaultGraph",
      overview: "Default graph term aligned with the RDF/JS data-model surface.",
      status: "stable",
      specifications: [{ name: "RDF/JS Data Model", section: "DefaultGraph", disposition: "normative" }],
      equivalenceBasis: "Exact empty-string value equality.",
    }),
  })
) {}

/**
 * RDF term union.
 *
 * @example
 * ```ts
 * import { Term } from "@beep/semantic-web/rdf"
 *
 * void Term
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const Term = S.Union([NamedNode, BlankNode, Literal, DefaultGraph]).annotate(
  $I.annote("Term", {
    description: "RDF term union aligned with RDF/JS.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "rdfConstruct",
      canonicalName: "Term",
      overview: "RDF term union aligned with the RDF/JS data-model surface.",
      status: "stable",
      specifications: [{ name: "RDF/JS Data Model", section: "Term", disposition: "normative" }],
      equivalenceBasis: "Term-type aware serialized equality.",
      canonicalizationRequired: true,
      representations: [{ kind: "RDF/JS" }, { kind: "JSON-LD" }],
    }),
  })
);

/**
 * Type for {@link Term}.
 *
 * @example
 * ```ts
 * import type { Term } from "@beep/semantic-web/rdf"
 *
 * const acceptTerm = (value: Term) => value
 * void acceptTerm
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Term = typeof Term.Type;

/**
 * RDF subject term union.
 *
 * @example
 * ```ts
 * import { Subject } from "@beep/semantic-web/rdf"
 *
 * void Subject
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const Subject = S.Union([NamedNode, BlankNode]).annotate(
  $I.annote("Subject", {
    description: "RDF subject term union.",
  })
);

/**
 * Type for {@link Subject}.
 *
 * @example
 * ```ts
 * import type { Subject } from "@beep/semantic-web/rdf"
 *
 * const acceptSubject = (value: Subject) => value
 * void acceptSubject
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Subject = typeof Subject.Type;

/**
 * RDF object term union.
 *
 * @example
 * ```ts
 * import { ObjectTerm } from "@beep/semantic-web/rdf"
 *
 * void ObjectTerm
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const ObjectTerm = S.Union([NamedNode, BlankNode, Literal]).annotate(
  $I.annote("ObjectTerm", {
    description: "RDF object term union.",
  })
);

/**
 * Type for {@link ObjectTerm}.
 *
 * @example
 * ```ts
 * import type { ObjectTerm } from "@beep/semantic-web/rdf"
 *
 * const acceptObjectTerm = (value: ObjectTerm) => value
 * void acceptObjectTerm
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type ObjectTerm = typeof ObjectTerm.Type;

/**
 * RDF graph term union.
 *
 * @example
 * ```ts
 * import { GraphTerm } from "@beep/semantic-web/rdf"
 *
 * void GraphTerm
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const GraphTerm = S.Union([NamedNode, BlankNode, DefaultGraph]).annotate(
  $I.annote("GraphTerm", {
    description: "RDF graph term union.",
  })
);

/**
 * Type for {@link GraphTerm}.
 *
 * @example
 * ```ts
 * import type { GraphTerm } from "@beep/semantic-web/rdf"
 *
 * const acceptGraphTerm = (value: GraphTerm) => value
 * void acceptGraphTerm
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type GraphTerm = typeof GraphTerm.Type;

/**
 * RDF quad value aligned with RDF/JS.
 *
 * @example
 * ```ts
 * import { Quad } from "@beep/semantic-web/rdf"
 *
 * void Quad
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Quad extends S.Class<Quad>($I`Quad`)(
  {
    subject: Subject,
    predicate: NamedNode,
    object: ObjectTerm,
    graph: GraphTerm,
  },
  $I.annote("Quad", {
    description: "RDF quad value aligned with RDF/JS.",
    semanticSchemaMetadata: quadMetadata,
  })
) {}

/**
 * Dataset wrapper for RDF quads.
 *
 * @example
 * ```ts
 * import { Dataset } from "@beep/semantic-web/rdf"
 *
 * void Dataset
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class Dataset extends S.Class<Dataset>($I`Dataset`)(
  {
    quads: S.Array(Quad),
  },
  $I.annote("Dataset", {
    description: "Dataset wrapper for RDF quads.",
    semanticSchemaMetadata: datasetMetadata,
  })
) {}

/**
 * Prefix-to-namespace binding for RDF compaction and expansion.
 *
 * @example
 * ```ts
 * import { NamespaceBinding } from "@beep/semantic-web/rdf"
 *
 * void NamespaceBinding
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class NamespaceBinding extends S.Class<NamespaceBinding>($I`NamespaceBinding`)(
  {
    prefix: PrefixLabel,
    namespace: IRI,
  },
  $I.annote("NamespaceBinding", {
    description: "Prefix-to-namespace binding for RDF compaction and expansion.",
    semanticSchemaMetadata: namespaceBindingMetadata,
  })
) {}

/**
 * Prefix map keyed by {@link PrefixLabel}.
 *
 * @example
 * ```ts
 * import { PrefixMap } from "@beep/semantic-web/rdf"
 *
 * void PrefixMap
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const PrefixMap = S.Record(PrefixLabel, IRI).annotate(
  $I.annote("PrefixMap", {
    description: "Prefix map keyed by RDF prefix labels.",
    semanticSchemaMetadata: makeSemanticSchemaMetadata({
      kind: "rdfConstruct",
      canonicalName: "PrefixMap",
      overview: "Prefix-to-namespace bindings used for RDF compaction and expansion.",
      status: "stable",
      specifications: [{ name: "RDF 1.1 Concepts", section: "6", disposition: "informative" }],
      equivalenceBasis: "Prefix and namespace string equality.",
    }),
  })
);

/**
 * Type for {@link PrefixMap}.
 *
 * @example
 * ```ts
 * import type { PrefixMap } from "@beep/semantic-web/rdf"
 *
 * const acceptPrefixMap = (value: PrefixMap) => value
 * void acceptPrefixMap
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type PrefixMap = typeof PrefixMap.Type;

const decodeNamedNode = S.decodeUnknownSync(NamedNode);
const decodeLiteral = S.decodeUnknownSync(Literal);

/**
 * Build a named node from an IRI string.
 *
 * @example
 * ```typescript
 * import { makeNamedNode } from "@beep/semantic-web/rdf"
 *
 * const node = makeNamedNode("https://schema.org/Person")
 * console.log(node.termType) // "NamedNode"
 * console.log(node.value) // "https://schema.org/Person"
 * ```
 *
 * @param value - Named node IRI.
 * @returns Decoded named node.
 * @since 0.0.0
 * @category utilities
 */
export const makeNamedNode = (value: string): NamedNode => decodeNamedNode({ termType: "NamedNode", value });

/**
 * Build a blank node from a non-empty label.
 *
 * @example
 * ```typescript
 * import { makeBlankNode } from "@beep/semantic-web/rdf"
 *
 * const node = makeBlankNode("b0")
 * console.log(node.termType) // "BlankNode"
 * console.log(node.value) // "b0"
 * ```
 *
 * @param value - Blank node label.
 * @returns Decoded blank node.
 * @since 0.0.0
 * @category utilities
 */
export const makeBlankNode = (value: string): BlankNode =>
  BlankNode.make({ termType: "BlankNode", value: decodeBlankNode(value) });

/**
 * Build an RDF literal.
 *
 * @example
 * ```typescript
 * import { makeLiteral } from "@beep/semantic-web/rdf"
 *
 * const lit = makeLiteral("42", "http://www.w3.org/2001/XMLSchema#integer")
 * console.log(lit.termType) // "Literal"
 * console.log(lit.value) // "42"
 * ```
 *
 * @param value - Lexical form.
 * @param datatype - Datatype IRI.
 * @param language - Optional language tag.
 * @returns Decoded RDF literal.
 * @since 0.0.0
 * @category utilities
 */
export const makeLiteral = (value: string, datatype: string, language?: string): Literal =>
  decodeLiteral({
    termType: "Literal",
    value,
    datatype: makeNamedNode(datatype),
    ...(language === undefined ? {} : { language }),
  });

/**
 * Build an RDF quad.
 *
 * @example
 * ```typescript
 * import { makeNamedNode, makeLiteral, makeQuad } from "@beep/semantic-web/rdf"
 *
 * const subject = makeNamedNode("https://example.org/alice")
 * const predicate = makeNamedNode("https://schema.org/name")
 * const object = makeLiteral("Alice", "http://www.w3.org/2001/XMLSchema#string")
 * const quad = makeQuad(subject, predicate, object)
 * console.log(quad.subject.value) // "https://example.org/alice"
 * ```
 *
 * @param subject - Subject term.
 * @param predicate - Predicate term.
 * @param object - Object term.
 * @param graph - Optional graph term.
 * @returns Decoded quad.
 * @since 0.0.0
 * @category utilities
 */
export const makeQuad = (subject: Subject, predicate: NamedNode, object: ObjectTerm, graph?: GraphTerm): Quad =>
  Quad.make({
    subject,
    predicate,
    object,
    graph: graph ?? DefaultGraph.make({ termType: "DefaultGraph", value: "" }),
  });

/**
 * Build a dataset from quads.
 *
 * @example
 * ```typescript
 * import { makeNamedNode, makeLiteral, makeQuad, makeDataset } from "@beep/semantic-web/rdf"
 *
 * const quad = makeQuad(
 *
 *
 *
 * )
 * const dataset = makeDataset([quad])
 * console.log(dataset.quads.length) // 1
 * ```
 *
 * @param quads - Input quads.
 * @returns Decoded dataset.
 * @since 0.0.0
 * @category utilities
 */
export const makeDataset = (quads: ReadonlyArray<Quad>): Dataset => Dataset.make({ quads: A.fromIterable(quads) });

/**
 * Serialize an RDF term to a deterministic lexical form.
 *
 * @example
 * ```typescript
 * import { makeNamedNode, serializeTerm } from "@beep/semantic-web/rdf"
 *
 * const serialized = serializeTerm(makeNamedNode("https://example.org/x"))
 * console.log(serialized) // "<https://example.org/x>"
 * ```
 *
 * @param term - RDF term.
 * @returns Deterministic term serialization.
 * @since 0.0.0
 * @category utilities
 */
export const serializeTerm = (term: Term): string => {
  if (term.termType === "NamedNode") {
    return `<${term.value}>`;
  }
  if (term.termType === "BlankNode") {
    return `_:${term.value}`;
  }
  if (term.termType === "Literal") {
    if (O.isSome(term.language)) {
      return `"${term.value}"@${term.language.value.toLowerCase()}`;
    }
    return `"${term.value}"^^<${term.datatype.value}>`;
  }
  return "default";
};

/**
 * Serialize an RDF quad to a deterministic lexical form.
 *
 * @example
 * ```typescript
 * import { makeNamedNode, makeLiteral, makeQuad, serializeQuad } from "@beep/semantic-web/rdf"
 *
 * const quad = makeQuad(
 *
 *
 *
 * )
 * console.log(typeof serializeQuad(quad)) // "string"
 * ```
 *
 * @param quad - RDF quad.
 * @returns Deterministic quad serialization.
 * @since 0.0.0
 * @category utilities
 */
export const serializeQuad = (quad: Quad): string =>
  `${serializeTerm(quad.subject)} ${serializeTerm(quad.predicate)} ${serializeTerm(quad.object)} ${serializeTerm(quad.graph)} .`;

const byQuadLexicalAscending: Order.Order<Quad> = Order.mapInput(Order.String, serializeQuad);

/**
 * Sort dataset quads by deterministic quad serialization.
 *
 * @example
 * ```typescript
 * import { makeDataset, sortDatasetQuads } from "@beep/semantic-web/rdf"
 *
 * const dataset = makeDataset([])
 * const sorted = sortDatasetQuads(dataset)
 * console.log(sorted.length) // 0
 * ```
 *
 * @param dataset - RDF dataset.
 * @returns Sorted quad array.
 * @since 0.0.0
 * @category utilities
 */
export const sortDatasetQuads = (dataset: Dataset): ReadonlyArray<Quad> =>
  A.sort(dataset.quads, byQuadLexicalAscending);

/**
 * Compare datasets by sorted quad serialization.
 *
 * @example
 * ```typescript
 * import { makeDataset, areDatasetsEquivalent } from "@beep/semantic-web/rdf"
 *
 * const a = makeDataset([])
 * const b = makeDataset([])
 * console.log(areDatasetsEquivalent(a, b)) // true
 * ```
 *
 * @param left - Left dataset.
 * @param right - Right dataset.
 * @returns `true` when both datasets share the same sorted quad serialization.
 * @since 0.0.0
 * @category utilities
 */
export const areDatasetsEquivalent = (left: Dataset, right: Dataset): boolean =>
  pipe(sortDatasetQuads(left), A.map(serializeQuad), A.join("\n")) ===
  pipe(sortDatasetQuads(right), A.map(serializeQuad), A.join("\n"));
