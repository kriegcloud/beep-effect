import { ParserBuilder } from '@traqula/core';
import { gram } from '@traqula/rules-sparql-1-1';
import { objectListParserBuilder } from './objectListParser.js';

export const triplesBlockParserBuilder = ParserBuilder.create(<const> [
  gram.triplesBlock,
  gram.triplesSameSubjectPath,
  // VarOrTerm is included in the required ObjectList rule
  gram.propertyListPathNotEmpty,
  gram.triplesNodePath,
  gram.propertyListPath,
  // PropertyListNotEmpty
  gram.verbPath,
  gram.verbSimple,
  gram.objectListPath,
])
  .merge(objectListParserBuilder, <const> [])
  // Verb path
  .addMany(
    gram.path,
    gram.pathAlternative,
    gram.pathSequence,
    gram.pathEltOrInverse,
    gram.pathElt,
    gram.pathPrimary,
    gram.pathMod,
    gram.pathNegatedPropertySet,
    gram.pathOneInPropertySet,
    // ObjectListPath
    gram.objectPath,
    gram.graphNodePath,
    gram.collectionPath,
    gram.blankNodePropertyListPath,
  );

export type triplesBlockParser = ReturnType<typeof triplesBlockParserBuilder.build>;
