import type {
  Pattern,
  PatternBgp,
  PatternGraph,
  PatternGroup,
  PatternService,
  PatternUnion,
  PatternValues,
  QueryBase,
  ValuePatternRow,
} from '@traqula/rules-sparql-1-1';
import type * as Algebra from '../algebra.js';
import { types } from '../toAlgebra/index.js';
import type { AstIndir } from './core.js';
import { registerProjection } from './core.js';
import { translateAlgPureExpression } from './expression.js';
import type {
  RdfTermToAst,
} from './general.js';
import {
  translateAlgDatasetClauses,
  translateAlgDistinct,
  translateAlgExtend,
  translateAlgOrderBy,
  translateAlgPattern,
  translateAlgReduced,
  translateAlgTerm,
} from './general.js';
import { translateAlgPathComponent } from './path.js';
import { translateAlgConstruct, translateAlgProject } from './queryUnit.js';

export const translateAlgPatternIntoGroup: AstIndir<'translatePatternIntoGroup', PatternGroup, [Algebra.Operation]> = {
  name: 'translatePatternIntoGroup',
  fun: ({ SUBRULE }) => (_, op) => {
    switch (op.type) {
      case types.ASK: return SUBRULE(translateAlgProject, op, types.ASK);
      case types.PROJECT: return SUBRULE(translateAlgProject, op, types.PROJECT);
      case types.CONSTRUCT: return SUBRULE(translateAlgConstruct, op);
      case types.DESCRIBE: return SUBRULE(translateAlgProject, op, types.DESCRIBE);
      case types.DISTINCT: return SUBRULE(translateAlgDistinct, op);
      case types.FROM: return SUBRULE(translateAlgFrom, op);
      case types.FILTER: return SUBRULE(translateAlgFilter, op);
      case types.REDUCED: return SUBRULE(translateAlgReduced, op);
      case types.SLICE: return SUBRULE(translateAlgSlice, op);
      default:
        throw new Error(`Unknown Operation type ${op.type}`);
    }
  },
};

export const translateAlgSinglePattern: AstIndir<'translateSinglePattern', Pattern, [Algebra.Operation]> = {
  name: 'translateSinglePattern',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) => {
    SUBRULE(registerProjection, op);
    switch (op.type) {
      case types.PATH: return SUBRULE(translateAlgPath, op);
      case types.BGP: return SUBRULE(translateAlgBgp, op);
      case types.GRAPH: return SUBRULE(translateAlgGraph, op);
      case types.SERVICE: return SUBRULE(translateAlgService, op);
      case types.UNION: return SUBRULE(translateAlgUnion, op);
      case types.VALUES: return SUBRULE(translateAlgValues, op);
      case types.PATTERN: return F.patternBgp([ SUBRULE(translateAlgPattern, op) ], F.gen());
      default:
        return SUBRULE(translateAlgPatternIntoGroup, op);
    }
  },
};

export const translateAlgPatternNew: AstIndir<'translatePatternNew', Pattern | Pattern[], [Algebra.Operation]> = {
  name: 'translatePatternNew',
  fun: ({ SUBRULE }) => (_, op) => {
    SUBRULE(registerProjection, op);
    switch (op.type) {
      case types.ORDER_BY: return SUBRULE(translateAlgOrderBy, op);
      case types.GROUP: return SUBRULE(translateAlgGroup, op);
      case types.EXTEND: return SUBRULE(translateAlgExtend, op);
      case types.JOIN: return SUBRULE(translateAlgJoin, op);
      case types.LEFT_JOIN: return SUBRULE(translateAlgLeftJoin, op);
      case types.MINUS: return SUBRULE(translateAlgMinus, op);
      default:
        return SUBRULE(translateAlgSinglePattern, op);
    }
  },
};

/**
 * These get translated in the project function
 */
export const translateAlgBoundAggregate:
AstIndir<'translateBoundAggregate', Algebra.BoundAggregate, [Algebra.BoundAggregate]> = {
  name: 'translateBoundAggregate',
  fun: () => (_, op) => op,
};

