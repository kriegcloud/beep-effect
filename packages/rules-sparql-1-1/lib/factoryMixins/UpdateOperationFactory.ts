import type { AstCoreFactory, SourceLocation, SubTyped, Typed } from '@traqula/core';
import type {
  DatasetClauses,
  GraphRef,
  GraphRefDefault,
  GraphRefSpecific,
  PatternGroup,
  Quads,
  TermIri,
  UpdateOperationAdd,
  UpdateOperationClear,
  UpdateOperationCopy,
  UpdateOperationCreate,
  UpdateOperationDeleteData,
  UpdateOperationDeleteWhere,
  UpdateOperationDrop,
  UpdateOperationInsertData,
  UpdateOperationLoad,
  UpdateOperationModify,
  UpdateOperationMove,
} from '../Sparql11types.js';
import type { Constructor } from './mixins.js';

type NodeType = 'updateOperation';
const nodeType: NodeType = 'updateOperation';

// eslint-disable-next-line ts/explicit-function-return-type
export function UpdateOperationFactoryMixin<TBase extends Constructor<AstCoreFactory>>(Base: TBase) {
  return class UpdateOperationFactory extends Base {
    public isUpdateOperation(obj: object): obj is Typed<NodeType> {
      return this.isOfType(obj, nodeType);
    }

    public updateOperationLoad(
      loc: SourceLocation,
      source: TermIri,
      silent: boolean,
      destination?: GraphRefSpecific | undefined,
    ): UpdateOperationLoad {
      return {
        type: nodeType,
        subType: 'load',
        silent,
        source,
        ...(destination && { destination }),
        loc,
      };
    }

    public isUpdateOperationLoad(obj: object): obj is SubTyped<NodeType, 'load'> {
      return this.isOfSubType(obj, nodeType, 'load');
    }

    public updateOperationClearDrop(subType: 'clear', silent: boolean, destination: GraphRef, loc: SourceLocation):
    UpdateOperationClear;
    public updateOperationClearDrop(subType: 'drop', silent: boolean, destination: GraphRef, loc: SourceLocation):
    UpdateOperationDrop;
    public updateOperationClearDrop(
      subType: 'clear' | 'drop',
      silent: boolean,
      destination: GraphRef,
      loc: SourceLocation
    ): UpdateOperationClear | UpdateOperationDrop;
    public updateOperationClearDrop(
      subType: 'clear' | 'drop',
      silent: boolean,
      destination: GraphRef,
      loc: SourceLocation,
    ): UpdateOperationClear | UpdateOperationDrop {
      return {
        type: 'updateOperation',
        subType,
        silent,
        destination,
        loc,
      };
    }

    public updateOperationClear(
      destination: GraphRef,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationClear {
      return this.updateOperationClearDrop('clear', silent, destination, loc);
    };

    public isUpdateOperationClear(obj: object): obj is SubTyped<NodeType, 'clear'> {
      return this.isOfSubType(obj, nodeType, 'clear');
    }

    public updateOperationDrop(
      destination: GraphRef,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationDrop {
      return this.updateOperationClearDrop('drop', silent, destination, loc);
    }

    public isUpdateOperationDrop(obj: object): obj is SubTyped<NodeType, 'drop'> {
      return this.isOfSubType(obj, nodeType, 'drop');
    }

    public updateOperationCreate(
      destination: GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationCreate {
      return {
        type: 'updateOperation',
        subType: 'create',
        silent,
        destination,
        loc,
      };
    }

    public isUpdateOperationCreate(obj: object): obj is SubTyped<NodeType, 'create'> {
      return this.isOfSubType(obj, nodeType, 'create');
    }

    public updateOperationAddMoveCopy(
      subType: 'add',
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationAdd;
    public updateOperationAddMoveCopy(
      subType: 'move',
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationMove ;
    public updateOperationAddMoveCopy(
      subType: 'copy',
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationCopy;
    public updateOperationAddMoveCopy(
      subType: 'add' | 'move' | 'copy',
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationAdd | UpdateOperationMove | UpdateOperationCopy;
    public updateOperationAddMoveCopy(
      subType: 'add' | 'move' | 'copy',
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationAdd | UpdateOperationMove | UpdateOperationCopy {
      return {
        type: 'updateOperation',
        subType,
        silent,
        source,
        destination,
        loc,
      };
    }

    public updateOperationAdd(
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationAdd {
      return this.updateOperationAddMoveCopy('add', source, destination, silent, loc);
    }

    public isUpdateOperationAdd(obj: object): obj is SubTyped<NodeType, 'add'> {
      return this.isOfSubType(obj, nodeType, 'add');
    }

    public updateOperationMove(
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationMove {
      return this.updateOperationAddMoveCopy('move', source, destination, silent, loc);
    }

    public isUpdateOperationMove(obj: object): obj is SubTyped<NodeType, 'move'> {
      return this.isOfSubType(obj, nodeType, 'move');
    }

    public updateOperationCopy(
      source: GraphRefDefault | GraphRefSpecific,
      destination: GraphRefDefault | GraphRefSpecific,
      silent: boolean,
      loc: SourceLocation,
    ): UpdateOperationCopy {
      return this.updateOperationAddMoveCopy('copy', source, destination, silent, loc);
    }

    public isUpdateOperationCopy(obj: object): obj is SubTyped<NodeType, 'copy'> {
      return this.isOfSubType(obj, nodeType, 'copy');
    }

    public updateOperationInsDelDataWhere(subType: 'insertdata', data: Quads[], loc: SourceLocation):
    UpdateOperationInsertData;
    public updateOperationInsDelDataWhere(subType: 'deletedata', data: Quads[], loc: SourceLocation):
    UpdateOperationDeleteData;
    public updateOperationInsDelDataWhere(subType: 'deletewhere', data: Quads[], loc: SourceLocation):
    UpdateOperationDeleteWhere;
    public updateOperationInsDelDataWhere(
      subType: 'insertdata' | 'deletedata' | 'deletewhere',
      data: Quads[],
      loc: SourceLocation,
    ): UpdateOperationInsertData | UpdateOperationDeleteData | UpdateOperationDeleteWhere;
    public updateOperationInsDelDataWhere(
      subType: 'insertdata' | 'deletedata' | 'deletewhere',
      data: Quads[],
      loc: SourceLocation,
    ): UpdateOperationInsertData | UpdateOperationDeleteData | UpdateOperationDeleteWhere {
      return {
        type: 'updateOperation',
        subType,
        data,
        loc,
      };
    }

    public updateOperationInsertData(data: Quads[], loc: SourceLocation): UpdateOperationInsertData {
      return this.updateOperationInsDelDataWhere('insertdata', data, loc);
    }

    public isUpdateOperationInsertData(obj: object): obj is SubTyped<NodeType, 'insertdata'> {
      return this.isOfSubType(obj, nodeType, 'insertdata');
    }

    public updateOperationDeleteData(data: Quads[], loc: SourceLocation): UpdateOperationDeleteData {
      return this.updateOperationInsDelDataWhere('deletedata', data, loc);
    }

    public isUpdateOperationDeleteData(obj: object): obj is SubTyped<NodeType, 'deletedata'> {
      return this.isOfSubType(obj, nodeType, 'deletedata');
    }

    public updateOperationDeleteWhere(data: Quads[], loc: SourceLocation): UpdateOperationDeleteWhere {
      return this.updateOperationInsDelDataWhere('deletewhere', data, loc);
    }

    public isUpdateOperationDeleteWhere(obj: object): obj is SubTyped<NodeType, 'deletewhere'> {
      return this.isOfSubType(obj, nodeType, 'deletewhere');
    }

    public updateOperationModify(
      loc: SourceLocation,
      insert: Quads[] | undefined,
      del: Quads[] | undefined,
      where: PatternGroup,
      from: DatasetClauses,
      graph?: TermIri | undefined,
    ): UpdateOperationModify {
      return {
        type: 'updateOperation',
        subType: 'modify',
        insert: insert ?? [],
        delete: del ?? [],
        graph,
        where,
        from,
        loc,
      };
    }

    public isUpdateOperationModify(obj: object): obj is SubTyped<NodeType, 'modify'> {
      return this.isOfSubType(obj, nodeType, 'modify');
    }
  };
}
