import type { AstCoreFactory, SourceLocation, Typed, SubTyped } from '@traqula/core';
import type {
  Expression,
  ExpressionAggregate,
  ExpressionAggregateDefault,
  ExpressionAggregateOnWildcard,
  ExpressionAggregateSeparator,
  ExpressionFunctionCall,
  ExpressionOperation,
  ExpressionPatternOperation,
  PatternGroup,
  TermIri,
  Wildcard,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'expression';
const nodeType: NodeType = 'expression';

// eslint-disable-next-line ts/explicit-function-return-type
export function ExpressionFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class ExpressionFactory extends Base {
    public isExpressionPure(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public formatOperator(operator: string): string {
      return operator.toLowerCase().replaceAll(' ', '');
    }

    public expressionOperation<Args extends Expression[]>(
      operator: string,
      args: Args,
      loc: SourceLocation,
    ): ExpressionOperation & { args: Args } {
      return {
        type: nodeType,
        subType: 'operation',
        operator: this.formatOperator(operator),
        args,
        loc,
      };
    }

    public isExpressionOperator(obj: object): obj is SubTyped<NodeType, 'operation'> {
      return this.isOfSubType(obj, nodeType, 'operation');
    }

    public expressionFunctionCall<Args extends Expression[]>(
      functionOp: TermIri,
      args: Args,
      distinct: boolean,
      loc: SourceLocation,
    ): ExpressionFunctionCall & { args: Args } {
      return {
        type: 'expression',
        subType: 'functionCall',
        function: functionOp,
        args,
        distinct,
        loc,
      };
    }

    public isExpressionFunctionCall(obj: object): obj is SubTyped<NodeType, 'functionCall'> {
      return this.isOfSubType(obj, nodeType, 'functionCall');
    }

    public expressionPatternOperation(
      operator: string,
      args: PatternGroup,
      loc: SourceLocation,
    ): ExpressionPatternOperation {
      return {
        type: nodeType,
        subType: 'patternOperation',
        operator: this.formatOperator(operator),
        args,
        loc,
      };
    }

    public isExpressionPatternOperation(obj: object): obj is SubTyped<NodeType, 'patternOperation'> {
      return this.isOfSubType(obj, nodeType, 'patternOperation');
    }

    public aggregate(
      aggregation: string,
      distinct: boolean,
      arg: Expression,
      separator: undefined,
      loc: SourceLocation
    ): ExpressionAggregateDefault;
    public aggregate(
      aggregation: string,
      distinct: boolean,
      arg: Wildcard,
      separator: undefined,
      loc: SourceLocation
    ): ExpressionAggregateOnWildcard;
    public aggregate(
      aggregation: string,
      distinct: boolean,
      arg: Expression,
      separator: string,
      loc: SourceLocation
    ): ExpressionAggregateSeparator;
    public aggregate(
      aggregation: string,
      distinct: boolean,
      arg: Expression | Wildcard,
      separator: string | undefined,
      loc: SourceLocation,
    ): ExpressionAggregate;
    public aggregate(
      aggregation: string,
      distinct: boolean,
      arg: Expression | Wildcard,
      separator: string | undefined,
      loc: SourceLocation,
    ): ExpressionAggregate {
      const base = <const> {
        type: 'expression',
        subType: 'aggregate',
        aggregation: this.formatOperator(aggregation),
        distinct,
        loc,
      };
      if (this.isOfType(arg, 'wildcard')) {
        return { ...base, expression: [ arg ]} satisfies ExpressionAggregateOnWildcard;
      }
      if (separator === undefined) {
        return { ...base, expression: [ arg ]} satisfies ExpressionAggregateDefault;
      }
      return { ...base, expression: [ arg ], separator } satisfies ExpressionAggregateSeparator;
    }

    public isExpressionAggregate(obj: object): obj is SubTyped<NodeType, 'aggregate'> {
      return this.isOfSubType(obj, nodeType, 'aggregate');
    }

    public isExpressionAggregateSeparator(obj: object): obj is SubTyped<NodeType, 'aggregate'> & { separator: string } {
      return this.isOfSubType(obj, nodeType, 'aggregate') &&
        typeof (<{ separator?: unknown }> obj).separator === 'string';
    }

    public isExpressionAggregateOnWildcard(obj: object):
      obj is SubTyped<NodeType, 'aggregate'> & { expression: [Typed<'wildcard'>]} {
      const casted = <{ expression?: unknown }> obj;
      return this.isOfSubType(obj, nodeType, 'aggregate') && Array.isArray(casted.expression) &&
        casted.expression.length === 1 && this.isOfType(casted.expression[0], 'wildcard');
    }

    public isExpressionAggregateDefault(obj: object):
      obj is SubTyped<NodeType, 'aggregate'> & { expression: [Expression]} {
      const casted = <{ expression?: unknown }> obj;

      return this.isOfSubType(obj, nodeType, 'operation') && Array.isArray(casted.expression) &&
        casted.expression.length === 1 && !this.isOfType(casted.expression[0], 'wildcard');
    }
  };
}
