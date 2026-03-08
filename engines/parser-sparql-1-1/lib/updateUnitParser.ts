import { ParserBuilder } from '@traqula/core';
import { gram } from '@traqula/rules-sparql-1-1';
import { objectListParserBuilder } from './objectListParser.js';
import { subSelectParserBuilder } from './subSelectParser.js';
import { updateNoModifyParserBuilder } from './updateNoModifyParser.js';

export const updateParserBuilder = ParserBuilder.create(updateNoModifyParserBuilder)
  .patchRule(gram.update1)
  .addMany(
    gram.modify,
    gram.deleteClause,
    gram.insertClause,
    gram.usingClause,
    gram.defaultGraphClause,
    gram.namedGraphClause,
    gram.sourceSelector,
    gram.usingClauseStar,
    gram.groupGraphPattern,
  )
  // This substitutes all of propertyListNotEmpty
  .merge(objectListParserBuilder, <const> [])
  .merge(subSelectParserBuilder, <const> []);

export type UpdateUnitParser = ReturnType<typeof updateParserBuilder.build>;
