import { pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import {
  type AssembledOntologyPredicate,
  AssembledOntology,
  AssembledOntologyClass,
  DCTERMS_NAMESPACE,
  makeIri,
  makeOntologyReference,
  OWL_PREFIX_IRI,
  RDF_PREFIX_IRI,
  RDFS_PREFIX_IRI,
  SKOS_NAMESPACE,
  type IRI,
  XSD_PREFIX_IRI,
  type OntologyReference,
} from "../model.js";

const turtleIri = (iri: IRI): string => `<${iri}>`;

const turtleLiteral = (value: string): string => `"${value}"`;

const turtleComment = (comment: O.Option<string>): ReadonlyArray<string> =>
  pipe(
    comment,
    O.map((value) => [`  rdfs:comment ${turtleLiteral(value)} ;`]),
    O.getOrElse(() => A.empty<string>())
  );

const turtleLiteralStatement = (predicate: string, value: string): string => `${predicate} ${turtleLiteral(value)}`;

const turtleOptionalLiteralStatements = (predicate: string, value: O.Option<string>): ReadonlyArray<string> =>
  pipe(
    value,
    O.map((current) => [turtleLiteralStatement(predicate, current)]),
    O.getOrElse(() => A.empty<string>())
  );

const turtleReferenceStatements = (predicate: string, references: ReadonlyArray<OntologyReference>): ReadonlyArray<string> =>
  pipe(
    references,
    A.map((reference) => `${predicate} ${turtleIri(reference.iri)}`)
  );

const turtleStatementBlock = (statements: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(
    statements,
    A.matchRight({
      onEmpty: () => A.empty<string>(),
      onNonEmpty: (initial, last) => [
        ...pipe(
          initial,
          A.map((statement) => `  ${statement} ;`)
        ),
        `  ${last} .`,
      ],
    })
  );

const renderSourceStatements = (ontologyClass: AssembledOntologyClass): ReadonlyArray<string> =>
  turtleReferenceStatements(
    "dcterms:source",
    pipe(
      ontologyClass.source,
      O.map(makeOntologyReference),
      O.match({
        onNone: () => A.empty<OntologyReference>(),
        onSome: (reference) => [reference],
      })
    )
  );

const renderClass = (ontologyClass: AssembledOntologyClass): string =>
  pipe(
    [
      `${turtleIri(ontologyClass.iri)} a rdfs:Class ;`,
      ...turtleStatementBlock([
        turtleLiteralStatement("rdfs:label", ontologyClass.label),
        ...pipe(
          ontologyClass.altLabels,
          A.map((label) => turtleLiteralStatement("skos:altLabel", label))
        ),
        ...turtleOptionalLiteralStatements("skos:definition", ontologyClass.definition),
        ...turtleOptionalLiteralStatements("rdfs:comment", ontologyClass.comment),
        ...turtleReferenceStatements("rdfs:subClassOf", ontologyClass.parents),
        ...turtleReferenceStatements("rdfs:seeAlso", ontologyClass.seeAlso),
        ...turtleReferenceStatements("rdfs:isDefinedBy", ontologyClass.isDefinedBy),
        ...turtleReferenceStatements("owl:equivalentClass", ontologyClass.equivalentClasses),
        ...turtleReferenceStatements("skos:exactMatch", ontologyClass.exactMatches),
        ...turtleReferenceStatements("skos:closeMatch", ontologyClass.closeMatches),
        ...turtleReferenceStatements("owl:sameAs", ontologyClass.sameAs),
        ...renderSourceStatements(ontologyClass),
      ]),
    ],
    A.join("\n")
  );

const renderChildSubclassStatements = (ontologyClass: AssembledOntologyClass): ReadonlyArray<string> =>
  pipe(
    ontologyClass.children,
    A.map((child) => `${turtleIri(child.iri)} rdfs:subClassOf ${turtleIri(ontologyClass.iri)} .`)
  );

const renderPredicate = (predicate: AssembledOntologyPredicate): string =>
  predicate.kind === "datatypePredicate"
    ? pipe(
        [
          `${turtleIri(predicate.iri)} a rdf:Property ;`,
          `  rdfs:label ${turtleLiteral(predicate.label)} ;`,
          ...turtleComment(predicate.comment),
          `  rdfs:domain ${turtleIri(predicate.domainClassIri)} ;`,
          `  rdfs:range ${turtleIri(predicate.rangeDatatypeIri)} .`,
        ],
        A.join("\n")
      )
    : pipe(
        [
          `${turtleIri(predicate.iri)} a rdf:Property ;`,
          `  rdfs:label ${turtleLiteral(predicate.label)} ;`,
          ...turtleComment(predicate.comment),
          `  rdfs:domain ${turtleIri(predicate.domainClassIri)} ;`,
          `  rdfs:range ${turtleIri(predicate.rangeClassIri)} .`,
        ],
        A.join("\n")
      );

export const projectTurtle = (ontology: AssembledOntology): string => {
  const header = pipe(
    [
      `@prefix ${ontology.metadata.preferredPrefix}: ${turtleIri(ontology.metadata.baseIri)} .`,
      `@prefix rdf: ${turtleIri(RDF_PREFIX_IRI)} .`,
      `@prefix rdfs: ${turtleIri(RDFS_PREFIX_IRI)} .`,
      `@prefix owl: ${turtleIri(OWL_PREFIX_IRI)} .`,
      `@prefix skos: ${turtleIri(makeIri(SKOS_NAMESPACE))} .`,
      `@prefix dcterms: ${turtleIri(makeIri(DCTERMS_NAMESPACE))} .`,
      `@prefix xsd: ${turtleIri(XSD_PREFIX_IRI)} .`,
    ],
    A.join("\n")
  );

  const classBlocks = pipe(ontology.classes, A.map(renderClass));
  const childBlocks = pipe(ontology.classes, A.flatMap(renderChildSubclassStatements));
  const predicateBlocks = pipe(ontology.classes, A.flatMap((ontologyClass) => A.map(ontologyClass.predicates, renderPredicate)));

  return pipe([header, ...classBlocks, ...childBlocks, ...predicateBlocks], A.join("\n\n"));
};
