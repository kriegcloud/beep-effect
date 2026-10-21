import { $OntologyId } from "@beep/identity/packages";
import { IRI } from "@beep/rdf/Iri";
import { LanguageTag } from "@beep/rdf/Rdf";
import { URI } from "@beep/rdf/Uri";
import { OWL_NAMESPACE } from "@beep/rdf/Vocab/Owl";
import { RDF_NAMESPACE } from "@beep/rdf/Vocab/Rdf";
import { RDFS_NAMESPACE } from "@beep/rdf/Vocab/Rdfs";
import { XSD_ANY_URI, XSD_BOOLEAN, XSD_DOUBLE, XSD_INTEGER, XSD_NAMESPACE, XSD_STRING } from "@beep/rdf/Vocab/Xsd";
import { LiteralKit } from "@beep/schema/LiteralKit";
import { TaggedErrorClass } from "@beep/schema/TaggedErrorClass";
import { dual, pipe } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// cspell:words SKOS DCTERMS skos dcterms

export { IRI } from "@beep/rdf/Iri";
export { URI } from "@beep/rdf/Uri";
export {
  SKOS_ALT_LABEL,
  SKOS_BROAD_MATCH,
  SKOS_BROADER,
  SKOS_CLOSE_MATCH,
  SKOS_CONCEPT,
  SKOS_CONCEPT_SCHEME,
  SKOS_DEFINITION,
  SKOS_EDITORIAL_NOTE,
  SKOS_EXACT_MATCH,
  SKOS_HAS_TOP_CONCEPT,
  SKOS_HIDDEN_LABEL,
  SKOS_HISTORY_NOTE,
  SKOS_IN_SCHEME,
  SKOS_NAMESPACE,
  SKOS_NARROW_MATCH,
  SKOS_NARROWER,
  SKOS_PREF_LABEL,
  SKOS_RELATED,
  SKOS_RELATED_MATCH,
  SKOS_SCOPE_NOTE,
  SKOS_TOP_CONCEPT_OF,
} from "@beep/rdf/Vocab/Skos";

const $I = $OntologyId.create("model");

const decodeIriResult = S.decodeUnknownResult(IRI);
const decodeUriResult = S.decodeUnknownResult(URI);

export const schemaIssueToError = (cause: S.SchemaError | S.SchemaError["issue"]): S.SchemaError => {
  /* istanbul ignore else -- public schema decoders surface SchemaError instances in this package */
  if (cause instanceof S.SchemaError) {
    return cause;
  }

  /* istanbul ignore next -- public schema decoders surface SchemaError instances in this package */
  return new S.SchemaError(cause);
};

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

export class OntologyDefinitionMetadata extends S.Opaque<
  OntologyDefinitionMetadata,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("ontology"),
    schemaIdentity: S.NonEmptyString,
    baseIri: IRI,
    preferredPrefix: S.NonEmptyString,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("OntologyDefinitionMetadata", {
      description: "Ontology-level metadata for an assembled schema-backed ontology.",
    })
  )
) {}

export class OntologyReference extends S.Opaque<OntologyReference, { readonly brand: unique symbol }>()(
  S.Struct({
    iri: IRI,
  }).pipe(
    $I.annoteSchema("OntologyReference", {
      description: "Normalized IRI reference used by assembled ontology metadata.",
    })
  )
) {}

export class OntologyLanguageLiteral extends S.Opaque<OntologyLanguageLiteral, { readonly brand: unique symbol }>()(
  S.Struct({
    value: S.NonEmptyString,
    language: S.OptionFromOptionalKey(LanguageTag),
  }).pipe(
    $I.annoteSchema("OntologyLanguageLiteral", {
      description: "Language-aware literal used for SKOS labels and notes.",
    })
  )
) {}

