import type * as RDF from '@rdfjs/types';
import type {
  BasicGraphPattern,
  Expression,
  Ordering,
  Pattern,
  PatternBind,
  PatternGroup,
  QueryBase,
  QuerySelect,
  SolutionModifierGroupBind,
  Sparql11Nodes,
  TermVariable,
} from '@traqula/rules-sparql-1-1';
import type { Algebra } from '../index.js';
import { types } from '../toAlgebra/index.js';
import type { AstIndir } from './core.js';
import { resetContext } from './core.js';
import { translateAlgExpressionOrOrdering, translateAlgPureExpression } from './expression.js';
import type { RdfTermToAst } from './general.js';
import { translateAlgPattern, translateAlgTerm } from './general.js';
import { translateAlgPatternNew } from './pattern.js';

export const translateAlgConstruct: AstIndir<'translateConstruct', PatternGroup, [Algebra.Construct]> = {
  name: 'translateConstruct',
  fun: ({ SUBRULE }) => ({ astFactory: F, order }, op) => {
    const queryConstruct = F.queryConstruct(
      F.gen(),
      [],
      F.patternBgp(<BasicGraphPattern> op.template.map(x => SUBRULE(translateAlgPattern, x)), F.gen()),
      F.patternGroup([ SUBRULE(translateAlgPatternNew, op.input) ].flat(), F.gen()),
      {},
      F.datasetClauses([], F.gen()),
    );
    SUBRULE(registerOrderBy, queryConstruct);
    order.length = 0;
    // Subqueries need to be in a group! Top level grouping is removed at toAst function
    //  - for consistency with the other operators, we also wrap here.
    return F.patternGroup([ <Pattern> <unknown> queryConstruct ], F.gen());
  },
};

// Separate terms from wildcard since we handle them differently
function isSimpleTerm(term: any): term is RDF.Term {
  return term.termType !== undefined && term.termType !== 'Quad' && term.termType !== 'wildcard' &&
    term.termType !== 'Wildcard';
}

/**
 * Will mostly return the same type as what you give in second arg.
 */
export const replaceAlgAggregatorVariables:
AstIndir<'replaceAggregatorVariables', unknown, [unknown, Record<string, Expression>]> = {
  name: 'replaceAggregatorVariables',
  fun: ({ SUBRULE }) => ({ astFactory: F }, s, map) => {
    const st: Sparql11Nodes = isSimpleTerm(s) ? SUBRULE(translateAlgTerm, s) : <Sparql11Nodes> s;

    // Look for TermVariable, if we find, replace it by the aggregator.
    if (F.isTermVariable(st)) {
      if (map[st.value]) {
        // Returns the ExpressionAggregate
        return map[st.value];
      }
    } else if (Array.isArray(s)) {
      s = s.map(e => SUBRULE(replaceAlgAggregatorVariables, e, map));
    } else if (typeof s === 'object') {
      const obj = <Record<string, any>> s;
      for (const key of Object.keys(obj)) {
        obj[key] = SUBRULE(replaceAlgAggregatorVariables, obj[key], map);
      }
    }
    return s;
  },
};

export const translateAlgProject:
AstIndir<'translateProject', PatternGroup, [Algebra.Project | Algebra.Ask | Algebra.Describe, string]> = {
  name: 'translateProject',
  fun: ({ SUBRULE }) => (c, op, type) => {
    const F = c.astFactory;
    const result: QueryBase = <any> {
      type: 'query',
      solutionModifiers: {},
      loc: F.gen(),
      datasets: F.datasetClauses([], F.gen()),
      context: [],
    } satisfies Partial<QueryBase>;

    // Makes typing easier in some places
    const select = <QuerySelect> result;
    let variables: RDF.Variable[] | undefined;

    if (type === types.PROJECT) {
      result.subType = 'select';
      variables = (<Algebra.Project>op).variables;
    } else if (type === types.ASK) {
      result.subType = 'ask';
    } else if (type === types.DESCRIBE) {
      result.subType = 'describe';
      variables = <RDF.Variable[]>(<Algebra.Describe>op).terms;
    }

    // Backup values in case of nested queries
    // everything in extend, group, etc. is irrelevant for this project call
    const extend = c.extend;
    const group = c.group;
    const aggregates = c.aggregates;
    const order = c.order;
    SUBRULE(resetContext);
    c.project = true;

    // TranslateOperation could give an array.
    let input = [ SUBRULE(translateAlgPatternNew, op.input) ].flat();
    if (input.length === 1 && F.isPatternGroup(input[0])) {
      input = (input[0]).patterns;
    }
    result.where = F.patternGroup(input, F.gen());

    // Map from variable to what agg it represents
    const aggregators: Record<string, Expression> = {};
    // These can not reference each other
    for (const agg of c.aggregates) {
      aggregators[(<RdfTermToAst<typeof agg.variable>>SUBRULE(translateAlgTerm, agg.variable)).value] =
        SUBRULE(translateAlgPureExpression, agg);
    }

    // Do these in reverse order since variables in one extend might apply to an expression in another extend
    const extensions: Record<string, Expression> = {};
    for (const e of c.extend.reverse()) {
      const expr = SUBRULE(translateAlgPureExpression, e.expression);
      extensions[(<RdfTermToAst<typeof e.variable>>SUBRULE(translateAlgTerm, e.variable)).value] =
        <typeof expr>SUBRULE(replaceAlgAggregatorVariables, expr, aggregators);
    }
    SUBRULE(registerAlgGroupBy, result, extensions);
    SUBRULE(registerOrderBy, result);
    SUBRULE(registerVariables, select, variables, extensions);
    SUBRULE(putExtensionsInGroup, result, extensions);

    // Convert all filters to 'having' if it contains an aggregator variable
    // could always convert, but is nicer to keep as filter when possible
    const havings: Expression[] = [];
    result.where = <PatternGroup> SUBRULE(filterReplace, result.where, aggregators, havings);
    if (havings.length > 0) {
      select.solutionModifiers.having = F.solutionModifierHaving(havings, F.gen());
    }

    // Recover state
    c.extend = extend;
    c.group = group;
    c.aggregates = aggregates;
    c.order = order;

    // Subqueries need to be in a group! Top level grouping is removed at toAst function
    return F.patternGroup([ select ], F.gen());
  },
};

