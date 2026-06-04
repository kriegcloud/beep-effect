import { pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import {
  AssembledDatatypePredicate,
  AssembledObjectPredicate,
  AssembledOntology,
  AssembledOntologyClass,
  type AssembledOntologyPredicate,
  DCTERMS_NAMESPACE,
  decodeJsonLdOntologyDocumentResult,
  JsonLdClassNode,
  JsonLdContextDocument,
  JsonLdIdReference,
  JsonLdOntologyDocument,
  JsonLdPredicateNode,
  JsonLdTermBinding,
  IRI,
  makeIri,
  makeOntologyDefinitionMetadata,
  makeOntologyReference,
  OntologyAssemblyError,
  OWL_PREFIX_IRI,
  RDFS_PREFIX_IRI,
  RDFS_SUB_CLASS_OF,
  schemaIssueToError,
  SKOS_NAMESPACE,
  isJsonLdClassNode,
  isJsonLdPredicateNode,
  type OntologyReference,
} from "../model.js";

const jsonLdClassBinding = (value: AssembledOntologyClass): typeof JsonLdTermBinding.Encoded => ({
  "@id": value.iri,
});

const jsonLdPredicateBinding = (value: AssembledOntologyPredicate): typeof JsonLdTermBinding.Encoded =>
  value.kind === "datatypePredicate"
    ? {
        "@id": value.iri,
        "@type": value.rangeDatatypeIri,
      }
    : {
        "@id": value.iri,
        "@type": "@id",
      };

export const projectJsonLdContext = (ontology: AssembledOntology): typeof JsonLdContextDocument.Encoded => {
  const initialTerms: Readonly<Record<string, IRI | typeof JsonLdTermBinding.Encoded>> = {
    "@vocab": ontology.metadata.baseIri,
  };

  const terms = pipe(
    ontology.classes,
    A.reduce(initialTerms, (currentTerms, ontologyClass) => {
      const withClass = R.set(currentTerms, ontologyClass.termName, jsonLdClassBinding(ontologyClass));
      return pipe(
        ontologyClass.predicates,
        A.reduce(withClass, (predicateTerms, predicate) =>
          R.set(predicateTerms, predicate.termName, jsonLdPredicateBinding(predicate))
        )
      );
    })
  );

  return { "@context": terms };
};

const jsonLdIdReference = (reference: OntologyReference): typeof JsonLdIdReference.Encoded => ({
  "@id": reference.iri,
});

const jsonLdIdReferences = (references: ReadonlyArray<OntologyReference>): ReadonlyArray<typeof JsonLdIdReference.Encoded> =>
  pipe(references, A.map(jsonLdIdReference));

const ontologyJsonLdContext = (ontology: AssembledOntology): typeof JsonLdOntologyDocument.Encoded["@context"] => ({
  ...projectJsonLdContext(ontology)["@context"],
  rdfs: RDFS_PREFIX_IRI,
  owl: OWL_PREFIX_IRI,
  skos: makeIri(SKOS_NAMESPACE),
  dcterms: makeIri(DCTERMS_NAMESPACE),
  children: {
    "@reverse": RDFS_SUB_CLASS_OF,
    "@type": "@id",
  },
});

const classToJsonLdNode = (ontologyClass: AssembledOntologyClass): typeof JsonLdClassNode.Encoded => ({
  "@id": ontologyClass.iri,
  "@type": "rdfs:Class",
  schemaIdentity: ontologyClass.schemaIdentity,
  termName: ontologyClass.termName,
  "rdfs:label": ontologyClass.label,
  "skos:altLabel": ontologyClass.altLabels,
  "owl:deprecated": ontologyClass.deprecated,
  "rdfs:subClassOf": jsonLdIdReferences(ontologyClass.parents),
  children: jsonLdIdReferences(ontologyClass.children),
  "rdfs:seeAlso": jsonLdIdReferences(ontologyClass.seeAlso),
  "rdfs:isDefinedBy": jsonLdIdReferences(ontologyClass.isDefinedBy),
  "owl:equivalentClass": jsonLdIdReferences(ontologyClass.equivalentClasses),
  "skos:exactMatch": jsonLdIdReferences(ontologyClass.exactMatches),
  "skos:closeMatch": jsonLdIdReferences(ontologyClass.closeMatches),
  "owl:sameAs": jsonLdIdReferences(ontologyClass.sameAs),
  ...R.getSomes({
    "rdfs:comment": ontologyClass.comment,
    "skos:definition": ontologyClass.definition,
    "dcterms:source": ontologyClass.source,
  }),
});

const predicateToJsonLdNode = (predicate: AssembledOntologyPredicate): typeof JsonLdPredicateNode.Encoded => ({
  "@id": predicate.iri,
  "@type": predicate.kind === "datatypePredicate" ? "owl:DatatypeProperty" : "owl:ObjectProperty",
  kind: predicate.kind,
  schemaIdentity: predicate.schemaIdentity,
  fieldName: predicate.fieldName,
  termName: predicate.termName,
  "rdfs:label": predicate.label,
  "rdfs:domain": {
    "@id": predicate.domainClassIri,
  },
  "rdfs:range": {
    "@id": predicate.kind === "datatypePredicate" ? predicate.rangeDatatypeIri : predicate.rangeClassIri,
  },
  ...R.getSomes({
    "rdfs:comment": predicate.comment,
  }),
});

export const projectJsonLdOntology = (ontology: AssembledOntology): typeof JsonLdOntologyDocument.Encoded => ({
  "@context": ontologyJsonLdContext(ontology),
  "@id": ontology.metadata.baseIri,
  schemaIdentity: ontology.metadata.schemaIdentity,
  preferredPrefix: ontology.metadata.preferredPrefix,
  label: ontology.metadata.label,
  "@graph": [
    ...pipe(ontology.classes, A.map(classToJsonLdNode)),
    ...pipe(
      ontology.classes,
      A.flatMap((ontologyClass) => A.map(ontologyClass.predicates, predicateToJsonLdNode))
    ),
  ],
  ...R.getSomes({
    comment: ontology.metadata.comment,
  }),
});

const jsonLdIdReferenceToOntologyReference = (reference: JsonLdIdReference): OntologyReference =>
  makeOntologyReference(reference["@id"]);

const jsonLdIdReferencesToOntologyReferences = (
  references: ReadonlyArray<JsonLdIdReference>
): ReadonlyArray<OntologyReference> => pipe(references, A.map(jsonLdIdReferenceToOntologyReference));

const predicateNodeToAssembledPredicate = (predicate: JsonLdPredicateNode): AssembledOntologyPredicate =>
  predicate.kind === "datatypePredicate"
    ? AssembledDatatypePredicate.make({
        kind: "datatypePredicate",
        schemaIdentity: predicate.schemaIdentity,
        fieldName: predicate.fieldName,
        termName: predicate.termName,
        iri: predicate["@id"],
        label: predicate["rdfs:label"],
        comment: predicate["rdfs:comment"],
        domainClassIri: predicate["rdfs:domain"]["@id"],
        rangeDatatypeIri: predicate["rdfs:range"]["@id"],
      })
    : AssembledObjectPredicate.make({
        kind: "objectPredicate",
        schemaIdentity: predicate.schemaIdentity,
        fieldName: predicate.fieldName,
        termName: predicate.termName,
        iri: predicate["@id"],
        label: predicate["rdfs:label"],
        comment: predicate["rdfs:comment"],
        domainClassIri: predicate["rdfs:domain"]["@id"],
        rangeClassIri: predicate["rdfs:range"]["@id"],
      });

const iriEquivalence = S.toEquivalence(IRI);

const classNodeToAssembledClass = (
  classNode: JsonLdClassNode,
  predicates: ReadonlyArray<JsonLdPredicateNode>
): AssembledOntologyClass =>
  AssembledOntologyClass.make({
    schemaIdentity: classNode.schemaIdentity,
    termName: classNode.termName,
    iri: classNode["@id"],
    label: classNode["rdfs:label"],
    comment: classNode["rdfs:comment"],
    altLabels: classNode["skos:altLabel"],
    definition: classNode["skos:definition"],
    deprecated: classNode["owl:deprecated"],
    source: classNode["dcterms:source"],
    parents: jsonLdIdReferencesToOntologyReferences(classNode["rdfs:subClassOf"]),
    children: jsonLdIdReferencesToOntologyReferences(classNode.children),
    seeAlso: jsonLdIdReferencesToOntologyReferences(classNode["rdfs:seeAlso"]),
    isDefinedBy: jsonLdIdReferencesToOntologyReferences(classNode["rdfs:isDefinedBy"]),
    equivalentClasses: jsonLdIdReferencesToOntologyReferences(classNode["owl:equivalentClass"]),
    exactMatches: jsonLdIdReferencesToOntologyReferences(classNode["skos:exactMatch"]),
    closeMatches: jsonLdIdReferencesToOntologyReferences(classNode["skos:closeMatch"]),
    sameAs: jsonLdIdReferencesToOntologyReferences(classNode["owl:sameAs"]),
    predicates: pipe(
      predicates,
      A.filter((predicate) => iriEquivalence(predicate["rdfs:domain"]["@id"], classNode["@id"])),
      A.map(predicateNodeToAssembledPredicate)
    ),
  });

const jsonLdDocumentToOntology = (document: JsonLdOntologyDocument): AssembledOntology =>
  A.match(
    pipe(
      document["@graph"],
      A.filter(isJsonLdClassNode),
      A.map((classNode) =>
        classNodeToAssembledClass(
          classNode,
          pipe(document["@graph"], A.filter(isJsonLdPredicateNode))
        )
      )
    ),
    {
      onEmpty: () =>
        Result.getOrThrowWith(
          Result.fail(
            OntologyAssemblyError.make({
              reason: "missingClassMetadata",
              message: "JSON-LD ontology document must contain at least one class node.",
              schemaIdentifier: O.some(document.schemaIdentity),
              fieldName: O.none(),
            })
          ),
          (error) => error
        ),
      onNonEmpty: (classes) =>
        AssembledOntology.make({
          metadata: makeOntologyDefinitionMetadata({
            kind: "ontology",
            schemaIdentity: document.schemaIdentity,
            baseIri: document["@id"],
            preferredPrefix: document.preferredPrefix,
            label: document.label,
            ...R.getSomes({ comment: document.comment }),
          }),
          classes,
        }),
    }
  );

export const parseJsonLdOntology = (input: unknown): AssembledOntology =>
  pipe(decodeJsonLdOntologyDocumentResult(input), Result.getOrThrowWith(schemaIssueToError), jsonLdDocumentToOntology);
