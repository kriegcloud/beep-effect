import type { AstCoreFactory, SubTyped, SourceLocation } from '@traqula/core';
import type {
  ContextDefinitionBase,
  ContextDefinitionPrefix,
  TermIriFull,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'contextDef';
const nodeType: NodeType = 'contextDef';

// eslint-disable-next-line ts/explicit-function-return-type
export function ContextFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class ContextFactory extends Base {
    public contextDefinitionPrefix(loc: SourceLocation, key: string, value: TermIriFull): ContextDefinitionPrefix {
      return {
        type: nodeType,
        subType: 'prefix',
        key,
        value,
        loc,
      };
    }

    public isContextDefinitionPrefix(contextDef: object): contextDef is SubTyped<NodeType, 'prefix'> {
      return this.isOfSubType(contextDef, nodeType, 'prefix');
    }

    public contextDefinitionBase(loc: SourceLocation, value: TermIriFull): ContextDefinitionBase {
      return {
        type: 'contextDef',
        subType: 'base',
        value,
        loc,
      };
    }

    public isContextDefinitionBase(contextDef: object): contextDef is SubTyped<NodeType, 'base'> {
      return this.isOfSubType(contextDef, nodeType, 'base');
    }
  };
}