export const OntologyProvenanceVerificationStatus = LiteralKit([
  "unverified",
  "machine-extracted",
  "human-reviewed",
  "verified",
]).pipe(
  $I.annoteSchema("OntologyProvenanceVerificationStatus", {
    description: "Review and verification state for optional ontology provenance metadata.",
  })
);
export type OntologyProvenanceVerificationStatus = typeof OntologyProvenanceVerificationStatus.Type;

export class OntologyProvenanceMetadata extends S.Opaque<
  OntologyProvenanceMetadata,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    sourceIri: S.OptionFromOptionalKey(IRI),
    sourceUri: S.OptionFromOptionalKey(URI),
    sourceLabel: S.OptionFromOptionalKey(S.NonEmptyString),
    sourceCitation: S.OptionFromOptionalKey(S.NonEmptyString),
    sourceSpan: S.OptionFromOptionalKey(S.NonEmptyString),
    sourceSelector: S.OptionFromOptionalKey(S.NonEmptyString),
    extractionMethod: S.OptionFromOptionalKey(S.NonEmptyString),
    verificationStatus: S.OptionFromOptionalKey(OntologyProvenanceVerificationStatus),
    updatedAt: S.OptionFromOptionalKey(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("OntologyProvenanceMetadata", {
      description: "Optional domain-agnostic source and curation metadata for ontology classes.",
    })
  )
) {}

export class OntologyIriReferenceTarget extends S.Opaque<
  OntologyIriReferenceTarget,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("iri"),
    iri: IRI,
  }).pipe(
    $I.annoteSchema("OntologyIriReferenceTarget", {
      description: "Deferred IRI reference target stored in class annotations.",
    })
  )
) {}

export class OntologyTermReferenceTarget extends S.Opaque<
  OntologyTermReferenceTarget,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("term"),
    termName: OntologyTermName,
  }).pipe(
    $I.annoteSchema("OntologyTermReferenceTarget", {
      description: "Deferred local-term reference target stored in class annotations.",
    })
  )
) {}

export class OntologySchemaReferenceTarget extends S.Opaque<
  OntologySchemaReferenceTarget,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("schema"),
    schemaIdentity: S.OptionFromOptionalKey(S.NonEmptyString),
    identifier: S.OptionFromOptionalKey(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("OntologySchemaReferenceTarget", {
      description: "Deferred schema reference target resolved during ontology assembly.",
    })
  )
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

export class OntologySkosConceptProfile extends S.Opaque<
  OntologySkosConceptProfile,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("concept"),
    prefLabels: S.Array(OntologyLanguageLiteral),
    altLabels: S.Array(OntologyLanguageLiteral),
    hiddenLabels: S.Array(OntologyLanguageLiteral),
    definitions: S.Array(OntologyLanguageLiteral),
    scopeNotes: S.Array(OntologyLanguageLiteral),
    editorialNotes: S.Array(OntologyLanguageLiteral),
    historyNotes: S.Array(OntologyLanguageLiteral),
    broader: S.Array(OntologyReference),
    narrower: S.Array(OntologyReference),
    related: S.Array(OntologyReference),
    exactMatches: S.Array(OntologyReference),
    closeMatches: S.Array(OntologyReference),
    broadMatches: S.Array(OntologyReference),
    narrowMatches: S.Array(OntologyReference),
    relatedMatches: S.Array(OntologyReference),
    inSchemes: S.Array(OntologyReference),
    topConceptOf: S.Array(OntologyReference),
  }).pipe(
    $I.annoteSchema("OntologySkosConceptProfile", {
      description: "Opt-in SKOS concept profile metadata for an assembled ontology class.",
    })
  )
) {}

