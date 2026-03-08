import { Canonicalizer, algebraUtils } from '@traqula/algebra-transformations-1-1';
import type { Algebra } from '@traqula/algebra-transformations-1-2';
import { Generator as Generator12 } from '@traqula/generator-sparql-1-2';
import { Parser as Parser12 } from '@traqula/parser-sparql-1-2';
import { positiveTest, sparqlAlgebraTests } from '@traqula/test-utils';
import { describe, it } from 'vitest';
import { toAst, toAlgebra } from '../lib/index.js';
import { suites } from './algebra.test.js';

// https://www.w3.org/2001/sw/DataAccess/tests/r2#syntax-basic-01
// https://www.w3.org/2009/sparql/implementations/
// https://www.w3.org/2009/sparql/docs/tests/
describe('sparql 1.2 algebra transformer', () => {
  const canon = new Canonicalizer();
  const parser = new Parser12();
  const generator = new Generator12();

  describe('sparqlAlgebraTests', () => {
    for (const suite of suites) {
      describe(suite, () => {
        for (const test of sparqlAlgebraTests(suite, false, false)) {
          const { name, json, quads } = test;
          const expected = <Algebra.Operation> json;
          it (name, ({ expect }) => {
            const genAst = toAst(expected);
            // Console.log(JSON.stringify(genAst, null, 2));
            const genQuery = generator.generate(genAst);
            // Console.log(genQuery);
            const ast = parser.parse(genQuery);
            const algebra = algebraUtils.objectify(toAlgebra(ast, { quads }));
            expect(canon.canonicalizeQuery(algebra, false)).toEqual(canon.canonicalizeQuery(expected, false));
          });
        }
      });
    }
  });

  function testLoopQuery(name: string, query: Promise<string>): void {
    it(`can algebra circle ${name}`, async({ expect }) => {
      const ast = parser.parse(await query);
      // Console.log(JSON.stringify(path, null, 2));
      const algebra = algebraUtils.objectify(toAlgebra(ast, { quads: true }));
      // Console.log(JSON.stringify(algebra, null, 2));
      const astFromAlg = toAst(algebra);
      // Console.log(JSON.stringify(pathFromAlg, null, 2));
      const queryGen = generator.generate(astFromAlg);
      // Console.log(queryGen);
      const astFromGen = parser.parse(queryGen);
      const algebraFromGen = algebraUtils.objectify(toAlgebra(astFromGen, { quads: true }));
      expect(canon.canonicalizeQuery(algebraFromGen, false)).toEqual(canon.canonicalizeQuery(algebra, false));
    });
  }

  describe('static 11', () => {
    for (const { name, statics } of positiveTest('sparql-1-1', x => ![
      // 2x Sequence path introduces new variable that is then scoped in projection
      'sequence-paths-in-anonymous-node',
      'sparql-9-3c',
      // Values is pushed from being solution modifier to being in patternGroup
      'sparql-values-clause',
      // Same reason
      'no-space-select',
    ].includes(x))) {
      testLoopQuery(name, statics().then(x => x.query));
    }
  });

  describe('static 12', () => {
    for (const { name, statics } of positiveTest('sparql-1-2', x => ![
    ].includes(<never> x))) {
      testLoopQuery(name, statics().then(x => x.query));
    }
  });
});
