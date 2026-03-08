import fs from 'node:fs';
import path from 'node:path';
import type { BaseQuad } from '@rdfjs/types';
import { AstFactory, lex as l12 } from '@traqula/rules-sparql-1-2';
import { positiveTest, importSparql11NoteTests, negativeTest, getStaticFilePath } from '@traqula/test-utils';
import { DataFactory } from 'rdf-data-factory';
import { beforeEach, describe, it } from 'vitest';
import { Parser, sparql12ParserBuilder } from '../lib/index.js';

describe('a SPARQL 1.2 parser', () => {
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

  function _sinkAst(suite: string, test: string, response: object): void {
    const dir = getStaticFilePath();
    const fileLoc = path.join(dir, 'ast', 'ast-source-tracked', suite, `${test}.json`);
    // eslint-disable-next-line no-sync
    fs.writeFileSync(fileLoc, JSON.stringify(response, null, 2));
  }

  it('passes chevrotain validation', () => {
    sparql12ParserBuilder.build({
      tokenVocabulary: l12.sparql12LexerBuilder.tokenVocabulary,
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
        expect(res, 'source tracking res')
          .toEqualParsedQueryIgnoring(obj => astFactory.isTriple(obj), [ 'annotations' ], astWithSource);
        const resNoSource = noSourceTrackingParser.parse(query, context);
        expect(resNoSource, 'no source tracking res')
          .toEqualParsedQueryIgnoring(obj => astFactory.isTriple(obj), [ 'annotations' ], astNoSource);
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

  describe('positive sparql 1.2', () => {
    for (const { name, statics } of positiveTest('sparql-1-2')) {
      it(`can parse ${name}`, async({ expect }) => {
        const { query, astWithSource } = await statics();
        const astNoSource = astFactory.forcedAutoGenTree(<object> astWithSource);
        const res: unknown = sourceTrackingParser.parse(query, context);
        // _sinkAst('sparql-1-2', name, <object> res);
        expect(res, 'source tracking res').toEqualParsedQuery(astWithSource);
        const resNoSource = noSourceTrackingParser.parse(query, context);
        expect(resNoSource, 'no source tracking res')
          .toEqualParsedQuery(astNoSource);
      });
    }
  });

  describe('negative sparql 1.2', () => {
    const skip = new Set([
      'sparql-1-2-syntax-compound-tripleterm-subject',
      'sparql-1-2-syntax-subject-tripleterm',
    ]);
    for (const { name, statics } of negativeTest('sparql-1-2-invalid', name => !skip.has(name))) {
      it(`should NOT parse ${name}`, async({ expect }) => {
        const { query } = await statics();
        expect(() => sourceTrackingParser.parse(query, context), 'source tracking').toThrow();
        expect(() => noSourceTrackingParser.parse(query, context), 'no source tracking').toThrow();
      });
    }
  });

  describe('specific sparql 1.1 with source tracking', () => {
    importSparql11NoteTests(sourceTrackingParser, new DataFactory<BaseQuad>());
  });

  describe('specific sparql 1.1 without source tracking', () => {
    importSparql11NoteTests(noSourceTrackingParser, new DataFactory<BaseQuad>());
  });
});