export class OntologySkosConceptSchemeProfile extends S.Opaque<
  OntologySkosConceptSchemeProfile,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("conceptScheme"),
    prefLabels: S.Array(OntologyLanguageLiteral),
    altLabels: S.Array(OntologyLanguageLiteral),
    hiddenLabels: S.Array(OntologyLanguageLiteral),
    definitions: S.Array(OntologyLanguageLiteral),
    scopeNotes: S.Array(OntologyLanguageLiteral),
    editorialNotes: S.Array(OntologyLanguageLiteral),
    historyNotes: S.Array(OntologyLanguageLiteral),
    hasTopConcepts: S.Array(OntologyReference),
  }).pipe(
    $I.annoteSchema("OntologySkosConceptSchemeProfile", {
      description: "Opt-in SKOS concept scheme profile metadata for an assembled ontology class.",
    })
  )
) {}

export const OntologySkosProfile = S.Union([OntologySkosConceptProfile, OntologySkosConceptSchemeProfile]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("OntologySkosProfile", {
    description: "Opt-in SKOS concept or concept-scheme profile metadata.",
  })
);
export type OntologySkosProfile = typeof OntologySkosProfile.Type;

export class OntologySkosConceptProfileDraft extends S.Opaque<
  OntologySkosConceptProfileDraft,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("concept"),
    prefLabels: S.Array(OntologyLanguageLiteral),
    altLabels: S.Array(OntologyLanguageLiteral),
    hiddenLabels: S.Array(OntologyLanguageLiteral),
    definitions: S.Array(OntologyLanguageLiteral),
    scopeNotes: S.Array(OntologyLanguageLiteral),
    editorialNotes: S.Array(OntologyLanguageLiteral),
    historyNotes: S.Array(OntologyLanguageLiteral),
    broader: S.Array(OntologyReferenceTarget),
    narrower: S.Array(OntologyReferenceTarget),
    related: S.Array(OntologyReferenceTarget),
    exactMatches: S.Array(OntologyReferenceTarget),
    closeMatches: S.Array(OntologyReferenceTarget),
    broadMatches: S.Array(OntologyReferenceTarget),
    narrowMatches: S.Array(OntologyReferenceTarget),
    relatedMatches: S.Array(OntologyReferenceTarget),
    inSchemes: S.Array(OntologyReferenceTarget),
    topConceptOf: S.Array(OntologyReferenceTarget),
  }).pipe(
    $I.annoteSchema("OntologySkosConceptProfileDraft", {
      description: "Unresolved SKOS concept profile metadata stored in schema annotations.",
    })
  )
) {}

export class OntologySkosConceptSchemeProfileDraft extends S.Opaque<
  OntologySkosConceptSchemeProfileDraft,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("conceptScheme"),
    prefLabels: S.Array(OntologyLanguageLiteral),
    altLabels: S.Array(OntologyLanguageLiteral),
    hiddenLabels: S.Array(OntologyLanguageLiteral),
    definitions: S.Array(OntologyLanguageLiteral),
    scopeNotes: S.Array(OntologyLanguageLiteral),
    editorialNotes: S.Array(OntologyLanguageLiteral),
    historyNotes: S.Array(OntologyLanguageLiteral),
    hasTopConcepts: S.Array(OntologyReferenceTarget),
  }).pipe(
    $I.annoteSchema("OntologySkosConceptSchemeProfileDraft", {
      description: "Unresolved SKOS concept scheme profile metadata stored in schema annotations.",
    })
  )
) {}

export const OntologySkosProfileDraft = S.Union([
  OntologySkosConceptProfileDraft,
  OntologySkosConceptSchemeProfileDraft,
]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("OntologySkosProfileDraft", {
    description: "Unresolved opt-in SKOS profile metadata stored in schema annotations.",
  })
);
export type OntologySkosProfileDraft = typeof OntologySkosProfileDraft.Type;

export class OntologyJsonSchemaDocument extends S.Opaque<
  OntologyJsonSchemaDocument,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    dialect: S.tag("draft-2020-12"),
    schema: S.Record(S.String, S.Unknown),
    definitions: S.Record(S.String, S.Record(S.String, S.Unknown)),
  }).pipe(
    $I.annoteSchema("OntologyJsonSchemaDocument", {
      description: "Effect-derived Draft 2020-12 JSON Schema document attached outside RDF projections.",
    })
  )
) {}