export const registerAlgGroupBy: AstIndir<'registerGroupBy', void, [QueryBase, Record<string, Expression>]> = {
  name: 'registerGroupBy',
  fun: ({ SUBRULE }) => ({ astFactory: F, group }, result, extensions) => {
    if (group.length > 0) {
      result.solutionModifiers.group = F.solutionModifierGroup(
        group.map((variable) => {
          const v = <RdfTermToAst<typeof variable>>SUBRULE(translateAlgTerm, variable);
          if (extensions[v.value]) {
            const result = extensions[v.value];
            // Make sure there is only 1 'AS' statement
            delete extensions[v.value];
            return {
              variable: v,
              value: result,
              loc: F.gen(),
            } satisfies SolutionModifierGroupBind;
          }
          return v;
        }),
        F.gen(),
      );
    }
  },
};

export const registerOrderBy: AstIndir<'registerOrderBy', void, [QueryBase]> = {
  name: 'registerOrderBy',
  fun: ({ SUBRULE }) => ({ astFactory: F, order }, result) => {
    if (order.length > 0) {
      result.solutionModifiers.order = F.solutionModifierOrder(
        order
          .map(x => SUBRULE(translateAlgExpressionOrOrdering, x))
          .map((o: Ordering | Expression) =>
            F.isExpression(o) ?
                ({
                  expression: o,
                  descending: false,
                  loc: F.gen(),
                } satisfies Ordering) :
              o),
        F.gen(),
      );
    }
  },
};

export const registerVariables:
AstIndir<'registerVariables', void, [QuerySelect, RDF.Variable[] | undefined, Record<string, Expression>]> = {
  name: 'registerVariables',
  fun: ({ SUBRULE }) => ({ astFactory: F }, select, variables, extensions) => {
    if (variables) {
      select.variables = variables.map((term): TermVariable | PatternBind => {
        const v = <RdfTermToAst<typeof term>>SUBRULE(translateAlgTerm, term);
        if (extensions[v.value]) {
          const result: Expression = extensions[v.value];
          // Remove used extensions so only unused ones remain
          delete extensions[v.value];
          return F.patternBind(result, v, F.gen());
        }
        return v;
      });
      // If the * didn't match any variables this would be empty
      if (select.variables.length === 0) {
        select.variables = [ F.wildcard(F.gen()) ];
      }
    }
  },
};

/**
 * It is possible that at this point some extensions have not yet been resolved.
 * These would be bind operations that are not used in a GROUP BY or SELECT body.
 * We still need to add them though, as they could be relevant to the other extensions.
 */
export const putExtensionsInGroup: AstIndir<'putExtensionsInGroup', void, [QueryBase, Record<string, Expression>]> = {
  name: 'putExtensionsInGroup',
  fun: () => ({ astFactory: F }, result, extensions) => {
    const extensionEntries = Object.entries(extensions);
    if (extensionEntries.length > 0) {
      result.where = result.where ?? F.patternGroup([], F.gen());
      for (const [ key, value ] of extensionEntries) {
        result.where.patterns.push(
          F.patternBind(
            value,
            F.termVariable(key, F.gen()),
            F.gen(),
          ),
        );
      }
    }
  },
};

/**
 * If second arg is a Group, we will return a group.
 */
export const filterReplace: AstIndir<
  'filterReplace',
PatternGroup | Pattern,
[PatternGroup | Pattern, Record<string, Expression>, Expression[]]
> = {
  name: 'filterReplace',
  fun: ({ SUBRULE }) => ({ astFactory: F }, group, aggregators, havings) => {
    if (!F.isPatternGroup(group)) {
      return group;
    }
    const patterns = group.patterns
      .map(x => SUBRULE(filterReplace, x, aggregators, havings))
      .flatMap((pattern) => {
        if (F.isPatternFilter(pattern) && SUBRULE(objectContainsVariable, pattern, Object.keys(aggregators))) {
          havings.push(
            <typeof pattern.expression>SUBRULE(replaceAlgAggregatorVariables, pattern.expression, aggregators),
          );
          return [];
        }
        return [ pattern ];
      });
    return F.patternGroup(patterns, F.gen());
  },
};

export const objectContainsVariable: AstIndir<'objectContainsVariable', boolean, [any, string[]]> = {
  name: 'objectContainsVariable',
  fun: ({ SUBRULE }) => ({ astFactory: F }, o, vals) => {
    const casted = <Sparql11Nodes> o;
    if (F.isTermVariable(casted)) {
      return vals.includes(casted.value);
    }
    if (Array.isArray(o)) {
      return o.some(e => SUBRULE(objectContainsVariable, e, vals));
    }
    if (o === Object(o)) {
      return Object.keys(o).some(key => SUBRULE(objectContainsVariable, o[key], vals));
    }
    return false;
  },
};
