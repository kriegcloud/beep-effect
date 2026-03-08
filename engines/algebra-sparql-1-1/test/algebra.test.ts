import type { Algebra } from '@traqula/algebra-transformations-1-1';
import { Canonicalizer, algebraUtils } from '@traqula/algebra-transformations-1-1';
import { Parser } from '@traqula/parser-sparql-1-1';
import type { AlgebraTestSuite } from '@traqula/test-utils';
import { sparqlAlgebraNegativeTests, sparqlAlgebraTests } from '@traqula/test-utils';
import { describe, it } from 'vitest';
import { toAlgebra } from '../lib/index.js';

export const suites: AlgebraTestSuite[] = [ 'dawg-syntax', 'sparql11-query', 'sparql-1.1' ];

// https://www.w3.org/2001/sw/DataAccess/tests/r2#syntax-basic-01
// https://www.w3.org/2009/sparql/implementations/
// https://www.w3.org/2009/sparql/docs/tests/
describe('algebra output', () => {
  const canon = new Canonicalizer();
  const parser = new Parser();

  for (const suite of suites) {
    describe(suite, () => {
      for (const blankToVariable of [ true, false ]) {
        for (const test of sparqlAlgebraTests(suite, blankToVariable, true)) {
          const { name, json, sparql: query } = test;
          it(`${name}${blankToVariable ? ' (no blanks)' : ''}`, ({ expect }) => {
            const ast = parser.parse(query);
            const algebra = algebraUtils.objectify(
              toAlgebra(ast, {
                quads: name.endsWith('-quads'),
                blankToVariable,
              }),
            );
            expect(canon.canonicalizeQuery(algebra, blankToVariable))
              .toEqual(canon.canonicalizeQuery(<Algebra.Operation>json, blankToVariable));
          });
        }
      }
    });
  }

  describe('negative 1.1 algebra', () => {
    for (const test of sparqlAlgebraNegativeTests('sparql-1.1-negative')) {
      it(test.name, async({ expect }) => {
        const { query } = await test.statics();
        const ast = parser.parse(query, { skipValidation: true });
        expect(() => algebraUtils.objectify(toAlgebra(ast))).toThrow();
      });
    }
  });
});
