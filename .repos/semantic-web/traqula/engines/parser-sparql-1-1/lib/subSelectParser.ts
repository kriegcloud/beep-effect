import { ParserBuilder } from '@traqula/core';
import { gram } from '@traqula/rules-sparql-1-1';
import { expressionParserBuilder } from './expressionParser.js';
import { triplesBlockParserBuilder } from './triplesBlockParser.js';

const rules = <const> [
  gram.subSelect,
  gram.selectClause,
  gram.whereClause,
  gram.solutionModifier,
  gram.valuesClause,
];

export const subSelectParserBuilder = ParserBuilder.create(rules)
  .merge(expressionParserBuilder, <const> [])
  .patchRule(gram.builtInCall)
  .addMany(
    gram.existsFunc,
    gram.notExistsFunc,
    gram.groupGraphPattern,
    gram.groupGraphPatternSub,
  )
  .merge(triplesBlockParserBuilder, <const> [])
  .addMany(
    gram.graphPatternNotTriples,
    gram.groupOrUnionGraphPattern,
    gram.optionalGraphPattern,
    gram.minusGraphPattern,
    gram.graphGraphPattern,
    gram.serviceGraphPattern,
    gram.filter,
    gram.bind,
    gram.inlineData,
    gram.constraint,
    gram.functionCall,
    gram.dataBlock,
    gram.inlineDataOneVar,
    gram.inlineDataFull,
    gram.dataBlockValue,
    // Solution modifier
    gram.groupClause,
    gram.havingClause,
    gram.orderClause,
    gram.limitOffsetClauses,
    gram.groupCondition,
    gram.havingCondition,
    gram.orderCondition,
    gram.limitClause,
    gram.offsetClause,
  );

export type SubSelectParser = ReturnType<typeof subSelectParserBuilder.build>;
