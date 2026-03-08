import type { AstCoreFactory, SourceLocation, Typed, SubTyped } from '@traqula/core';
import type {
  Expression,
  Ordering,
  SolutionModifierGroup,
  SolutionModifierGroupBind,
  SolutionModifierHaving,
  SolutionModifierLimitOffset,
  SolutionModifierOrder,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'solutionModifier';
const nodeType: NodeType = 'solutionModifier';

// eslint-disable-next-line ts/explicit-function-return-type
export function SolutionModifiersFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class SolutionModifiersFactory extends Base {
    public isSolutionModifier(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public solutionModifierHaving(having: Expression[], loc: SourceLocation): SolutionModifierHaving {
      return {
        type: nodeType,
        subType: 'having',
        having,
        loc,
      };
    }

    public isSolutionModifierHaving(obj: object): obj is SubTyped<NodeType, 'having'> {
      return this.isOfSubType(obj, nodeType, 'having');
    }

    public solutionModifierOrder(orderDefs: Ordering[], loc: SourceLocation): SolutionModifierOrder {
      return {
        type: nodeType,
        subType: 'order',
        orderDefs,
        loc,
      };
    }

    public isSolutionModifierOrder(obj: object): obj is SubTyped<NodeType, 'order'> {
      return this.isOfSubType(obj, nodeType, 'order');
    }

    public solutionModifierLimitOffset(
      limit: number | undefined,
      offset: number | undefined,
      loc: SourceLocation,
    ): SolutionModifierLimitOffset {
      return {
        type: nodeType,
        subType: 'limitOffset',
        limit,
        offset,
        loc,
      };
    }

    public isSolutionModifierLimitOffset(obj: object): obj is SubTyped<NodeType, 'limitOffset'> {
      return this.isOfSubType(obj, nodeType, 'limitOffset');
    }

    public solutionModifierGroup(groupings: (Expression | SolutionModifierGroupBind)[], loc: SourceLocation):
    SolutionModifierGroup {
      return {
        type: 'solutionModifier',
        subType: 'group',
        groupings,
        loc,
      };
    }

    public isSolutionModifierGroup(obj: object): obj is SubTyped<NodeType, 'group'> {
      return this.isOfSubType(obj, nodeType, 'group');
    }
  };
}