export class OntologyJsonSchemaSidecarOptions extends S.Opaque<
  OntologyJsonSchemaSidecarOptions,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    additionalProperties: S.Boolean,
    generateDescriptions: S.Boolean,
    includedAnnotationKeys: S.Array(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("OntologyJsonSchemaSidecarOptions", {
      description: "Stable summary of the options used to derive a JSON Schema sidecar.",
    })
  )
) {}

export class OntologyJsonSchemaSidecar extends S.Opaque<OntologyJsonSchemaSidecar, { readonly brand: unique symbol }>()(
  S.Struct({
    classIri: IRI,
    schemaIdentity: S.NonEmptyString,
    document: OntologyJsonSchemaDocument,
    options: OntologyJsonSchemaSidecarOptions,
  }).pipe(
    $I.annoteSchema("OntologyJsonSchemaSidecar", {
      description: "Non-RDF JSON Schema sidecar attached to an assembled ontology class.",
    })
  )
) {}

export class OntologyClassMetadata extends S.Opaque<OntologyClassMetadata, { readonly brand: unique symbol }>()(
  S.Struct({
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
    skosProfile: S.OptionFromOptionalKey(OntologySkosProfile),
    provenance: S.OptionFromOptionalKey(OntologyProvenanceMetadata),
  }).pipe(
    $I.annoteSchema("OntologyClassMetadata", {
      description: "Final class metadata attached to an assembled ontology class.",
    })
  )
) {}

export class OntologyDatatypePredicateMetadata extends S.Opaque<
  OntologyDatatypePredicateMetadata,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("datatypePredicate"),
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeDatatypeIri: IRI,
  }).pipe(
    $I.annoteSchema("OntologyDatatypePredicateMetadata", {
      description: "Final datatype predicate metadata attached to an Effect Schema key.",
    })
  )
) {}

export class OntologyObjectPredicateMetadata extends S.Opaque<
  OntologyObjectPredicateMetadata,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("objectPredicate"),
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeClassIri: IRI,
  }).pipe(
    $I.annoteSchema("OntologyObjectPredicateMetadata", {
      description: "Final object predicate metadata attached to an Effect Schema key.",
    })
  )
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

export class OntologyClassAnnotationDraft extends S.Opaque<
  OntologyClassAnnotationDraft,
  { readonly brand: unique symbol }
>()(
  S.Struct({
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
    skosProfile: S.OptionFromOptionalKey(OntologySkosProfileDraft),
    provenance: S.OptionFromOptionalKey(OntologyProvenanceMetadata),
  }).pipe(
    $I.annoteSchema("OntologyClassAnnotationDraft", {
      description: "Class authoring metadata draft stored directly in schema annotations.",
    })
  )
) {}

export class OntologyDatatypePredicateAnnotationDraft extends S.Opaque<
  OntologyDatatypePredicateAnnotationDraft,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("datatypePredicateDraft"),
    termName: S.OptionFromOptionalKey(OntologyTermName),
    iri: S.OptionFromOptionalKey(IRI),
    label: S.OptionFromOptionalKey(S.NonEmptyString),
    description: S.OptionFromOptionalKey(S.NonEmptyString),
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeDatatypeIri: IRI,
  }).pipe(
    $I.annoteSchema("OntologyDatatypePredicateAnnotationDraft", {
      description: "Datatype predicate authoring metadata draft stored in key annotations.",
    })
  )
) {}

export class OntologyObjectPredicateAnnotationDraft extends S.Opaque<
  OntologyObjectPredicateAnnotationDraft,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("objectPredicateDraft"),
    termName: S.OptionFromOptionalKey(OntologyTermName),
    iri: S.OptionFromOptionalKey(IRI),
    label: S.OptionFromOptionalKey(S.NonEmptyString),
    description: S.OptionFromOptionalKey(S.NonEmptyString),
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    rangeClass: OntologyReferenceTarget,
  }).pipe(
    $I.annoteSchema("OntologyObjectPredicateAnnotationDraft", {
      description: "Object predicate authoring metadata draft stored in key annotations.",
    })
  )
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

