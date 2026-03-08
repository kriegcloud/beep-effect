import { AstFactory } from '@traqula/rules-sparql-1-2';
import { positiveTest } from '@traqula/test-utils';
import { Parser as SparqlJSparser } from 'sparqljs';
import { describe, bench } from 'vitest';
import { Parser as TraqulaParser } from '../lib/index.js';

describe('query 1.2, exclude construction', () => {
  const traqulaParser = new TraqulaParser();
  const astFactory = new AstFactory();
  const traqulaSourceTracking = new TraqulaParser({
    lexerConfig: { positionTracking: 'full' },
    defaultContext: { astFactory },
  });
  const sparqlJSparser = new SparqlJSparser();

  describe('general queries', async() => {
    const allQueries = await Promise.all([ ...positiveTest('sparql-1-1') ]
      .map(x => x.statics().then(x => x.query)));

    bench('traqula parse 1.2 no source tracking', () => {
      for (const query of allQueries) {
        traqulaParser.parse(query);
      }
    });

    bench('traqula parse 1.2 with source tracking', () => {
      for (const query of allQueries) {
        traqulaSourceTracking.parse(query);
      }
    });

    bench('sparqljs', () => {
      for (const query of allQueries) {
        sparqlJSparser.parse(query);
      }
    });
  });
});
