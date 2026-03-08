import type * as RDF from '@rdfjs/types';
import type {
  Expression,
  PathPure,
  Pattern,
  PatternBgp,
  PatternFilter,
  PatternGroup,
  Wildcard,
} from '@traqula/rules-sparql-1-1';
import type { Algebra } from '../index.js';
import type { AlgebraIndir, FlattenedTriple } from './core.js';
import { types } from './core.js';
import type { AstToRdfTerm } from './general.js';
import { translateInlineData, translateNamed, translateTerm } from './general.js';
import { translatePath } from './path.js';
import { translateQuery } from './toAlgebra.js';
import { recurseGraph, translateBasicGraphPattern, translateQuad } from './tripleAndQuad.js';

/**
 * Handles part of: 18.2.2.2 Collect FILTER Elements
 */
export const translateExpression: AlgebraIndir<'translateExpression', Algebra.Expression, [Expression | Wildcard]> = {
  name: 'translateExpression',
  fun: ({ SUBRULE }) => ({ astFactory: F, algebraFactory: AF }, expr) => {
    if (F.isTerm(expr)) {
      return AF.createTermExpression(SUBRULE(translateTerm, expr));
    }

    if (F.isWildcard(expr)) {
      return AF.createWildcardExpression();
    }

    if (F.isExpressionAggregate(expr)) {
      return AF.createAggregateExpression(
        expr.aggregation,
        SUBRULE(translateExpression, expr.expression[0]),
        expr.distinct,
        F.isExpressionAggregateSeparator(expr) ? expr.separator : undefined,
      );
    }

    if (F.isExpressionFunctionCall(expr)) {
      // Outdated typings
      return AF.createNamedExpression(
        SUBRULE(translateNamed, expr.function),
        expr.args.map(subExpr => SUBRULE(translateExpression, subExpr)),
      );
    }

    if (F.isExpressionOperator(expr)) {
      return AF.createOperatorExpression(
        expr.operator,
        expr.args.map(subExpr => SUBRULE(translateExpression, subExpr)),
      );
    }

    if (F.isExpressionPatternOperation(expr)) {
      return AF.createExistenceExpression(
        expr.operator === 'notexists',
        SUBRULE(translateGraphPattern, expr.args),
      );
    }

    throw new Error(`Unknown expression: ${JSON.stringify(expr)}`);
  },
};

export const translateGraphPattern: AlgebraIndir<'translateGraphPattern', Algebra.Operation, [Pattern]> = {
  name: 'translateGraphPattern',
  fun: ({ SUBRULE }) => ({ astFactory: F, algebraFactory: AF, useQuads }, pattern) => {
    // 18.2.2.1: Expand Syntax Forms -
    //    partly done by sparql parser, partly in this.translateTerm, and partly in BGP
    // https://www.w3.org/TR/sparql11-query/#sparqlExpandForms
    // https://www.w3.org/TR/sparql11-query/#QSynIRI
    if (F.isPatternBgp(pattern)) {
      return SUBRULE(translateBgp, pattern);
    }

    // 18.2.2.6: Translate Graph Patterns - GroupOrUnionGraphPattern
    if (F.isPatternUnion(pattern)) {
      return AF.createUnion(
        pattern.patterns.map((group: PatternGroup) => SUBRULE(translateGraphPattern, group)),
      );
    }

    // 18.2.2.6: Translate Graph Patterns - GraphGraphPattern
    if (F.isPatternGraph(pattern)) {
      // Sparql.js combines the group graph pattern and the graph itself in the same object.
      // We split here so the group graph pattern can be interpreted correctly.
      const group = F.patternGroup(pattern.patterns, pattern.loc);
      let result = SUBRULE(translateGraphPattern, group);

      // Output depends on if we use quads or not
      if (useQuads) {
        result = SUBRULE(recurseGraph, result, SUBRULE(translateTerm, pattern.name), undefined);
      } else {
        result = AF.createGraph(result, <RDF.NamedNode | RDF.Variable> SUBRULE(translateTerm, pattern.name));
      }

      return result;
    }

    // 18.2.2.6: Translate Graph Patterns - InlineData
    if (F.isPatternValues(pattern)) {
      return SUBRULE(translateInlineData, pattern);
    }

    // 18.2.2.6: Translate Graph Patterns - SubSelect
    if (F.isQuerySelect(pattern)) {
      return SUBRULE(translateQuery, pattern, useQuads, false);
    }

    // 18.2.2.6: Translate Graph Patterns - GroupGraphPattern
    if (F.isPatternGroup(pattern)) {
      // 18.2.2.2 - Collect FILTER Elements
      const filters: PatternFilter[] = [];
      const nonfilters: Pattern[] = [];
      for (const subPattern of pattern.patterns) {
        if (F.isPatternFilter(subPattern)) {
          filters.push(subPattern);
        } else {
          nonfilters.push(subPattern);
        }
      }

      // 18.2.2.6 - GroupGraphPattern
      let result: Algebra.Operation = AF.createBgp([]);
      for (const pattern of nonfilters) {
        result = SUBRULE(accumulateGroupGraphPattern, result, pattern);
      }

      // 18.2.2.7 - Filters of Group - translateExpression handles notExists negation.
      const expressions: Algebra.Expression[] = filters.map(filter => SUBRULE(translateExpression, filter.expression));
      if (expressions.length > 0) {
        let conjunction = expressions[0];
        for (const expression of expressions.slice(1)) {
          conjunction = AF.createOperatorExpression('&&', [ conjunction, expression ]);
        }
        // One big filter applied on the group
        result = AF.createFilter(result, conjunction);
      }

      return result;
    }

    throw new Error(`Unexpected pattern: ${pattern.subType}`);
  },
};

