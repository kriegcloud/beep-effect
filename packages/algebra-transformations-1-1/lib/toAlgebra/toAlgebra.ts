import type { PatternGroup, SparqlQuery } from '@traqula/rules-sparql-1-1';
import type { Algebra } from '../index.js';
import { translateAggregates } from './aggregate.js';
import type { AlgebraIndir } from './core.js';
import {
  findAllVariables,
  registerContextDefinitions,
  translateBlankNodesToVariables,
} from './general.js';
import {
  translateGraphPattern,
} from './patterns.js';
import {
  translateUpdate,
} from './updates.js';

export const translateQuery:
AlgebraIndir<'translateQuery', Algebra.Operation, [SparqlQuery, boolean | undefined, boolean | undefined]> = {
  name: 'translateQuery',
  fun: ({ SUBRULE }) => (c, sparql, quads, blankToVariable) => {
    const F = c.astFactory;
    c.variables = new Set();
    c.varCount = 0;
    c.useQuads = quads ?? false;

    let result: Algebra.Operation;

    // Find ALL variables here to fill `variables` array - needed to create fresh variables
    SUBRULE(findAllVariables, sparql);

    if (F.isQuery(sparql)) {
      SUBRULE(registerContextDefinitions, sparql.context);
      // Group and where are identical, having only 1 makes parsing easier, can be undefined in DESCRIBE
      const group: PatternGroup = sparql.where ?? F.patternGroup([], F.gen());
      result = SUBRULE(translateGraphPattern, group);
      // 18.2.4 Converting Groups, Aggregates, HAVING, final VALUES clause and SELECT Expressions
      result = SUBRULE(translateAggregates, sparql, result);
    } else {
      result = SUBRULE(translateUpdate, sparql);
    }
    if (blankToVariable) {
      result = SUBRULE(translateBlankNodesToVariables, result);
    }

    return result;
  },
};
