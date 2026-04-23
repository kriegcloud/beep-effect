/**
 * The Edge Entity - A Edge in a Knowledge Graph
 *
 * @since 0.0.0
 * @module
 */
import {$ScratchId} from "@beep/identity";
import * as S from "effect/Schema";
import {SchemaUtils} from "@beep/schema";
import * as M from "effect/unstable/schema/Model";
import {Mem} from "@beep/shared-domain";

const $I = $ScratchId.create("mem/Edge/Edge.model");

export class Model extends M.Class<Model>($I`Model`)(
  {
    _tag: Mem.EdgeId.Public,
    id: M.Generated(Mem.EdgeId),
    sourceNodeId: Mem.NodeId,
    targetNodeId: Mem.NodeId,
    relationshipName: S.String,
  }) {
  static readonly newOption = (params: typeof Model["Encoded"]) => S.decodeOption(Model)(params)

  static readonly newUnsafe = (params: typeof Model["Encoded"]) => S.decodeSync(Model)(
    params)
}

export declare namespace Model {
  export type Encoded = typeof Model["Encoded"];

  export type Insert = typeof Model.insert.Type;

  export namespace Insert {
    export type Encoded = typeof Model.insert.Encoded;
  }

  export type Update = typeof Model.update.Type;

  export namespace Update {
    export type Encoded = typeof Model.update.Encoded;
  }
}

