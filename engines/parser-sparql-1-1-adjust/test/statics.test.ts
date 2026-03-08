import type { BaseQuad } from '@rdfjs/types';
import { AstFactory } from '@traqula/rules-sparql-1-1';
import { positiveTest, importSparql11NoteTests, negativeTest } from '@traqula/test-utils';
import { DataFactory } from 'rdf-data-factory';
import { beforeEach, describe, it } from 'vitest';
import { adjustParserBuilder, adjustLexerBuilder, Parser } from '../lib/index.js';

describe('a SPARQL 1.1 + adjust parser', () => {
  const astFactory = new AstFactory({ tracksSourceLocation: false });
  const sourceTrackingAstFactory = new AstFactory();
  const sourceTrackingParser = new Parser({
    defaultContext: { astFactory: sourceTrackingAstFactory },
    lexerConfig: { positionTracking: 'full' },
  });
  const noSourceTrackingParser = new Parser({ defaultContext: { astFactory }});
  const context = { prefixes: { ex: 'http://example.org/' }};

  beforeEach(() => {
    astFactory.resetBlankNodeCounter();
    sourceTrackingAstFactory.resetBlankNodeCounter();
  });

  it('passes chevrotain validation', () => {
    adjustParserBuilder.build({
      tokenVocabulary: adjustLexerBuilder.tokenVocabulary,
      lexerConfig: {
        skipValidations: false,
        ensureOptimizations: true,
      },
      parserConfig: {
        skipValidations: false,
      },
    });
  });

  describe('positive paths', () => {
    for (const { name, statics } of positiveTest('paths')) {
      it(`can parse ${name}`, async({ expect }) => {
        const { query, astWithSource } = await statics();
        const res: unknown = sourceTrackingParser.parsePath(query, context);
        expect(res, 'source tracking res').toEqualParsedQuery(astWithSource);
        const resNoSource = noSourceTrackingParser.parsePath(query, context);
        expect(resNoSource, 'no source tracking res')
          .toEqualParsedQuery(astFactory.forcedAutoGenTree(<object> astWithSource));
      });
    }
  });

  describe('positive sparql 1.1', () => {
    for (const { name, statics } of positiveTest('sparql-1-1')) {
      it(`can parse ${name}`, async({ expect }) => {
        const { query, astWithSource } = await statics();
        const astNoSource = astFactory.forcedAutoGenTree(<object> astWithSource);
        const res: unknown = sourceTrackingParser.parse(query, context);
        expect(res, 'source tracking res').toEqualParsedQuery(astWithSource);
        const resNoSource = noSourceTrackingParser.parse(query, context);
        expect(resNoSource, 'no source tracking res')
          .toEqualParsedQuery(astNoSource);
      });
    }
  });

  describe('negative SPARQL 1.1', () => {
    for (const { name, statics } of negativeTest('sparql-1-1-invalid')) {
      it(`should NOT parse ${name}`, async({ expect }) => {
        const { query } = await statics();
        expect(() => sourceTrackingParser.parse(query, context), 'with source tracking parser').toThrow();
        expect(() => noSourceTrackingParser.parse(query, context), 'with noSourceTracking parser').toThrow();
      });
    }
  });

  describe('specific sparql 1.1 with source tracking', () => {
    importSparql11NoteTests(sourceTrackingParser, new DataFactory<BaseQuad>());
  });

  describe('specific sparql 1.1 without source tracking', () => {
    importSparql11NoteTests(noSourceTrackingParser, new DataFactory<BaseQuad>());
  });

  it('parses ADJUST function', ({ expect }) => {
    const query = `
SELECT ?s ?p (ADJUST(?o, "-PT10H"^^<http://www.w3.org/2001/XMLSchema#dayTimeDuration>) as ?adjusted) WHERE {
  ?s ?p ?o
}
`;
    const res: unknown = sourceTrackingParser.parse(query);
    const astNoSource = astFactory.forcedAutoGenTree(<object> res);
    expect(res, 'source tracked').toMatchObject({});
    const resNoSource = noSourceTrackingParser.parse(query, context);
    expect(resNoSource, 'No source tracked').toEqual(astNoSource);
  });
});
