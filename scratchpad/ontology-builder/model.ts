import { $ScratchpadId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { IRI } from "@beep/semantic-web/iri";
import { OWL_NAMESPACE } from "@beep/semantic-web/vocab/owl";
import { RDF_NAMESPACE } from "@beep/semantic-web/vocab/rdf";
import { RDFS_NAMESPACE } from "@beep/semantic-web/vocab/rdfs";
import { XSD_BOOLEAN, XSD_DOUBLE, XSD_INTEGER, XSD_NAMESPACE, XSD_STRING } from "@beep/semantic-web/vocab/xsd";
import { pipe, Result } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";

export { IRI } from "@beep/semantic-web/iri";

export const $BuilderId = $ScratchpadId.create("ontology-builder");

const decodeIriResult = S.decodeUnknownResult(IRI);

export const schemaIssueToError = (cause: S.SchemaError | S.SchemaError["issue"]): S.SchemaError =>
  cause instanceof S.SchemaError ? cause : new S.SchemaError(cause);

/**
 * A local ontology term name that can safely become an IRI fragment.
 */
export const OntologyTermName = S.NonEmptyString.check(
  S.isPattern(/^[A-Za-z][A-Za-z0-9._-]*$/, {
    identifier: $BuilderId`OntologyTermNamePatternCheck`,
    title: "Ontology Term Name Pattern",
    description: "A local ontology term name that can safely become an IRI fragment.",
    message: "Ontology term names must start with a letter and then use letters, digits, dot, underscore, or hyphen",
  })
).pipe(
  S.brand("OntologyTermName"),
  $BuilderId.annoteSchema("OntologyTermName", {
    description: "A local ontology term name that can safely become an IRI fragment.",
  })
);

export type OntologyTermName = typeof OntologyTermName.Type;

const decodeOntologyTermNameResult = S.decodeUnknownResult(OntologyTermName);

/**
 * Closed POC metadata kinds attached to schema/class and schema/key positions.
 */
export const OntologyMetadataKind = LiteralKit([
  "ontology",
  "class",
  "datatypePredicate",
  "objectPredicate",
]).pipe(
  $BuilderId.annoteSchema("OntologyMetadataKind", {
    description: "Closed POC metadata kinds attached to schema/class and schema/key positions.",
  })
);

export type OntologyMetadataKind = typeof OntologyMetadataKind.Type;

/**
 * Ontology-level metadata for an assembled schema-backed ontology.
 */
export class OntologyDefinitionMetadata extends S.Class<OntologyDefinitionMetadata>($BuilderId`OntologyDefinitionMetadata`)(
  {
    kind: S.tag("ontology"),
    schemaIdentity: S.NonEmptyString,
    baseIri: IRI,
    preferredPrefix: S.NonEmptyString,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $BuilderId.annote("OntologyDefinitionMetadata", {
    description: "Ontology-level metadata for an assembled schema-backed ontology.",
  })
) {}

/**
 * Normalized IRI reference used by assembled class relationships and mapping metadata.
 */
export class OntologyReference extends S.Class<OntologyReference>($BuilderId`OntologyReference`)(
  {
    iri: IRI,
  },
  $BuilderId.annote("OntologyReference", {
    description: "Normalized IRI reference used by assembled class relationships and mapping metadata.",
  })
) {}

/**
 * Deferred IRI reference target stored in class annotations.
 */
export class OntologyIriReferenceTarget extends S.Class<OntologyIriReferenceTarget>(
  $BuilderId`OntologyIriReferenceTarget`
)(
  {
    kind: S.tag("iri"),
    iri: IRI,
  },
  $BuilderId.annote("OntologyIriReferenceTarget", {
    description: "Deferred IRI reference target stored in class annotations.",
  })
) {}

/**
 * Deferred local term reference target stored in class annotations.
 */
export class OntologyTermReferenceTarget extends S.Class<OntologyTermReferenceTarget>(
  $BuilderId`OntologyTermReferenceTarget`
)(
  {
    kind: S.tag("term"),
    termName: OntologyTermName,
  },
  $BuilderId.annote("OntologyTermReferenceTarget", {
    description: "Deferred local term reference target stored in class annotations.",
  })
) {}

/**
 * Deferred schema reference target resolved by `Ont.build`.
 */
export class OntologySchemaReferenceTarget extends S.Class<OntologySchemaReferenceTarget>(
  $BuilderId`OntologySchemaReferenceTarget`
)(
  {
    kind: S.tag("schema"),
    schemaIdentity: S.OptionFromOptionalKey(S.NonEmptyString),
    identifier: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $BuilderId.annote("OntologySchemaReferenceTarget", {
    description: "Deferred schema reference target resolved by `Ont.build`.",
  })
) {}

export const OntologyReferenceTarget = S.Union([
  OntologyIriReferenceTarget,
  OntologyTermReferenceTarget,
  OntologySchemaReferenceTarget,
]).pipe(
  $BuilderId.annoteSchema("OntologyReferenceTarget", {
    description: "Deferred class relationship reference target.",
  })
);

export type OntologyReferenceTarget = typeof OntologyReferenceTarget.Type;

/**
 * Class metadata attached to an Effect Schema object/class after assembly.
 */
export class OntologyClassMetadata extends S.Class<OntologyClassMetadata>($BuilderId`OntologyClassMetadata`)(
  {
    kind: S.tag("class"),
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    altLabels: S.Array(S.NonEmptyString),
    definition: S.OptionFromOptionalKey(S.NonEmptyString),
    deprecated: S.Boolean,
    source: S.OptionFromOptionalKey(IRI),
    parents: S.Array(OntologyReference),
    children: S.Array(OntologyReference),
    seeAlso: S.Array(OntologyReference),
    isDefinedBy: S.Array(OntologyReference),
    equivalentClasses: S.Array(OntologyReference),
    exactMatches: S.Array(OntologyReference),
    closeMatches: S.Array(OntologyReference),
    sameAs: S.Array(OntologyReference),
  },
  $BuilderId.annote("OntologyClassMetadata", {
    description: "Class metadata attached to an Effect Schema object/class after assembly.",
  })
) {}

/**
 * Datatype predicate metadata attached to an Effect Schema field key.
 */
export class OntologyDatatypePredicateMetadata extends S.Class<OntologyDatatypePredicateMetadata>(
  $BuilderId`OntologyDatatypePredicateMetadata`
)(
  {
    kind: S.tag("datatypePredicate"),
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeDatatypeIri: IRI,
  },
  $BuilderId.annote("OntologyDatatypePredicateMetadata", {
    description: "Datatype predicate metadata attached to an Effect Schema field key.",
  })
) {}

/**
 * Object predicate metadata attached to an Effect Schema field key.
 */
export class OntologyObjectPredicateMetadata extends S.Class<OntologyObjectPredicateMetadata>(
  $BuilderId`OntologyObjectPredicateMetadata`
)(
  {
    kind: S.tag("objectPredicate"),
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeClassIri: IRI,
  },
  $BuilderId.annote("OntologyObjectPredicateMetadata", {
    description: "Object predicate metadata attached to an Effect Schema field key.",
  })
) {}

export const OntologyPredicateMetadata = S.Union([
  OntologyDatatypePredicateMetadata,
  OntologyObjectPredicateMetadata,
]).pipe(
  $BuilderId.annoteSchema("OntologyPredicateMetadata", {
    description: "Predicate metadata attached to Effect Schema field keys.",
  })
);

export type OntologyPredicateMetadata = typeof OntologyPredicateMetadata.Type;

/**
 * Class metadata draft stored directly in schema annotations.
 */
export class OntologyClassAnnotationDraft extends S.Class<OntologyClassAnnotationDraft>(
  $BuilderId`OntologyClassAnnotationDraft`
)(
  {
    kind: S.tag("classDraft"),
    termName: S.OptionFromOptionalKey(OntologyTermName),
    iri: S.OptionFromOptionalKey(IRI),
    label: S.OptionFromOptionalKey(S.NonEmptyString),
    description: S.OptionFromOptionalKey(S.NonEmptyString),
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    altLabels: S.Array(S.NonEmptyString),
    definition: S.OptionFromOptionalKey(S.NonEmptyString),
    deprecated: S.Boolean,
    source: S.OptionFromOptionalKey(IRI),
    parents: S.Array(OntologyReferenceTarget),
    children: S.Array(OntologyReferenceTarget),
    seeAlso: S.Array(OntologyReferenceTarget),
    isDefinedBy: S.Array(OntologyReferenceTarget).pipe(S.OptionFromOptionalKey),
    equivalentClasses: S.Array(OntologyReferenceTarget),
    exactMatches: S.Array(OntologyReferenceTarget),
    closeMatches: S.Array(OntologyReferenceTarget),
    sameAs: S.Array(OntologyReferenceTarget),
  },
  $BuilderId.annote("OntologyClassAnnotationDraft", {
    description: "Class metadata draft stored directly in schema annotations.",
  })
) {}

/**
 * Datatype predicate metadata draft stored directly in key annotations.
 */
export class OntologyDatatypePredicateAnnotationDraft extends S.Class<OntologyDatatypePredicateAnnotationDraft>(
  $BuilderId`OntologyDatatypePredicateAnnotationDraft`
)(
  {
    kind: S.tag("datatypePredicateDraft"),
    termName: S.OptionFromOptionalKey(OntologyTermName),
    iri: S.OptionFromOptionalKey(IRI),
    label: S.OptionFromOptionalKey(S.NonEmptyString),
    description: S.OptionFromOptionalKey(S.NonEmptyString),
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeDatatypeIri: IRI,
  },
  $BuilderId.annote("OntologyDatatypePredicateAnnotationDraft", {
    description: "Datatype predicate metadata draft stored directly in key annotations.",
  })
) {}

/**
 * Object predicate metadata draft stored directly in key annotations.
 */
export class OntologyObjectPredicateAnnotationDraft extends S.Class<OntologyObjectPredicateAnnotationDraft>(
  $BuilderId`OntologyObjectPredicateAnnotationDraft`
)(
  {
    kind: S.tag("objectPredicateDraft"),
    termName: S.OptionFromOptionalKey(OntologyTermName),
    iri: S.OptionFromOptionalKey(IRI),
    label: S.OptionFromOptionalKey(S.NonEmptyString),
    description: S.OptionFromOptionalKey(S.NonEmptyString),
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeClassIri: IRI,
  },
  $BuilderId.annote("OntologyObjectPredicateAnnotationDraft", {
    description: "Object predicate metadata draft stored directly in key annotations.",
  })
) {}

export const OntologyPredicateAnnotationDraft = S.Union([
  OntologyDatatypePredicateAnnotationDraft,
  OntologyObjectPredicateAnnotationDraft,
]).pipe(
  $BuilderId.annoteSchema("OntologyPredicateAnnotationDraft", {
    description: "Predicate metadata draft stored directly in key annotations.",
  })
);

export type OntologyPredicateAnnotationDraft = typeof OntologyPredicateAnnotationDraft.Type;

/**
 * Payload stored under the `ontologyMetadata` annotation key.
 */
export type OntologyMetadataAnnotationPayload =
  | OntologyClassAnnotationDraft
  | OntologyDatatypePredicateAnnotationDraft
  | OntologyObjectPredicateAnnotationDraft
  | OntologyClassMetadata
  | OntologyDatatypePredicateMetadata
  | OntologyObjectPredicateMetadata;

declare module "effect/Schema" {
  namespace Annotations {
    interface Annotations {
      readonly ontologyMetadata?: OntologyMetadataAnnotationPayload | undefined;
    }
  }
}

export const isOntologyClassMetadata = S.is(OntologyClassMetadata);
export const isOntologyPredicateMetadata = S.is(OntologyPredicateMetadata);
export const isOntologyClassAnnotationDraft = S.is(OntologyClassAnnotationDraft);
export const isOntologyPredicateAnnotationDraft = S.is(OntologyPredicateAnnotationDraft);
export const isOntologyReference = S.is(OntologyReference);

const decodeOntologyDefinitionMetadataResult = S.decodeUnknownResult(OntologyDefinitionMetadata);
const decodeOntologyClassMetadataResult = S.decodeUnknownResult(OntologyClassMetadata);
const decodeOntologyDatatypePredicateMetadataResult = S.decodeUnknownResult(OntologyDatatypePredicateMetadata);
const decodeOntologyObjectPredicateMetadataResult = S.decodeUnknownResult(OntologyObjectPredicateMetadata);

export const makeIri = (value: string): IRI => pipe(decodeIriResult(value), Result.getOrThrowWith(schemaIssueToError));

export const makeOntologyTermName = (value: string): OntologyTermName =>
  pipe(decodeOntologyTermNameResult(value), Result.getOrThrowWith(schemaIssueToError));

export const makeTermIri = (baseIri: IRI, termName: OntologyTermName): IRI => {
  const separator = pipe(baseIri, Str.endsWith("#")) ? "" : "#";
  return makeIri(`${baseIri}${separator}${termName}`);
};

export const makeOntologyReference = (iri: IRI): OntologyReference => OntologyReference.make({ iri });

export const RDFS_SUB_CLASS_OF = makeIri(`${RDFS_NAMESPACE}subClassOf`);
export const RDFS_SEE_ALSO = makeIri(`${RDFS_NAMESPACE}seeAlso`);
export const RDFS_IS_DEFINED_BY = makeIri(`${RDFS_NAMESPACE}isDefinedBy`);
export const OWL_THING = makeIri(`${OWL_NAMESPACE}Thing`);
export const OWL_EQUIVALENT_CLASS = makeIri(`${OWL_NAMESPACE}equivalentClass`);
export const OWL_SAME_AS = makeIri(`${OWL_NAMESPACE}sameAs`);
export const SKOS_NAMESPACE = "http://www.w3.org/2004/02/skos/core#";
export const SKOS_ALT_LABEL = makeIri(`${SKOS_NAMESPACE}altLabel`);
export const SKOS_DEFINITION = makeIri(`${SKOS_NAMESPACE}definition`);
export const SKOS_EXACT_MATCH = makeIri(`${SKOS_NAMESPACE}exactMatch`);
export const SKOS_CLOSE_MATCH = makeIri(`${SKOS_NAMESPACE}closeMatch`);
export const DCTERMS_NAMESPACE = "http://purl.org/dc/terms/";
export const DCTERMS_SOURCE = makeIri(`${DCTERMS_NAMESPACE}source`);

export const RDF_PREFIX_IRI = makeIri(RDF_NAMESPACE);
export const RDFS_PREFIX_IRI = makeIri(RDFS_NAMESPACE);
export const OWL_PREFIX_IRI = makeIri(OWL_NAMESPACE);
export const XSD_PREFIX_IRI = makeIri(XSD_NAMESPACE);

export const makeOntologyDefinitionMetadata = (
  metadata: typeof OntologyDefinitionMetadata.Encoded
): OntologyDefinitionMetadata =>
  pipe(decodeOntologyDefinitionMetadataResult(metadata), Result.getOrThrowWith(schemaIssueToError));

export const makeOntologyClassMetadata = (metadata: typeof OntologyClassMetadata.Encoded): OntologyClassMetadata =>
  pipe(decodeOntologyClassMetadataResult(metadata), Result.getOrThrowWith(schemaIssueToError));

export const makeOntologyDatatypePredicateMetadata = (
  metadata: typeof OntologyDatatypePredicateMetadata.Encoded
): OntologyDatatypePredicateMetadata =>
  pipe(decodeOntologyDatatypePredicateMetadataResult(metadata), Result.getOrThrowWith(schemaIssueToError));

export const makeOntologyObjectPredicateMetadata = (
  metadata: typeof OntologyObjectPredicateMetadata.Encoded
): OntologyObjectPredicateMetadata =>
  pipe(decodeOntologyObjectPredicateMetadataResult(metadata), Result.getOrThrowWith(schemaIssueToError));

export const getOntologyMetadata = (schema: S.Top): OntologyMetadataAnnotationPayload | undefined =>
  S.resolveAnnotations(schema)?.ontologyMetadata;

export const getOntologyKeyMetadata = (schema: S.Top): OntologyMetadataAnnotationPayload | undefined =>
  S.resolveAnnotationsKey(schema)?.ontologyMetadata;

/**
 * Assembly failure reason for the scratch ontology collector.
 */
export const OntologyAssemblyErrorReason = LiteralKit([
  "missingClassMetadata",
  "invalidClassMetadata",
  "unsupportedClassAst",
  "unsupportedFieldName",
  "missingPredicateMetadata",
  "invalidPredicateMetadata",
  "unresolvedReferenceTarget",
]).pipe(
  $BuilderId.annoteSchema("OntologyAssemblyErrorReason", {
    description: "Assembly failure reason for the scratch ontology collector.",
  })
);

export type OntologyAssemblyErrorReason = typeof OntologyAssemblyErrorReason.Type;

/**
 * Typed assembly failure for the scratch ontology collector.
 */
export class OntologyAssemblyError extends TaggedErrorClass<OntologyAssemblyError>($BuilderId`OntologyAssemblyError`)(
  "OntologyAssemblyError",
  {
    reason: OntologyAssemblyErrorReason,
    message: S.NonEmptyString,
    schemaIdentifier: S.OptionFromOptionalKey(S.NonEmptyString),
    fieldName: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $BuilderId.annote("OntologyAssemblyError", {
    description: "Typed assembly failure for the scratch ontology collector.",
  })
) {}

/**
 * Assembled datatype predicate with its owning class domain attached.
 */
export class AssembledDatatypePredicate extends S.Class<AssembledDatatypePredicate>($BuilderId`AssembledDatatypePredicate`)(
  {
    kind: S.tag("datatypePredicate"),
    schemaIdentity: S.NonEmptyString,
    fieldName: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    domainClassIri: IRI,
    rangeDatatypeIri: IRI,
  },
  $BuilderId.annote("AssembledDatatypePredicate", {
    description: "Assembled datatype predicate with its owning class domain attached.",
  })
) {}

/**
 * Assembled object predicate with its owning class domain attached.
 */
export class AssembledObjectPredicate extends S.Class<AssembledObjectPredicate>($BuilderId`AssembledObjectPredicate`)(
  {
    kind: S.tag("objectPredicate"),
    schemaIdentity: S.NonEmptyString,
    fieldName: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    domainClassIri: IRI,
    rangeClassIri: IRI,
  },
  $BuilderId.annote("AssembledObjectPredicate", {
    description: "Assembled object predicate with its owning class domain attached.",
  })
) {}

export const AssembledOntologyPredicate = S.Union([AssembledDatatypePredicate, AssembledObjectPredicate]).pipe(
  $BuilderId.annoteSchema("AssembledOntologyPredicate", {
    description: "Assembled ontology predicate union.",
  })
);

export type AssembledOntologyPredicate = typeof AssembledOntologyPredicate.Type;

/**
 * Assembled ontology class with collected field predicates.
 */
export class AssembledOntologyClass extends S.Class<AssembledOntologyClass>($BuilderId`AssembledOntologyClass`)(
  {
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    altLabels: S.Array(S.NonEmptyString),
    definition: S.OptionFromOptionalKey(S.NonEmptyString),
    deprecated: S.Boolean,
    source: S.OptionFromOptionalKey(IRI),
    parents: S.Array(OntologyReference),
    children: S.Array(OntologyReference),
    seeAlso: S.Array(OntologyReference),
    isDefinedBy: S.Array(OntologyReference),
    equivalentClasses: S.Array(OntologyReference),
    exactMatches: S.Array(OntologyReference),
    closeMatches: S.Array(OntologyReference),
    sameAs: S.Array(OntologyReference),
    predicates: S.Array(AssembledOntologyPredicate),
  },
  $BuilderId.annote("AssembledOntologyClass", {
    description: "Assembled ontology class with collected field predicates.",
  })
) {}

/**
 * Normalized schema-backed ontology assembled from annotated Effect schemas.
 */
export class AssembledOntology extends S.Class<AssembledOntology>($BuilderId`AssembledOntology`)(
  {
    metadata: OntologyDefinitionMetadata,
    classes: S.NonEmptyArray(AssembledOntologyClass),
  },
  $BuilderId.annote("AssembledOntology", {
    description: "Normalized schema-backed ontology assembled from annotated Effect schemas.",
  })
) {}

/**
 * JSON-LD term binding emitted by the scratch projection.
 */
export class JsonLdTermBinding extends S.Class<JsonLdTermBinding>($BuilderId`JsonLdTermBinding`)(
  {
    "@id": IRI,
    "@type": S.OptionFromOptionalKey(S.Union([IRI, S.Literal("@id")])),
  },
  $BuilderId.annote("JsonLdTermBinding", {
    description: "JSON-LD term binding emitted by the scratch projection.",
  })
) {}

/**
 * JSON-LD reverse term binding emitted by the scratch projection.
 */
export class JsonLdReverseTermBinding extends S.Class<JsonLdReverseTermBinding>($BuilderId`JsonLdReverseTermBinding`)(
  {
    "@reverse": IRI,
    "@type": S.OptionFromOptionalKey(S.Literal("@id")),
  },
  $BuilderId.annote("JsonLdReverseTermBinding", {
    description: "JSON-LD reverse term binding emitted by the scratch projection.",
  })
) {}

export const JsonLdContextValue = S.Union([IRI, JsonLdTermBinding, JsonLdReverseTermBinding]).pipe(
  $BuilderId.annoteSchema("JsonLdContextValue", {
    description: "JSON-LD context value emitted by the scratch projection.",
  })
);

export type JsonLdContextValue = typeof JsonLdContextValue.Type;

/**
 * Normalized JSON-LD context document emitted by the scratch projection.
 */
export class JsonLdContextDocument extends S.Class<JsonLdContextDocument>($BuilderId`JsonLdContextDocument`)(
  {
    "@context": S.Record(S.String, JsonLdContextValue),
  },
  $BuilderId.annote("JsonLdContextDocument", {
    description: "Normalized JSON-LD context document emitted by the scratch projection.",
  })
) {}

/**
 * JSON-LD `@id` reference used inside graph nodes.
 */
export class JsonLdIdReference extends S.Class<JsonLdIdReference>($BuilderId`JsonLdIdReference`)(
  {
    "@id": IRI,
  },
  $BuilderId.annote("JsonLdIdReference", {
    description: "JSON-LD `@id` reference used inside graph nodes.",
  })
) {}

/**
 * JSON-LD class node emitted by the scratch ontology projection.
 */
export class JsonLdClassNode extends S.Class<JsonLdClassNode>($BuilderId`JsonLdClassNode`)(
  {
    "@id": IRI,
    "@type": S.Literal("rdfs:Class"),
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    "rdfs:label": S.NonEmptyString,
    "rdfs:comment": S.OptionFromOptionalKey(S.NonEmptyString),
    "skos:altLabel": S.Array(S.NonEmptyString),
    "skos:definition": S.OptionFromOptionalKey(S.NonEmptyString),
    "owl:deprecated": S.Boolean,
    "dcterms:source": S.OptionFromOptionalKey(IRI),
    "rdfs:subClassOf": S.Array(JsonLdIdReference),
    children: S.Array(JsonLdIdReference),
    "rdfs:seeAlso": S.Array(JsonLdIdReference),
    "rdfs:isDefinedBy": S.Array(JsonLdIdReference),
    "owl:equivalentClass": S.Array(JsonLdIdReference),
    "skos:exactMatch": S.Array(JsonLdIdReference),
    "skos:closeMatch": S.Array(JsonLdIdReference),
    "owl:sameAs": S.Array(JsonLdIdReference),
  },
  $BuilderId.annote("JsonLdClassNode", {
    description: "JSON-LD class node emitted by the scratch ontology projection.",
  })
) {}

/**
 * JSON-LD predicate node emitted by the scratch ontology projection.
 */
export class JsonLdPredicateNode extends S.Class<JsonLdPredicateNode>($BuilderId`JsonLdPredicateNode`)(
  {
    "@id": IRI,
    "@type": S.Union([S.Literal("owl:DatatypeProperty"), S.Literal("owl:ObjectProperty")]),
    kind: S.Union([S.Literal("datatypePredicate"), S.Literal("objectPredicate")]),
    schemaIdentity: S.NonEmptyString,
    fieldName: S.NonEmptyString,
    termName: OntologyTermName,
    "rdfs:label": S.NonEmptyString,
    "rdfs:comment": S.OptionFromOptionalKey(S.NonEmptyString),
    "rdfs:domain": JsonLdIdReference,
    "rdfs:range": JsonLdIdReference,
  },
  $BuilderId.annote("JsonLdPredicateNode", {
    description: "JSON-LD predicate node emitted by the scratch ontology projection.",
  })
) {}

export const JsonLdGraphNode = S.Union([JsonLdClassNode, JsonLdPredicateNode]).pipe(
  $BuilderId.annoteSchema("JsonLdGraphNode", {
    description: "JSON-LD graph node emitted by the scratch ontology projection.",
  })
);

export type JsonLdGraphNode = typeof JsonLdGraphNode.Type;

/**
 * JSON-LD ontology document emitted by the scratch projection.
 */
export class JsonLdOntologyDocument extends S.Class<JsonLdOntologyDocument>($BuilderId`JsonLdOntologyDocument`)(
  {
    "@context": S.Record(S.String, JsonLdContextValue),
    "@id": IRI,
    schemaIdentity: S.NonEmptyString,
    preferredPrefix: S.NonEmptyString,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    "@graph": S.Array(JsonLdGraphNode),
  },
  $BuilderId.annote("JsonLdOntologyDocument", {
    description: "JSON-LD ontology document emitted by the scratch projection.",
  })
) {}

export const isJsonLdClassNode = S.is(JsonLdClassNode);
export const isJsonLdPredicateNode = S.is(JsonLdPredicateNode);
export const decodeJsonLdOntologyDocumentResult = S.decodeUnknownResult(JsonLdOntologyDocument);

export const SupportedDatatypeRanges = [XSD_STRING, XSD_BOOLEAN, XSD_INTEGER, XSD_DOUBLE];
