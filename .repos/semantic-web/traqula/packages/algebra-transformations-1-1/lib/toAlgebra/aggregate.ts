import type * as RDF from '@rdfjs/types';
import type {
  Expression,
  ExpressionAggregate,
  Ordering,
  PatternBind,
  Query,
  TermIri,
  TermVariable,
  Wildcard,
} from '@traqula/rules-sparql-1-1';
import equal from 'fast-deep-equal';
import type { Algebra } from '../index.js';
import type { AlgebraIndir, FlattenedTriple } from './core.js';
import {
  type AstToRdfTerm,
  generateFreshVar,
  inScopeVariables,
  translateDatasetClause,
  translateInlineData,
  translateTerm,
} from './general.js';
import { translateExpression } from './patterns.js';
import { translateBasicGraphPattern, translateQuad } from './tripleAndQuad.js';

/**
 * 18.2.4
 */
export const translateAggregates: AlgebraIndir<'translateAggregates', Algebra.Operation, [Query, Algebra.Operation]> = {
  name: 'translateAggregates',
  fun: ({ SUBRULE }) => ({ astFactory: F, algebraFactory: AF, dataFactory: DF }, query, res) => {
    const bindPatterns: PatternBind[] = [];

    const varAggrMap: Record<string, ExpressionAggregate> = {};
    const variables = F.isQuerySelect(query) || F.isQueryDescribe(query) ?
      query.variables.map(x => SUBRULE(mapAggregate, x, varAggrMap)) :
      undefined;
    const having = query.solutionModifiers.having ?
      query.solutionModifiers.having.having.map(x => <typeof x>SUBRULE(mapAggregate, x, varAggrMap)) :
      undefined;
    const order = query.solutionModifiers.order ?
      query.solutionModifiers.order.orderDefs.map(x => <typeof x>SUBRULE(mapAggregate, x, varAggrMap)) :
      undefined;

    // Step: GROUP BY - If we found an aggregate, in group by or implicitly, do Group function.
    // 18.2.4.1 Grouping and Aggregation
    if (query.solutionModifiers.group ?? Object.keys(varAggrMap).length > 0) {
      const aggregates = Object.keys(varAggrMap).map(var_ =>
        SUBRULE(translateBoundAggregate, varAggrMap[var_], DF.variable(var_)));
      const vars: RDF.Variable[] = [];
      if (query.solutionModifiers.group) {
        for (const expression of query.solutionModifiers.group.groupings) {
          // https://www.w3.org/TR/sparql11-query/#rGroupCondition
          if (F.isTerm(expression)) {
            // This will always be a var, otherwise sparql would be invalid
            vars.push(<RDF.Variable>SUBRULE(translateTerm, expression));
          } else {
            let var_: RDF.Variable;
            let expr: Expression;
            if ('variable' in expression) {
              var_ = <AstToRdfTerm<typeof expression.variable>>SUBRULE(translateTerm, expression.variable);
              expr = expression.value;
            } else {
              var_ = SUBRULE(generateFreshVar);
              expr = expression;
            }
            res = AF.createExtend(res, var_, SUBRULE(translateExpression, expr));
            vars.push(var_);
          }
        }
      }
      res = AF.createGroup(res, vars, aggregates);
    }

    // 18.2.4.2
    if (having) {
      for (const filter of having) {
        res = AF.createFilter(res, SUBRULE(translateExpression, filter));
      }
    }

    // 18.2.4.3
    if (query.values) {
      res = AF.createJoin([ res, SUBRULE(translateInlineData, query.values) ]);
    }

    // 18.2.4.4
    let PatternValues: (RDF.Variable | RDF.NamedNode)[] = [];

    if (variables) {
      // Sort variables for consistent output
      if (variables.some(wild => F.isWildcard(wild))) {
        PatternValues = [ ...SUBRULE(inScopeVariables, query).values() ].map(x => DF.variable(x))
          .sort((left, right) => left.value.localeCompare(right.value));
      } else {
        // Wildcard has been filtered out above
        for (const var_ of <(TermVariable | TermIri | PatternBind)[]> variables) {
          // Can have non-variables with DESCRIBE
          if (F.isTerm(var_)) {
            PatternValues.push(<AstToRdfTerm<typeof var_>>SUBRULE(translateTerm, var_));
          } else {
            // ... AS ?x
            PatternValues.push(<AstToRdfTerm<typeof var_.variable>>SUBRULE(translateTerm, var_.variable));
            bindPatterns.push(var_);
          }
        }
      }
    }

    // TODO: Jena simplifies by having a list of extends
    for (const bind of bindPatterns) {
      res = AF.createExtend(
        res,
        <AstToRdfTerm<typeof bind.variable>>SUBRULE(translateTerm, bind.variable),
        SUBRULE(translateExpression, bind.expression),
      );
    }

    // 18.2.5
    // not using toList and toMultiset

    // 18.2.5.1
    if (order) {
      res = AF.createOrderBy(res, order.map((expr) => {
        let result = SUBRULE(translateExpression, expr.expression);
        if (expr.descending) {
          result = AF.createOperatorExpression('desc', [ result ]);
        }
        return result;
      }));
    }

    // 18.2.5.2
    // construct does not need a project (select, ask and describe do)
    if (F.isQuerySelect(query)) {
      // Named nodes are only possible in a DESCRIBE so this cast is safe
      res = AF.createProject(res, <RDF.Variable[]> PatternValues);
    }

    // 18.2.5.3
    if ((<{ distinct?: unknown }>query).distinct) {
      res = AF.createDistinct(res);
    }

    // 18.2.5.4
    if ((<{ reduced?: unknown }>query).reduced) {
      res = AF.createReduced(res);
    }

    if (F.isQueryConstruct(query)) {
      const triples: FlattenedTriple[] = [];
      SUBRULE(translateBasicGraphPattern, query.template.triples, triples);
      res = AF.createConstruct(res, triples.map(quad => SUBRULE(translateQuad, quad)));
    } else if (F.isQueryAsk(query)) {
      res = AF.createAsk(res);
    } else if (F.isQueryDescribe(query)) {
      res = AF.createDescribe(res, PatternValues);
    }

    // Slicing needs to happen after construct/describe
    // 18.2.5.5
    const limitOffset = query.solutionModifiers.limitOffset;
    if (limitOffset?.limit ?? limitOffset?.offset) {
      res = AF.createSlice(res, limitOffset.offset ?? 0, limitOffset.limit);
    }

    if (query.datasets.clauses.length > 0) {
      const clauses = SUBRULE(translateDatasetClause, query.datasets);
      res = AF.createFrom(res, clauses.default, clauses.named);
    }

    return res;
  },
};

