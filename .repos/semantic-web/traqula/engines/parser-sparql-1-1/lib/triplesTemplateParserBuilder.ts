import { ParserBuilder } from '@traqula/core';
import { gram } from '@traqula/rules-sparql-1-1';

const rules = <const> [
  gram.triplesTemplate,
  gram.triplesSameSubject,
  gram.varOrTerm,
  gram.propertyListNotEmpty,
  gram.triplesNode,
  gram.propertyList,
  gram.var_,
  gram.graphTerm,
  gram.iri,
  gram.iriFull,
  gram.prefixedName,
  gram.rdfLiteral,
  gram.string,
  gram.numericLiteral,
  gram.numericLiteralUnsigned,
  gram.numericLiteralPositive,
  gram.numericLiteralNegative,
  gram.booleanLiteral,
  gram.blankNode,
  gram.verb,
  gram.verbA,
  gram.varOrIri,
  gram.objectList,
  gram.object,
  gram.collection,
  gram.blankNodePropertyList,
  gram.graphNode,
];

export const triplesTemplateParserBuilder = ParserBuilder.create(rules);

export type TriplesTemplateParser = ReturnType<typeof triplesTemplateParserBuilder.build>;
