import { $OntologyId } from "@beep/identity/packages";
import { IRI } from "@beep/rdf/Iri";
import { OWL_NAMESPACE } from "@beep/rdf/Vocab/Owl";
import { RDF_NAMESPACE } from "@beep/rdf/Vocab/Rdf";
import { RDFS_NAMESPACE } from "@beep/rdf/Vocab/Rdfs";
import { XSD_ANY_URI, XSD_BOOLEAN, XSD_DOUBLE, XSD_INTEGER, XSD_NAMESPACE, XSD_STRING } from "@beep/rdf/Vocab/Xsd";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import { pipe, Result } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// cspell:words SKOS DCTERMS skos dcterms

export { IRI } from "@beep/rdf/Iri";

const $I = $OntologyId.create("model");

const decodeIriResult = S.decodeUnknownResult(IRI);

export const schemaIssueToError = (cause: S.SchemaError | S.SchemaError["issue"]): S.SchemaError =>
  cause instanceof S.SchemaError ? cause : new S.SchemaError(cause);

export const OntologyTermName = S.NonEmptyString.check(
  S.isPattern(/^[A-Za-z][A-Za-z0-9._-]*$/, {
    identifier: $I`OntologyTermNamePatternCheck`,
    title: "Ontology Term Name Pattern",
    description: "A local ontology term name that can safely become an IRI fragment.",
    message: "Ontology term names must start with a letter and then use letters, digits, dot, underscore, or hyphen",
  })
).pipe(
  S.brand("OntologyTermName"),
  $I.annoteSchema("OntologyTermName", {
    description: "A local ontology term name that can safely become an IRI fragment.",
  })
);
export type OntologyTermName = typeof OntologyTermName.Type;

const decodeOntologyTermNameResult = S.decodeUnknownResult(OntologyTermName);

export const OntologyMetadataKind = LiteralKit(["ontology", "class", "datatypePredicate", "objectPredicate"]).pipe(
  $I.annoteSchema("OntologyMetadataKind", {
    description: "Closed metadata kind domain for schema-backed ontology metadata.",
  })
);
export type OntologyMetadataKind = typeof OntologyMetadataKind.Type;