export type MapAggregateType = Wildcard | Expression | Ordering | PatternBind;

/**
 * Rewrites some of the input sparql object to make use of aggregate variables
 * It thus replaces aggregates by their representative variable and registers the mapping.
 */
export const mapAggregate:
AlgebraIndir<'mapAggregate', MapAggregateType, [MapAggregateType, Record<string, ExpressionAggregate>]> = {
  name: 'mapAggregate',
  fun: ({ SUBRULE }) => ({ astFactory: F }, thingy, aggregates): MapAggregateType => {
    if (F.isExpressionAggregate(thingy)) {
      // Needed to take away the difference in the various `loc` descriptions
      const canonicalAggregate = F.forcedAutoGenTree<ExpressionAggregate>(thingy);
      let val: TermVariable | undefined;
      // Look for the matching aggregate
      for (const [ key, aggregate ] of Object.entries(aggregates)) {
        if (equal(aggregate, canonicalAggregate)) {
          val = F.termVariable(key, F.sourceLocation());
          break;
        }
      }
      if (val !== undefined) {
        return val;
      }
      const freshVar = SUBRULE(generateFreshVar);
      aggregates[freshVar.value] = canonicalAggregate;
      return F.termVariable(freshVar.value, F.sourceLocation());
    }

    if (F.isExpressionPure(thingy) && !F.isExpressionPatternOperation(thingy)) {
      return { ...thingy, args: thingy.args.map(x => <typeof x>SUBRULE(mapAggregate, x, aggregates)) };
    }
    // Non-aggregate expression
    if ('expression' in thingy && thingy.expression) {
      return { ...thingy, expression: <typeof thingy.expression>SUBRULE(mapAggregate, thingy.expression, aggregates) };
    }
    return thingy;
  },
};

export const translateBoundAggregate:
AlgebraIndir<'translateBoundAggregate', Algebra.BoundAggregate, [ExpressionAggregate, RDF.Variable]> = {
  name: 'translateBoundAggregate',
  fun: ({ SUBRULE }) => (_, thingy, variable) => {
    const A = <Algebra.AggregateExpression> SUBRULE(translateExpression, thingy);
    return { ...A, variable };
  },
};
