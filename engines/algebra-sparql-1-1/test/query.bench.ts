import type * as RDF from '@rdfjs/types';
import { createAlgebraContext, findAllVariables, algebraUtils } from '@traqula/algebra-transformations-1-1';
import { Parser as TraqulaParser } from '@traqula/parser-sparql-1-1';
import { positiveTest } from '@traqula/test-utils';
import { translate } from 'sparqlalgebrajs';
import { Parser } from 'sparqljs';
import { describe, bench } from 'vitest';
import { toAlgebra } from '../lib/index.js';
import { queryLargeObjectList } from './heatmap.js';
import * as Util from './sparqlAlgebraUtils.js';

describe('toAlgebra 1.1, exclude parser construction', () => {
  const traqulaParser = new TraqulaParser();

  describe('general queries', async() => {
    const allQueries = await Promise.all([ ...positiveTest('sparql-1-1') ]
      .map(x => x.statics().then(x => x.query)));

    bench('traqula toAlgebra 1.1', () => {
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

  /**
   * This test benefits sparqlAlgebra since it needs to process a smaller AST, but it still provides usefull insights
   */
  describe('general queries - only transformation', async() => {
    const sparqlJs = new Parser();
    const traqulaAsts = await Promise.all([ ...positiveTest('sparql-1-1') ]
      .map(async x => traqulaParser.parse((await x.statics()).query)));
    const sparqlJsAsts = await Promise.all([ ...positiveTest('sparql-1-1') ]
      .map(async x => sparqlJs.parse((await x.statics()).query)));

    bench('traqula to algebra 1.1 RAW', () => {
      for (const ast of traqulaAsts) {
        toAlgebra(ast, { quads: true });
      }
    });

    bench('sparqlAlgebra sparqlJs to Algebra', () => {
      for (const ast of sparqlJsAsts) {
        translate(ast, { quads: true });
      }
    });
  });

  describe('a way to iterate objects', () => {
    const ast = traqulaParser.parse(queryLargeObjectList);
    const transformerContext = createAlgebraContext({});
    const transformer = createAlgebraContext({}).transformer;
    const sparqlAlgebraVariables = new Set<string>();
    const traqulaTransformerVar = new Set<string>();
    const findVarsTraqula = findAllVariables.fun(<any> {});

    bench('find vars using traqula transformer', () => {
      findVarsTraqula(transformerContext, ast);
    });

    bench('findvars using visitObjects traqula', () => {
      traqulaTransformerVar.clear();
      transformer.visitObject(ast, (obj) => {
        if (isTerm(obj) && isVariable(obj)) {
          traqulaTransformerVar.add(`?${obj.value}`);
        }
      });
    });

    function isTerm(term: any): term is RDF.Term {
      return Boolean(term?.termType);
    }
    function isVariable(term: any): term is RDF.Variable {
      return term?.termType === 'Variable';
    }
    /**
     * https://github.com/joachimvh/SPARQLAlgebra.js/blob/f57c747eb1502a6fd938f53feaa76e229fb269bc/lib/sparqlAlgebra.ts#L137-L166
     */
    function sparqlAlgebraFindAllVariables(thingy: any): void {
      if (isTerm(thingy)) {
        if (isVariable(thingy)) {
          // Variables don't store the `?`
          sparqlAlgebraVariables.add(`?${thingy.value}`);
        }
      } else if (Array.isArray(thingy)) {
        for (const entry of thingy) {
          sparqlAlgebraFindAllVariables(entry);
        }
      } else if (thingy && typeof thingy === 'object') {
        for (const value of Object.values(thingy)) {
          sparqlAlgebraFindAllVariables(value);
        }
      }
    }

    bench('find vars like SparqlAlgebra', () => {
      sparqlAlgebraVariables.clear();
      sparqlAlgebraFindAllVariables(ast);
    });
  });

  describe('recurse/ visit Operation', () => {
    const bigOp = toAlgebra(traqulaParser.parse(queryLargeObjectList), { quads: true });

    bench('visit all traqula', () => {
      algebraUtils.visitOperation(bigOp, {});
    });

    bench('visist all sparqlAlgebra', () => {
      Util.recurseOperation(bigOp, {});
    });
  });

  describe('mapOperation copy', () => {
    const bigOp = toAlgebra(traqulaParser.parse(queryLargeObjectList), { quads: true });

    bench('using traqula mapOperation', () => {
      algebraUtils.mapOperation(bigOp, {});
    });

    bench('using sparqlAlgebra mapOperation', () => {
      Util.mapOperationOld(bigOp, {});
    });
  });
});
