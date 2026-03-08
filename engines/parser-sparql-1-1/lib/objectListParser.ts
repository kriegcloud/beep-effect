import { ParserBuilder } from '@traqula/core';
import { gram } from '@traqula/rules-sparql-1-1';

const rules = <const> [
  gram.objectList,
  gram.object,
  gram.graphNode,
  gram.varOrTerm,
  gram.triplesNode,
  gram.collection,
  gram.blankNodePropertyList,
  gram.propertyListNotEmpty,
  // PropertyListNotEmpty
  gram.verb,
  gram.verbA,
  gram.varOrIri,
  gram.var_,
  gram.iri,
  gram.iriFull,
  gram.prefixedName,
  gram.graphTerm,
  gram.rdfLiteral,
  gram.numericLiteral,
  gram.booleanLiteral,
  gram.blankNode,
  gram.string,
  gram.numericLiteralUnsigned,
  gram.numericLiteralPositive,
  gram.numericLiteralNegative,
];

export const objectListParserBuilder = ParserBuilder.create(rules);

export type ObjectListParser = ReturnType<typeof objectListParserBuilder.build>;