export const makeUri = (value: string): URI => pipe(decodeUriResult(value), Result.getOrThrowWith(schemaIssueToError));

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
  "invalidSkosProfile",
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

export const OntologyValidationIssueSeverity = LiteralKit(["error", "warning"]).pipe(
  $I.annoteSchema("OntologyValidationIssueSeverity", {
    description: "Severity for ontology profile validation findings.",
  })
);
export type OntologyValidationIssueSeverity = typeof OntologyValidationIssueSeverity.Type;

export const OntologyValidationIssueCode = LiteralKit([
  "duplicatePrefLabel",
  "conflictingLabelLiteral",
  "hierarchyCycle",
  "relatedDuplicatesHierarchy",
  "missingSkosPrefLabel",
  "missingConceptScheme",
]).pipe(
  $I.annoteSchema("OntologyValidationIssueCode", {
    description: "Stable code for ontology SKOS profile validation findings.",
  })
);
export type OntologyValidationIssueCode = typeof OntologyValidationIssueCode.Type;

export class OntologyValidationIssue extends S.Opaque<OntologyValidationIssue, { readonly brand: unique symbol }>()(
  S.Struct({
    severity: OntologyValidationIssueSeverity,
    code: OntologyValidationIssueCode,
    message: S.NonEmptyString,
    classIri: S.OptionFromOptionalKey(IRI),
    schemaIdentity: S.OptionFromOptionalKey(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("OntologyValidationIssue", {
      description: "Profile validation issue produced while assembling an ontology.",
    })
  )
) {}

export class OntologyValidationReport extends S.Opaque<OntologyValidationReport, { readonly brand: unique symbol }>()(
  S.Struct({
    errors: S.Array(OntologyValidationIssue),
    warnings: S.Array(OntologyValidationIssue),
  }).pipe(
    $I.annoteSchema("OntologyValidationReport", {
      description: "Validation report attached to an assembled ontology.",
    })
  )
) {}

export class AssembledDatatypePredicate extends S.Opaque<
  AssembledDatatypePredicate,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    kind: S.tag("datatypePredicate"),
    schemaIdentity: S.NonEmptyString,
    fieldName: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    domainClassIri: IRI,
    rangeDatatypeIri: IRI,
  }).pipe(
    $I.annoteSchema("AssembledDatatypePredicate", {
      description: "Assembled datatype predicate with its owning class domain attached.",
    })
  )
) {}

export class AssembledObjectPredicate extends S.Opaque<AssembledObjectPredicate, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("objectPredicate"),
    schemaIdentity: S.NonEmptyString,
    fieldName: S.NonEmptyString,
    termName: OntologyTermName,
    iri: IRI,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    domainClassIri: IRI,
    rangeClassIri: IRI,
  }).pipe(
    $I.annoteSchema("AssembledObjectPredicate", {
      description: "Assembled object predicate with its owning class domain attached.",
    })
  )
) {}

export const AssembledOntologyPredicate = S.Union([AssembledDatatypePredicate, AssembledObjectPredicate]).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("AssembledOntologyPredicate", {
    description: "Assembled ontology predicate union.",
  })
);
export type AssembledOntologyPredicate = typeof AssembledOntologyPredicate.Type;

export class AssembledOntologyClass extends S.Opaque<AssembledOntologyClass, { readonly brand: unique symbol }>()(
  S.Struct({
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
    skosProfile: S.OptionFromOptionalKey(OntologySkosProfile),
    provenance: S.OptionFromOptionalKey(OntologyProvenanceMetadata),
    jsonSchemaSidecar: S.OptionFromOptionalKey(OntologyJsonSchemaSidecar),
    predicates: S.Array(AssembledOntologyPredicate),
  }).pipe(
    $I.annoteSchema("AssembledOntologyClass", {
      description: "Assembled ontology class with collected field predicates.",
    })
  )
) {}

