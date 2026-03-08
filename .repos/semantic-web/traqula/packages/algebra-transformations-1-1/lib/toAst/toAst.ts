import type { Query, SparqlQuery } from '@traqula/rules-sparql-1-1';
import type * as Algebra from '../algebra.js';
import { types } from '../toAlgebra/core.js';
import type { AstIndir } from './core.js';
import { resetContext } from './core.js';

import {
  translateAlgPatternIntoGroup,
} from './pattern.js';
import { removeAlgQuads } from './quads.js';

import {
  toUpdate,
  translateAlgCompositeUpdate,
  translateAlgUpdateOperation,
} from './updateUnit.js';

export const algToSparql: AstIndir<'algToSparql', SparqlQuery, [Algebra.Operation]> = {
  name: 'algToSparql',
  fun: ({ SUBRULE }) => (_, op) => {
    SUBRULE(resetContext);
    op = SUBRULE(removeAlgQuads, op);
    if (op.type === types.COMPOSITE_UPDATE) {
      return SUBRULE(translateAlgCompositeUpdate, op);
    }
    if (op.type === types.NOP) {
      return SUBRULE(toUpdate, []);
    }
    try {
      return SUBRULE(toUpdate, [ SUBRULE(translateAlgUpdateOperation, <Algebra.Update> op) ]);
    } catch { /* That's okay, it's not an update */}
    // If no Update, must be query.
    const result = SUBRULE(translateAlgPatternIntoGroup, op);
    return <Query> result.patterns[0];
  },
};
