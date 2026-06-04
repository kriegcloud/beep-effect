// cspell:words SKOS DCTERMS skos dcterms
import { pipe } from "effect";
import * as A from "effect/Array";
import { constant } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import {
  DCTERMS_NAMESPACE,
  makeIri,
  OWL_PREFIX_IRI,
  RDF_PREFIX_IRI,
  RDFS_PREFIX_IRI,
  SKOS_NAMESPACE,
  XSD_PREFIX_IRI,
} from "../model.js";
import type {
  AssembledOntology,
  AssembledOntologyClass,
  AssembledOntologyPredicate,
  IRI,
  OntologyReference,
} from "../model.js";

const turtleIri = (iri: IRI): string => `<${iri}>`;

const escapeTurtleLiteral = (value: string): string =>
  pipe(
    value,
    Str.replaceAll("\\", "\\\\"),
    Str.replaceAll('"', '\\"'),
    Str.replaceAll("\n", "\\n"),
    Str.replaceAll("\r", "\\r"),
    Str.replaceAll("\t", "\\t")
  );

const turtleLiteral = (value: string): string => `"${escapeTurtleLiteral(value)}"`;

const turtleLiteralStatement = (predicate: string, value: string): string => `${predicate} ${turtleLiteral(value)}`;

const turtleOptionalLiteralStatements = (predicate: string, value: O.Option<string>): ReadonlyArray<string> =>
  pipe(
    value,
    O.map((current) => [turtleLiteralStatement(predicate, current)]),
    O.getOrElse(A.empty<string>)
  );

const turtleReferenceStatement = (predicate: string, reference: OntologyReference): string =>
  `${predicate} ${turtleIri(reference.iri)}`;

const turtleReferenceStatements = (
  predicate: string,
  references: ReadonlyArray<OntologyReference>
): ReadonlyArray<string> =>
  pipe(
    references,
    A.map((reference) => turtleReferenceStatement(predicate, reference))
  );

const turtleBooleanStatement = (predicate: string, value: boolean): ReadonlyArray<string> =>
  value ? [`${predicate} true`] : A.empty<string>();

const renderSourceStatements = (ontologyClass: AssembledOntologyClass): ReadonlyArray<string> =>
  pipe(
    ontologyClass.source,
    O.map((source) => [`dcterms:source ${turtleIri(source)}`]),
    O.getOrElse(A.empty<string>)
  );

const renderStatements = (subject: string, statements: ReadonlyArray<string>): string =>
  pipe(
    statements,
    A.match({
      onEmpty: constant(`${subject} .`),
      onNonEmpty: (nonEmptyStatements) =>
        `${subject} ${A.headNonEmpty(nonEmptyStatements)}${pipe(
          A.tailNonEmpty(nonEmptyStatements),
          A.map((statement) => ` ;\n  ${statement}`),
          A.join("")
        )} .`,
    })
  );

const renderClass = (ontologyClass: AssembledOntologyClass): string =>
  renderStatements(`${turtleIri(ontologyClass.iri)} a rdfs:Class ;`, [
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
    ...turtleBooleanStatement("owl:deprecated", ontologyClass.deprecated),
    ...renderSourceStatements(ontologyClass),
  ]);

const renderChildSubclassStatements = (ontologyClass: AssembledOntologyClass): ReadonlyArray<string> =>
  pipe(
    ontologyClass.children,
    A.map((child) => `${turtleIri(child.iri)} rdfs:subClassOf ${turtleIri(ontologyClass.iri)} .`)
  );

const renderPredicate = (predicate: AssembledOntologyPredicate): string =>
  renderStatements(
    `${turtleIri(predicate.iri)} a ${predicate.kind === "datatypePredicate" ? "owl:DatatypeProperty" : "owl:ObjectProperty"} ;`,
    [
      turtleLiteralStatement("rdfs:label", predicate.label),
      ...turtleOptionalLiteralStatements("rdfs:comment", predicate.comment),
      `rdfs:domain ${turtleIri(predicate.domainClassIri)}`,
      `rdfs:range ${turtleIri(predicate.kind === "datatypePredicate" ? predicate.rangeDatatypeIri : predicate.rangeClassIri)}`,
    ]
  );

/**
 * Projects an assembled ontology into a compact Turtle document.
 *
 * @category projections
 * @since 0.0.0
 */
export const projectTurtle = (ontology: AssembledOntology): string => {
  const prefixes = [
    `@prefix ${ontology.metadata.preferredPrefix}: ${turtleIri(ontology.metadata.baseIri)} .`,
    `@prefix rdf: ${turtleIri(RDF_PREFIX_IRI)} .`,
    `@prefix rdfs: ${turtleIri(RDFS_PREFIX_IRI)} .`,
    `@prefix owl: ${turtleIri(OWL_PREFIX_IRI)} .`,
    `@prefix skos: ${turtleIri(makeIri(SKOS_NAMESPACE))} .`,
    `@prefix dcterms: ${turtleIri(makeIri(DCTERMS_NAMESPACE))} .`,
    `@prefix xsd: ${turtleIri(XSD_PREFIX_IRI)} .`,
  ];

  const classBlocks = pipe(ontology.classes, A.map(renderClass));
  const childBlocks = pipe(ontology.classes, A.flatMap(renderChildSubclassStatements));
  const predicateBlocks = pipe(
    ontology.classes,
    A.flatMap((ontologyClass) => A.map(ontologyClass.predicates, renderPredicate))
  );

  return pipe([...prefixes, "", ...classBlocks, ...childBlocks, ...predicateBlocks], A.join("\n\n"));
};