export class AssembledOntology extends S.Opaque<AssembledOntology, { readonly brand: unique symbol }>()(
  S.Struct({
    metadata: OntologyDefinitionMetadata,
    classes: S.NonEmptyArray(AssembledOntologyClass),
    validation: OntologyValidationReport,
  }).pipe(
    $I.annoteSchema("AssembledOntology", {
      description: "Normalized schema-backed ontology assembled from annotated Effect schemas.",
    })
  )
) {}

export class JsonLdTermBinding extends S.Opaque<JsonLdTermBinding, { readonly brand: unique symbol }>()(
  S.Struct({
    "@id": IRI,
    "@type": S.OptionFromOptionalKey(S.Union([IRI, S.Literal("@id")])),
  }).pipe(
    $I.annoteSchema("JsonLdTermBinding", {
      description: "JSON-LD term binding emitted by ontology projections.",
    })
  )
) {}

export class JsonLdReverseTermBinding extends S.Opaque<JsonLdReverseTermBinding, { readonly brand: unique symbol }>()(
  S.Struct({
    "@reverse": IRI,
    "@type": S.OptionFromOptionalKey(S.Literal("@id")),
  }).pipe(
    $I.annoteSchema("JsonLdReverseTermBinding", {
      description: "JSON-LD reverse term binding emitted by ontology projections.",
    })
  )
) {}

export const JsonLdContextValue = S.Union([IRI, JsonLdTermBinding, JsonLdReverseTermBinding]).pipe(
  $I.annoteSchema("JsonLdContextValue", {
    description: "JSON-LD context value emitted by ontology projections.",
  })
);
export type JsonLdContextValue = typeof JsonLdContextValue.Type;

export class JsonLdContextDocument extends S.Opaque<JsonLdContextDocument, { readonly brand: unique symbol }>()(
  S.Struct({
    "@context": S.Record(S.String, JsonLdContextValue),
  }).pipe(
    $I.annoteSchema("JsonLdContextDocument", {
      description: "Normalized JSON-LD context document emitted by ontology projections.",
    })
  )
) {}

export class JsonLdIdReference extends S.Opaque<JsonLdIdReference, { readonly brand: unique symbol }>()(
  S.Struct({
    "@id": IRI,
  }).pipe(
    $I.annoteSchema("JsonLdIdReference", {
      description: "JSON-LD `@id` reference used inside graph nodes.",
    })
  )
) {}

export class JsonLdLanguageLiteral extends S.Opaque<JsonLdLanguageLiteral, { readonly brand: unique symbol }>()(
  S.Struct({
    "@value": S.NonEmptyString,
    "@language": S.OptionFromOptionalKey(LanguageTag),
  }).pipe(
    $I.annoteSchema("JsonLdLanguageLiteral", {
      description: "JSON-LD language literal emitted for SKOS labels and notes.",
    })
  )
) {}

export const JsonLdLabelValue = S.Union([S.NonEmptyString, JsonLdLanguageLiteral]).pipe(
  $I.annoteSchema("JsonLdLabelValue", {
    description: "JSON-LD label value that preserves legacy plain strings and multilingual SKOS literals.",
  })
);
export type JsonLdLabelValue = typeof JsonLdLabelValue.Type;

export const JsonLdClassType = S.Union([
  S.Literal("rdfs:Class"),
  S.Array(S.Union([S.Literal("rdfs:Class"), S.Literal("skos:Concept"), S.Literal("skos:ConceptScheme")])),
]).pipe(
  $I.annoteSchema("JsonLdClassType", {
    description: "JSON-LD class node type, optionally enriched with an explicit SKOS profile type.",
  })
);
export type JsonLdClassType = typeof JsonLdClassType.Type;

