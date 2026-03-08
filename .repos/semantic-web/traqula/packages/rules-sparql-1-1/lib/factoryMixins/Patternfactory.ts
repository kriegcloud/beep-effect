import type { AstCoreFactory, SourceLocation, Typed, SubTyped } from '@traqula/core';
import type {
  BasicGraphPattern,
  Expression,
  Pattern,
  PatternBgp,
  PatternBind,
  PatternFilter,
  PatternGraph,
  PatternGroup,
  PatternMinus,
  PatternOptional,
  PatternService,
  PatternUnion,
  PatternValues,
  TermIri,
  TermVariable,
  ValuePatternRow,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'pattern';
const nodeType: NodeType = 'pattern';

// eslint-disable-next-line ts/explicit-function-return-type
export function PatternFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class PatternFactory extends Base {
    public isPattern(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public patternBgp(triples: BasicGraphPattern, loc: SourceLocation): PatternBgp {
      return { type: nodeType, subType: 'bgp', triples, loc };
    }

    public isPatternBgp(obj: object): obj is SubTyped<NodeType, 'bgp'> {
      return this.isOfSubType(obj, nodeType, 'bgp');
    }

    public patternGroup(patterns: Pattern[], loc: SourceLocation): PatternGroup {
      return { type: nodeType, subType: 'group', patterns, loc };
    }

    public isPatternGroup(obj: object): obj is SubTyped<NodeType, 'group'> {
      return this.isOfSubType(obj, nodeType, 'group');
    }

    public patternGraph(name: TermIri | TermVariable, patterns: Pattern[], loc: SourceLocation): PatternGraph {
      return { type: nodeType, subType: 'graph', name, patterns, loc };
    }

    public isPatternGraph(obj: object): obj is SubTyped<NodeType, 'graph'> {
      return this.isOfSubType(obj, nodeType, 'graph');
    }

    public patternOptional(patterns: Pattern[], loc: SourceLocation): PatternOptional {
      return { type: nodeType, subType: 'optional', patterns, loc };
    }

    public isPatternOptional(obj: object): obj is SubTyped<NodeType, 'optional'> {
      return this.isOfSubType(obj, nodeType, 'optional');
    }

    public patternValues(variables: TermVariable[], values: ValuePatternRow[], loc: SourceLocation): PatternValues {
      return { type: nodeType, subType: 'values', variables, values, loc };
    }

    public isPatternValues(obj: object): obj is SubTyped<NodeType, 'values'> {
      return this.isOfSubType(obj, nodeType, 'values');
    }

    public patternFilter(expression: Expression, loc: SourceLocation): PatternFilter {
      return {
        type: nodeType,
        subType: 'filter',
        expression,
        loc,
      };
    }

    public isPatternFilter(obj: object): obj is SubTyped<NodeType, 'filter'> {
      return this.isOfSubType(obj, nodeType, 'filter');
    }

    public patternBind(
      expression: Expression,
      variable: TermVariable,
      loc: SourceLocation,
    ): PatternBind {
      return {
        type: nodeType,
        subType: 'bind',
        expression,
        variable,
        loc,
      };
    }

    public isPatternBind(obj: object): obj is SubTyped<NodeType, 'bind'> {
      return this.isOfSubType(obj, nodeType, 'bind');
    }

    public patternUnion(patterns: PatternGroup[], loc: SourceLocation): PatternUnion {
      return {
        type: nodeType,
        subType: 'union',
        patterns,
        loc,
      };
    }

    public isPatternUnion(obj: object): obj is SubTyped<NodeType, 'union'> {
      return this.isOfSubType(obj, nodeType, 'union');
    }

    public patternMinus(patterns: Pattern[], loc: SourceLocation): PatternMinus {
      return {
        type: nodeType,
        subType: 'minus',
        patterns,
        loc,
      };
    }

    public isPatternMinus(obj: object): obj is SubTyped<NodeType, 'minus'> {
      return this.isOfSubType(obj, nodeType, 'minus');
    }

    public patternService(
      name: TermIri | TermVariable,
      patterns: Pattern[],
      silent: boolean,
      loc: SourceLocation,
    ): PatternService {
      return {
        type: nodeType,
        subType: 'service',
        silent,
        name,
        patterns,
        loc,
      };
    }

    public isPatternService(obj: object): obj is SubTyped<NodeType, 'service'> {
      return this.isOfSubType(obj, nodeType, 'service');
    }
  };
}