export const translateAlgBgp: AstIndir<'translateBgp', PatternBgp, [Algebra.Bgp]> = {
  name: 'translateBgp',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) => {
    const patterns = op.patterns.map(triple => SUBRULE(translateAlgPattern, triple));
    return F.patternBgp(patterns, F.gen());
  },
};

export const translateAlgPath: AstIndir<'translatePath', PatternBgp, [Algebra.Path]> = {
  name: 'translatePath',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) => F.patternBgp([
    F.triple(
      SUBRULE(translateAlgTerm, op.subject),
      SUBRULE(translateAlgPathComponent, op.predicate),
      SUBRULE(translateAlgTerm, op.object),
    ),
  ], F.gen()),
};

/**
 * A from needs to be registered to the solutionModifiers.
 * Similar to {@link translateAlgDistinct}
 */
export const translateAlgFrom: AstIndir<'translateFrom', PatternGroup, [Algebra.From]> = {
  name: 'translateFrom',
  fun: ({ SUBRULE }) => (_, op) => {
    const result = SUBRULE(translateAlgPatternIntoGroup, op.input);
    const query = <QueryBase> result.patterns[0];
    query.datasets = SUBRULE(translateAlgDatasetClauses, op.default, op.named);
    return result;
  },
};

/**
 * A patternFilter closes the group
 */
export const translateAlgFilter: AstIndir<'translateFilter', PatternGroup, [Algebra.Filter]> = {
  name: 'translateFilter',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) =>
    F.patternGroup(
      [
        SUBRULE(translateAlgPatternNew, op.input),
        F.patternFilter(SUBRULE(translateAlgPureExpression, op.expression), F.gen()),
      ].flat(),
      F.gen(),
    ),
};

export const translateAlgGraph: AstIndir<'translateGraph', PatternGraph, [Algebra.Graph]> = {
  name: 'translateGraph',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) =>
    F.patternGraph(
      <RdfTermToAst<typeof op.name>>SUBRULE(translateAlgTerm, op.name),
      [ SUBRULE(translateAlgPatternNew, op.input) ].flat(),
      F.gen(),
    ),
};

/**
 * A group needs to be handled by {@link translateAlgProject}
 */
export const translateAlgGroup: AstIndir<'translateGroup', Pattern | Pattern[], [Algebra.Group]> = {
  name: 'translateGroup',
  fun: ({ SUBRULE }) => ({ aggregates, group }, op) => {
    const input = SUBRULE(translateAlgPatternNew, op.input);
    const aggs = op.aggregates.map(x => SUBRULE(translateAlgBoundAggregate, x));
    aggregates.push(...aggs);
    // TODO: apply possible extends
    group.push(...op.variables);
    return input;
  },
};

export const translateAlgJoin: AstIndir<'translateJoin', Pattern[], [Algebra.Join]> = {
  name: 'translateJoin',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) => {
    const arr = op.input.flatMap(x => SUBRULE(translateAlgPatternNew, x));

    // Merge bgps
    // This is possible if one side was a path and the other a bgp for example
    const result: Pattern[] = [];
    for (const val of arr) {
      const lastResult = result.at(-1);
      if (!F.isPatternBgp(val) || result.length === 0 || !F.isPatternBgp(lastResult!)) {
        result.push(val);
      } else {
        lastResult.triples.push(...val.triples);
      }
    }
    return result;
  },
};

export const translateAlgLeftJoin: AstIndir<'translateLeftJoin', Pattern[], [Algebra.LeftJoin]> = {
  name: 'translateLeftJoin',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) => {
    const leftJoin = F.patternOptional(
      SUBRULE(operationAlgInputAsPatternList, op.input[1]),
      F.gen(),
    );

    if (op.expression) {
      leftJoin.patterns.push(
        F.patternFilter(SUBRULE(translateAlgPureExpression, op.expression), F.gen()),
      );
    }
    leftJoin.patterns = leftJoin.patterns.filter(Boolean);

    return [
      SUBRULE(translateAlgPatternNew, op.input[0]),
      leftJoin,
    ].flat();
  },
};

