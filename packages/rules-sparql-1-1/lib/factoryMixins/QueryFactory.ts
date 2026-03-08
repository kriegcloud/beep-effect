import type { AstCoreFactory, SourceLocation, Typed, SubTyped } from '@traqula/core';
import type {
  ContextDefinition,
  DatasetClauses,
  PatternBgp,
  PatternGroup,
  PatternValues,
  QueryConstruct,
  QuerySelect,
  SolutionModifiers,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'query';
const nodeType: NodeType = 'query';

// eslint-disable-next-line ts/explicit-function-return-type
export function QueryFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class QueryFactory extends Base {
    public isQuery(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public isQuerySelect(obj: object): obj is SubTyped<NodeType, 'select'> {
      return this.isOfSubType(obj, nodeType, 'select');
    }

    public queryConstruct(
      loc: SourceLocation,
      context: ContextDefinition[],
      template: PatternBgp,
      where: PatternGroup,
      solutionModifiers: SolutionModifiers,
      datasets: DatasetClauses,
      values?: PatternValues,
    ): QueryConstruct {
      return {
        type: 'query',
        subType: 'construct',
        context,
        template,
        where,
        solutionModifiers,
        datasets,
        values,
        loc,
      };
    }

    public isQueryConstruct(obj: object): obj is SubTyped<NodeType, 'construct'> {
      return this.isOfSubType(obj, nodeType, 'construct');
    }

    public isQueryDescribe(obj: object): obj is SubTyped<NodeType, 'describe'> {
      return this.isOfSubType(obj, nodeType, 'describe');
    }

    public isQueryAsk(obj: object): obj is SubTyped<NodeType, 'ask'> {
      return this.isOfSubType(obj, nodeType, 'ask');
    }

    public querySelect(arg: Omit<QuerySelect, 'type' | 'subType' | 'loc'>, loc: SourceLocation): QuerySelect {
      return {
        type: nodeType,
        subType: 'select',
        ...arg,
        loc,
      };
    }
  };
}
