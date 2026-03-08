import { AstFactory } from '@traqula/rules-sparql-1-1';
import { positiveTest } from '@traqula/test-utils';
import { Parser as SparqlJSparser } from 'sparqljs';
import { describe, bench } from 'vitest';
import { Parser as TraqulaParser } from '../lib/index.js';
import { queryLargeObjectList } from './heatmap.js';

describe('query 1.1, exclude construction', () => {
  const sourceTrackingAstFactory = new AstFactory({ tracksSourceLocation: true });
  const sourceTrackingParser = new TraqulaParser({
    defaultContext: { astFactory: sourceTrackingAstFactory },
    lexerConfig: { positionTracking: 'full' },
  });
  const noSourceTrackingTraqula = new TraqulaParser();
  const sparqlJSparser = new SparqlJSparser();
  const query = queryLargeObjectList;

  describe('large objectList', () => {
    bench('traqula parse', () => {
      sourceTrackingParser.parse(query);
    });
    bench('sparqljs', () => {
      sparqlJSparser.parse(query);
    });
  });

  describe('general queries', async() => {
    const allQueries = await Promise.all([ ...positiveTest('sparql-1-1') ]
      .map(x => x.statics().then(x => x.query)));

    bench('traqula parse 1.1', () => {
      for (const query of allQueries) {
        sourceTrackingParser.parse(query);
      }
    });
    bench('sparqljs', () => {
      for (const query of allQueries) {
        sparqlJSparser.parse(query);
      }
    });
    bench('traqula no-source tracking', () => {
      noSourceTrackingTraqula.parse(query);
    });
  });
});