/**
 * 18.2.2.1: Expand Syntax Forms: Flatten TripleCollection
 * 18.2.2.3: Translate Property Path Expressions
 * 18.2.2.4: Translate Property Path Patterns
 * 18.2.2.5: Translate Basic Graph Patterns
 */
export const translateBgp: AlgebraIndir<'translateBgp', Algebra.Operation, [PatternBgp]> = {
  name: 'translateBgp',
  fun: ({ SUBRULE }) => ({ astFactory: F, algebraFactory: AF }, bgp) => {
    let patterns: Algebra.Pattern[] = [];
    const joins: Algebra.Operation[] = [];
    const flattenedTriples: FlattenedTriple[] = [];
    SUBRULE(translateBasicGraphPattern, bgp.triples, flattenedTriples);
    for (const triple of flattenedTriples) {
      if (F.isPathPure(triple.predicate)) {
        const smartType = <FlattenedTriple & { predicate: PathPure }> triple;
        // TranslatePath returns a mix of Quads and Paths
        const path = SUBRULE(translatePath, smartType);
        for (const p of path) {
          if (p.type === types.PATH) {
            if (patterns.length > 0) {
              joins.push(AF.createBgp(patterns));
            }
            patterns = [];
            joins.push(p);
          } else {
            patterns.push(p);
          }
        }
      } else {
        patterns.push(SUBRULE(translateQuad, triple));
      }
    }
    if (patterns.length > 0) {
      joins.push(AF.createBgp(patterns));
    }
    if (joins.length === 1) {
      return joins[0];
    }
    return AF.createJoin(joins);
  },
};

/**
 * 18.2.2.6 Translate Graph Patterns - GroupGraphPattern
 */
export const accumulateGroupGraphPattern:
AlgebraIndir<'accumulateGroupGraphPattern', Algebra.Operation, [Algebra.Operation, Pattern]> = {
  name: 'accumulateGroupGraphPattern',
  fun: ({ SUBRULE }) => ({ astFactory: F, algebraFactory: AF }, algebraOp, pattern) => {
    if (F.isPatternOptional(pattern)) {
      // Optional input needs to be interpreted as a group
      const groupAsAlgebra = SUBRULE(translateGraphPattern, F.patternGroup(pattern.patterns, pattern.loc));
      if (groupAsAlgebra.type === types.FILTER) {
        return AF.createLeftJoin(algebraOp, groupAsAlgebra.input, groupAsAlgebra.expression);
      }
      return AF.createLeftJoin(algebraOp, groupAsAlgebra);
    }

    if (F.isPatternMinus(pattern)) {
      // Minus input needs to be interpreted as a group
      const groupAsAlgebra = SUBRULE(translateGraphPattern, F.patternGroup(pattern.patterns, pattern.loc));
      return AF.createMinus(algebraOp, groupAsAlgebra);
    }

    if (F.isPatternBind(pattern)) {
      return AF.createExtend(
        algebraOp,
        <AstToRdfTerm<typeof pattern.variable>> SUBRULE(translateTerm, pattern.variable),
        SUBRULE(translateExpression, pattern.expression),
      );
    }

    if (F.isPatternService(pattern)) {
      // Transform to group so child-nodes get parsed correctly
      const group = F.patternGroup(pattern.patterns, pattern.loc);
      const A = AF.createService(
        SUBRULE(translateGraphPattern, group),
        <AstToRdfTerm<typeof pattern.name>> SUBRULE(translateTerm, pattern.name),
        pattern.silent,
      );
      return SUBRULE(simplifiedJoin, algebraOp, A);
    }

    const A = SUBRULE(translateGraphPattern, pattern);
    return SUBRULE(simplifiedJoin, algebraOp, A);
  },
};

export const simplifiedJoin:
AlgebraIndir<'simplifiedJoin', Algebra.Operation, [Algebra.Operation, Algebra.Operation]> = {
  name: 'simplifiedJoin',
  fun: () => ({ algebraFactory: AF }, G, A) => {
    // Note: this is more simplification than requested in 18.2.2.8, but no reason not to do it.
    if (G.type === types.BGP && A.type === types.BGP) {
      G = AF.createBgp([ ...G.patterns, ...A.patterns ]);
    } else if (G.type === types.BGP && G.patterns.length === 0) {
      // 18.2.2.8 (simplification)
      G = A;
    } else if (A.type === types.BGP && A.patterns.length === 0) {
      // Do nothing
    } else {
      G = AF.createJoin([ G, A ]);
    }
    return G;
  },
};