export class OntologyDefinitionMetadata extends S.Class<OntologyDefinitionMetadata>($I`OntologyDefinitionMetadata`)(
  {
    kind: S.tag("ontology"),
    schemaIdentity: S.NonEmptyString,
    baseIri: IRI,
    preferredPrefix: S.NonEmptyString,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $I.annote("OntologyDefinitionMetadata", {
    description: "Ontology-level metadata for an assembled schema-backed ontology.",
  })
) {}

export class OntologyReference extends S.Class<OntologyReference>($I`OntologyReference`)(
  {
    iri: IRI,
  },
  $I.annote("OntologyReference", {
    description: "Normalized IRI reference used by assembled ontology metadata.",
  })
) {}

export class OntologyIriReferenceTarget extends S.Class<OntologyIriReferenceTarget>($I`OntologyIriReferenceTarget`)(
  {
    kind: S.tag("iri"),
    iri: IRI,
  },
  $I.annote("OntologyIriReferenceTarget", {
    description: "Deferred IRI reference target stored in class annotations.",
  })
) {}

export class OntologyTermReferenceTarget extends S.Class<OntologyTermReferenceTarget>($I`OntologyTermReferenceTarget`)(
  {
    kind: S.tag("term"),
    termName: OntologyTermName,
  },
  $I.annote("OntologyTermReferenceTarget", {
    description: "Deferred local-term reference target stored in class annotations.",
  })
) {}

export class OntologySchemaReferenceTarget extends S.Class<OntologySchemaReferenceTarget>(
  $I`OntologySchemaReferenceTarget`
)(
  {
    kind: S.tag("schema"),
    schemaIdentity: S.OptionFromOptionalKey(S.NonEmptyString),
    identifier: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $I.annote("OntologySchemaReferenceTarget", {
    description: "Deferred schema reference target resolved during ontology assembly.",
  })
) {}

export const OntologyReferenceTarget = S.Union([
  OntologyIriReferenceTarget,
  OntologyTermReferenceTarget,
  OntologySchemaReferenceTarget,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("OntologyReferenceTarget", {
    description: "Deferred ontology relationship reference target.",
  })
);
export type OntologyReferenceTarget = typeof OntologyReferenceTarget.Type;

export class OntologyClassMetadata extends S.Class<OntologyClassMetadata>($I`OntologyClassMetadata`)(
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
  $I.annote("OntologyClassMetadata", {
    description: "Final class metadata attached to an assembled ontology class.",
  })
) {}

export class OntologyDatatypePredicateMetadata extends S.Class<OntologyDatatypePredicateMetadata>(
  $I`OntologyDatatypePredicateMetadata`
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
  $I.annote("OntologyDatatypePredicateMetadata", {
    description: "Final datatype predicate metadata attached to an Effect Schema key.",
  })
) {}

export class OntologyObjectPredicateMetadata extends S.Class<OntologyObjectPredicateMetadata>(
  $I`OntologyObjectPredicateMetadata`
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
  $I.annote("OntologyObjectPredicateMetadata", {
    description: "Final object predicate metadata attached to an Effect Schema key.",
  })
) {}

export const OntologyPredicateMetadata = S.Union([
  OntologyDatatypePredicateMetadata,
  OntologyObjectPredicateMetadata,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("OntologyPredicateMetadata", {
    description: "Final predicate metadata attached to Effect Schema field keys.",
  })
);
export type OntologyPredicateMetadata = typeof OntologyPredicateMetadata.Type;

export class OntologyClassAnnotationDraft extends S.Class<OntologyClassAnnotationDraft>(
  $I`OntologyClassAnnotationDraft`
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
  $I.annote("OntologyClassAnnotationDraft", {
    description: "Class authoring metadata draft stored directly in schema annotations.",
  })
) {}

export class OntologyDatatypePredicateAnnotationDraft extends S.Class<OntologyDatatypePredicateAnnotationDraft>(
  $I`OntologyDatatypePredicateAnnotationDraft`
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
  $I.annote("OntologyDatatypePredicateAnnotationDraft", {
    description: "Datatype predicate authoring metadata draft stored in key annotations.",
  })
) {}

export class OntologyObjectPredicateAnnotationDraft extends S.Class<OntologyObjectPredicateAnnotationDraft>(
  $I`OntologyObjectPredicateAnnotationDraft`
)(
  {
    kind: S.tag("objectPredicateDraft"),
    termName: S.OptionFromOptionalKey(OntologyTermName),
    iri: S.OptionFromOptionalKey(IRI),
    label: S.OptionFromOptionalKey(S.NonEmptyString),
    description: S.OptionFromOptionalKey(S.NonEmptyString),
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeClass: OntologyReferenceTarget,
  },
  $I.annote("OntologyObjectPredicateAnnotationDraft", {
    description: "Object predicate authoring metadata draft stored in key annotations.",
  })
) {}

export const OntologyPredicateAnnotationDraft = S.Union([
  OntologyDatatypePredicateAnnotationDraft,
  OntologyObjectPredicateAnnotationDraft,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("OntologyPredicateAnnotationDraft", {
    description: "Predicate authoring metadata draft stored in key annotations.",
  })
);
export type OntologyPredicateAnnotationDraft = typeof OntologyPredicateAnnotationDraft.Type;

type OntologyMetadataAnnotationValue =
  | OntologyClassAnnotationDraft
  | OntologyDatatypePredicateAnnotationDraft
  | OntologyObjectPredicateAnnotationDraft
  | OntologyClassMetadata
  | OntologyDatatypePredicateMetadata
  | OntologyObjectPredicateMetadata;

export const OntologyMetadataAnnotationPayload = S.Union([
  OntologyClassAnnotationDraft,
  OntologyDatatypePredicateAnnotationDraft,
  OntologyObjectPredicateAnnotationDraft,
  OntologyClassMetadata,
  OntologyDatatypePredicateMetadata,
  OntologyObjectPredicateMetadata,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("OntologyMetadataAnnotationPayload", {
    description: "Tagged ontology metadata payload stored in Effect Schema annotations.",
  })
);
export type OntologyMetadataAnnotationPayload = typeof OntologyMetadataAnnotationPayload.Type;

declare module "effect/Schema" {
  namespace Annotations {
    interface Annotations {
      readonly ontologyMetadata?: OntologyMetadataAnnotationValue | undefined;
    }
  }
}

export const isOntologyClassMetadata = S.is(OntologyClassMetadata);
export const isOntologyPredicateMetadata = S.is(OntologyPredicateMetadata);
export const isOntologyClassAnnotationDraft = S.is(OntologyClassAnnotationDraft);
export const isOntologyPredicateAnnotationDraft = S.is(OntologyPredicateAnnotationDraft);
export const isOntologyReference = S.is(OntologyReference);
export const isOntologyReferenceTarget = S.is(OntologyReferenceTarget);

const decodeOntologyDefinitionMetadataResult = S.decodeUnknownResult(OntologyDefinitionMetadata);
const decodeOntologyClassMetadataResult = S.decodeUnknownResult(OntologyClassMetadata);
const decodeOntologyDatatypePredicateMetadataResult = S.decodeUnknownResult(OntologyDatatypePredicateMetadata);
const decodeOntologyObjectPredicateMetadataResult = S.decodeUnknownResult(OntologyObjectPredicateMetadata);

export const makeIri = (value: string): IRI => pipe(decodeIriResult(value), Result.getOrThrowWith(schemaIssueToError));

export const makeOntologyTermName = (value: string): OntologyTermName =>
  pipe(decodeOntologyTermNameResult(value), Result.getOrThrowWith(schemaIssueToError));

export const makeTermIri: {
  (termName: OntologyTermName): (baseIri: IRI) => IRI;
  (baseIri: IRI, termName: OntologyTermName): IRI;
} = dual(2, (baseIri: IRI, termName: OntologyTermName): IRI => {
  const separator = pipe(baseIri, Str.endsWith("#")) ? "" : "#";
  return makeIri(`${baseIri}${separator}${termName}`);
});

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

/**
 * Reads ontology metadata from an Effect Schema annotation display map.
 *
 * @category utilities
 * @since 0.0.0
 */
export const getOntologyMetadata = (schema: S.Top): OntologyMetadataAnnotationPayload | undefined =>
  S.resolveAnnotations(schema)?.ontologyMetadata;

/**
 * Reads ontology metadata from a schema property-key annotation display map.
 *
 * @category utilities
 * @since 0.0.0
 */
export const getOntologyKeyMetadata = (schema: S.Top): OntologyMetadataAnnotationPayload | undefined =>
  S.resolveAnnotationsKey(schema)?.ontologyMetadata;

export const OntologyAssemblyErrorReason = LiteralKit([
  "missingClassMetadata",
  "invalidClassMetadata",
  "unsupportedClassAst",
  "unsupportedFieldName",
  "missingPredicateMetadata",
  "invalidPredicateMetadata",
  "unresolvedReferenceTarget",
]).pipe(
  $I.annoteSchema("OntologyAssemblyErrorReason", {
    description: "Assembly failure reason for the ontology collector.",
  })
);
export type OntologyAssemblyErrorReason = typeof OntologyAssemblyErrorReason.Type;

export class OntologyAssemblyError extends TaggedErrorClass<OntologyAssemblyError>($I`OntologyAssemblyError`)(
  "OntologyAssemblyError",
  {
    reason: OntologyAssemblyErrorReason,
    message: S.NonEmptyString,
    schemaIdentifier: S.OptionFromOptionalKey(S.NonEmptyString),
    fieldName: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $I.annote("OntologyAssemblyError", {
    description: "Typed assembly failure for the schema-backed ontology collector.",
  })
) {}

export class AssembledDatatypePredicate extends S.Class<AssembledDatatypePredicate>($I`AssembledDatatypePredicate`)(
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
  $I.annote("AssembledDatatypePredicate", {
    description: "Assembled datatype predicate with its owning class domain attached.",
  })
) {}

export class AssembledObjectPredicate extends S.Class<AssembledObjectPredicate>($I`AssembledObjectPredicate`)(
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
  $I.annote("AssembledObjectPredicate", {
    description: "Assembled object predicate with its owning class domain attached.",
  })
) {}

export const AssembledOntologyPredicate = S.Union([AssembledDatatypePredicate, AssembledObjectPredicate]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("AssembledOntologyPredicate", {
    description: "Assembled ontology predicate union.",
  })
);
export type AssembledOntologyPredicate = typeof AssembledOntologyPredicate.Type;

export class AssembledOntologyClass extends S.Class<AssembledOntologyClass>($I`AssembledOntologyClass`)(
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
  $I.annote("AssembledOntologyClass", {
    description: "Assembled ontology class with collected field predicates.",
  })
) {}

export class AssembledOntology extends S.Class<AssembledOntology>($I`AssembledOntology`)(
  {
    metadata: OntologyDefinitionMetadata,
    classes: S.NonEmptyArray(AssembledOntologyClass),
  },
  $I.annote("AssembledOntology", {
    description: "Normalized schema-backed ontology assembled from annotated Effect schemas.",
  })
) {}

export class JsonLdTermBinding extends S.Class<JsonLdTermBinding>($I`JsonLdTermBinding`)(
  {
    "@id": IRI,
    "@type": S.OptionFromOptionalKey(S.Union([IRI, S.Literal("@id")])),
  },
  $I.annote("JsonLdTermBinding", {
    description: "JSON-LD term binding emitted by ontology projections.",
  })
) {}

export class JsonLdReverseTermBinding extends S.Class<JsonLdReverseTermBinding>($I`JsonLdReverseTermBinding`)(
  {
    "@reverse": IRI,
    "@type": S.OptionFromOptionalKey(S.Literal("@id")),
  },
  $I.annote("JsonLdReverseTermBinding", {
    description: "JSON-LD reverse term binding emitted by ontology projections.",
  })
) {}

export const JsonLdContextValue = S.Union([IRI, JsonLdTermBinding, JsonLdReverseTermBinding]).pipe(
  $I.annoteSchema("JsonLdContextValue", {
    description: "JSON-LD context value emitted by ontology projections.",
  })
);
export type JsonLdContextValue = typeof JsonLdContextValue.Type;

export class JsonLdContextDocument extends S.Class<JsonLdContextDocument>($I`JsonLdContextDocument`)(
  {
    "@context": S.Record(S.String, JsonLdContextValue),
  },
  $I.annote("JsonLdContextDocument", {
    description: "Normalized JSON-LD context document emitted by ontology projections.",
  })
) {}

export class JsonLdIdReference extends S.Class<JsonLdIdReference>($I`JsonLdIdReference`)(
  {
    "@id": IRI,
  },
  $I.annote("JsonLdIdReference", {
    description: "JSON-LD `@id` reference used inside graph nodes.",
  })
) {}

export class JsonLdClassNode extends S.Class<JsonLdClassNode>($I`JsonLdClassNode`)(
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
  $I.annote("JsonLdClassNode", {
    description: "JSON-LD class node emitted by ontology projections.",
  })
) {}

export class JsonLdPredicateNode extends S.Class<JsonLdPredicateNode>($I`JsonLdPredicateNode`)(
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
  $I.annote("JsonLdPredicateNode", {
    description: "JSON-LD predicate node emitted by ontology projections.",
  })
) {}

export const JsonLdGraphNode = S.Union([JsonLdClassNode, JsonLdPredicateNode]).pipe(
  $I.annoteSchema("JsonLdGraphNode", {
    description: "JSON-LD graph node emitted by ontology projections.",
  })
);
export type JsonLdGraphNode = typeof JsonLdGraphNode.Type;

export class JsonLdOntologyDocument extends S.Class<JsonLdOntologyDocument>($I`JsonLdOntologyDocument`)(
  {
    "@context": S.Record(S.String, JsonLdContextValue),
    "@id": IRI,
    schemaIdentity: S.NonEmptyString,
    preferredPrefix: S.NonEmptyString,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    "@graph": S.Array(JsonLdGraphNode),
  },
  $I.annote("JsonLdOntologyDocument", {
    description: "JSON-LD ontology document emitted by ontology projections.",
  })
) {}

export const isJsonLdClassNode = S.is(JsonLdClassNode);
export const isJsonLdPredicateNode = S.is(JsonLdPredicateNode);
export const decodeJsonLdOntologyDocumentResult = S.decodeUnknownResult(JsonLdOntologyDocument);

export const SupportedDatatypeRanges = [XSD_STRING, XSD_ANY_URI, XSD_BOOLEAN, XSD_INTEGER, XSD_DOUBLE];
