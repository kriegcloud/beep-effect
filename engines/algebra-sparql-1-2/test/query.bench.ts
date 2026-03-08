import { Parser as TraqulaParser } from '@traqula/parser-sparql-1-2';
import { positiveTest } from '@traqula/test-utils';
import { translate } from 'sparqlalgebrajs';
import { describe, bench } from 'vitest';
import { toAlgebra } from '../lib/index.js';

describe('toAlgebra 1.2, exclude parser construction', () => {
  const traqulaParser = new TraqulaParser();

  describe('general queries', async() => {
    const allQueries = await Promise.all([ ...positiveTest('sparql-1-1') ]
      .map(x => x.statics().then(x => x.query)));

    bench('traqula toAlgebra 1.2', () => {
      for (const query of allQueries) {
        toAlgebra(traqulaParser.parse(query), { quads: true });
      }
    });
    bench('sparqlAlgebraJs to Algebra', () => {
      for (const query of allQueries) {
        translate(query, { quads: true });
      }
    });
  });
});
