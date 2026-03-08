import type { AstCoreFactory, SubTyped, SourceLocation, Typed } from '@traqula/core';
import type {
  GraphRefAll,
  GraphRefDefault,
  GraphRefNamed,
  GraphRefSpecific,
  TermIri,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'graphRef';
const nodeType: NodeType = 'graphRef';

// eslint-disable-next-line ts/explicit-function-return-type
export function GraphRefFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class GraphRefFactory extends Base {
    public isGraphRef(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public graphRefDefault(loc: SourceLocation): GraphRefDefault {
      return {
        type: nodeType,
        subType: 'default',
        loc,
      };
    }

    public isGraphRefDefault(graphRef: object): graphRef is SubTyped<NodeType, 'default'> {
      return this.isOfSubType(graphRef, nodeType, 'default');
    }

    public graphRefNamed(loc: SourceLocation): GraphRefNamed {
      return {
        type: nodeType,
        subType: 'named',
        loc,
      };
    }

    public isGraphRefNamed(graphRef: object): graphRef is SubTyped<NodeType, 'named'> {
      return this.isOfSubType(graphRef, nodeType, 'named');
    }

    public graphRefAll(loc: SourceLocation): GraphRefAll {
      return {
        type: nodeType,
        subType: 'all',
        loc,
      };
    }

    public isGraphRefAll(graphRef: object): graphRef is SubTyped<NodeType, 'all'> {
      return this.isOfSubType(graphRef, nodeType, 'all');
    }

    public graphRefSpecific(graph: TermIri, loc: SourceLocation): GraphRefSpecific {
      return {
        type: nodeType,
        subType: 'specific',
        graph,
        loc,
      };
    }

    public isGraphRefSpecific(graphRef: object): graphRef is SubTyped<NodeType, 'specific'> {
      return this.isOfSubType(graphRef, nodeType, 'specific');
    }
  };
}