export const translateAlgMinus: AstIndir<'translateMinus', Pattern[], [Algebra.Minus]> = {
  name: 'translateMinus',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) =>
    [
      SUBRULE(translateAlgPatternNew, op.input[0]),
      F.patternMinus(SUBRULE(operationAlgInputAsPatternList, op.input[1]), F.gen()),
    ].flat(),
};

export const translateAlgService: AstIndir<'translateService', PatternService, [Algebra.Service]> = {
  name: 'translateService',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) =>
    F.patternService(
      <RdfTermToAst<typeof op.name>> SUBRULE(translateAlgTerm, op.name),
      SUBRULE(operationAlgInputAsPatternList, op.input),
      op.silent,
      F.gen(),
    ),
};

/**
 * Unwrap single group patterns, create array if it was not yet.
 */
export const operationAlgInputAsPatternList: AstIndir<'operationInputAsPatternList', Pattern[], [Algebra.Operation]> = {
  name: 'operationInputAsPatternList',
  fun: ({ SUBRULE }) => (_, input) => {
    const result = SUBRULE(translateAlgPatternNew, input);
    // If (result && F.isPatternGroup(result)) {
    //   return result.patterns;
    // }
    return result ? (Array.isArray(result) ? result : [ result ]) : [];
  },
};

/**
 * A limit offset needs to be registered to the solutionModifiers.
 * Similar to {@link translateAlgDistinct}
 */
export const translateAlgSlice: AstIndir<'translateSlice', PatternGroup, [Algebra.Slice]> = {
  name: 'translateSlice',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) => {
    const result = SUBRULE(translateAlgPatternIntoGroup, op.input);
    const query = <QueryBase>result.patterns[0];
    if (op.start !== 0) {
      query.solutionModifiers.limitOffset = query.solutionModifiers.limitOffset ??
        F.solutionModifierLimitOffset(undefined, op.start, F.gen());
      query.solutionModifiers.limitOffset.offset = op.start;
    }
    if (op.length !== undefined) {
      query.solutionModifiers.limitOffset = query.solutionModifiers.limitOffset ??
        F.solutionModifierLimitOffset(op.length, undefined, F.gen());
      query.solutionModifiers.limitOffset.limit = op.length;
    }
    return result;
  },
};

export const algWrapInPatternGroup: AstIndir<'wrapInPatternGroup', PatternGroup, [Pattern[] | Pattern]> = {
  name: 'wrapInPatternGroup',
  fun: () => ({ astFactory: F }, input) => {
    if (Array.isArray(input)) {
      return F.patternGroup(input, F.gen());
    }
    if (F.isPatternGroup(input)) {
      return input;
    }
    return F.patternGroup([ input ], F.gen());
  },
};

export const translateAlgUnion: AstIndir<'translateUnion', PatternUnion, [Algebra.Union]> = {
  name: 'translateUnion',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) =>
    F.patternUnion(
      op.input.map(operation => SUBRULE(algWrapInPatternGroup, SUBRULE(translateAlgPatternNew, operation))),
      F.gen(),
    ),
};

export const translateAlgValues: AstIndir<'translateValues', PatternValues, [Algebra.Values]> = {
  name: 'translateValues',
  fun: ({ SUBRULE }) => ({ astFactory: F }, op) =>
    F.patternValues(
      op.variables.map(variable => F.termVariable(variable.value, F.gen())),
      op.bindings.map((binding) => {
        const result: ValuePatternRow = {};
        for (const v of op.variables) {
          const s = v.value;
          if (binding[s]) {
            result[s] = <RdfTermToAst<typeof binding[typeof s]>> SUBRULE(translateAlgTerm, binding[s]);
          } else {
            result[s] = undefined;
          }
        }
        return result;
      }),
      F.gen(),
    ),
};