export const JsonLdDefinitionValue = S.Union([S.NonEmptyString, S.Array(JsonLdLabelValue)]).pipe(
  $I.annoteSchema("JsonLdDefinitionValue", {
    description: "JSON-LD SKOS definition value preserving legacy string definitions and multilingual literals.",
  })
);
export type JsonLdDefinitionValue = typeof JsonLdDefinitionValue.Type;

export class JsonLdClassNode extends S.Opaque<JsonLdClassNode, { readonly brand: unique symbol }>()(
  S.Struct({
    "@id": IRI,
    "@type": JsonLdClassType,
    schemaIdentity: S.NonEmptyString,
    termName: OntologyTermName,
    "rdfs:label": S.NonEmptyString,
    "rdfs:comment": S.OptionFromOptionalKey(S.NonEmptyString),
    "skos:prefLabel": S.Array(JsonLdLanguageLiteral),
    "skos:altLabel": S.Array(JsonLdLabelValue),
    "skos:hiddenLabel": S.Array(JsonLdLanguageLiteral),
    "skos:definition": S.OptionFromOptionalKey(JsonLdDefinitionValue),
    "skos:scopeNote": S.Array(JsonLdLanguageLiteral),
    "skos:editorialNote": S.Array(JsonLdLanguageLiteral),
    "skos:historyNote": S.Array(JsonLdLanguageLiteral),
    "skos:broader": S.Array(JsonLdIdReference),
    "skos:narrower": S.Array(JsonLdIdReference),
    "skos:related": S.Array(JsonLdIdReference),
    "skos:broadMatch": S.Array(JsonLdIdReference),
    "skos:narrowMatch": S.Array(JsonLdIdReference),
    "skos:relatedMatch": S.Array(JsonLdIdReference),
    "skos:inScheme": S.Array(JsonLdIdReference),
    "skos:topConceptOf": S.Array(JsonLdIdReference),
    "skos:hasTopConcept": S.Array(JsonLdIdReference),
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
    provenance: S.OptionFromOptionalKey(OntologyProvenanceMetadata),
  }).pipe(
    $I.annoteSchema("JsonLdClassNode", {
      description: "JSON-LD class node emitted by ontology projections.",
    })
  )
) {}

export class JsonLdPredicateNode extends S.Opaque<JsonLdPredicateNode, { readonly brand: unique symbol }>()(
  S.Struct({
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
  }).pipe(
    $I.annoteSchema("JsonLdPredicateNode", {
      description: "JSON-LD predicate node emitted by ontology projections.",
    })
  )
) {}

export const JsonLdGraphNode = S.Union([JsonLdClassNode, JsonLdPredicateNode]).pipe(
  $I.annoteSchema("JsonLdGraphNode", {
    description: "JSON-LD graph node emitted by ontology projections.",
  })
);
export type JsonLdGraphNode = typeof JsonLdGraphNode.Type;

export class JsonLdOntologyDocument extends S.Opaque<JsonLdOntologyDocument, { readonly brand: unique symbol }>()(
  S.Struct({
    "@context": S.Record(S.String, JsonLdContextValue),
    "@id": IRI,
    schemaIdentity: S.NonEmptyString,
    preferredPrefix: S.NonEmptyString,
    label: S.NonEmptyString,
    comment: S.OptionFromOptionalKey(S.NonEmptyString),
    "@graph": S.Array(JsonLdGraphNode),
  }).pipe(
    $I.annoteSchema("JsonLdOntologyDocument", {
      description: "JSON-LD ontology document emitted by ontology projections.",
    })
  )
) {}

export const isJsonLdClassNode = S.is(JsonLdClassNode);
export const isJsonLdPredicateNode = S.is(JsonLdPredicateNode);
export const decodeJsonLdOntologyDocumentResult = S.decodeUnknownResult(JsonLdOntologyDocument);

export const SupportedDatatypeRanges = [XSD_STRING, XSD_ANY_URI, XSD_BOOLEAN, XSD_INTEGER, XSD_DOUBLE];
