/**
 * The Node Entity - A Node in a Knowledge Graph
 *
 * @since 0.0.0
 * @module
 */
import {$ScratchId} from "@beep/identity";
import * as S from "effect/Schema";
import {SchemaUtils} from "@beep/schema";
import * as M from "effect/unstable/schema/Model";
import {Mem} from "@beep/shared-domain";

const $I = $ScratchId.create("mem/Node/Node.model");

export class Model extends M.Class<Model>($I`Model`)(
  {
    _tag: Mem.NodeId.Public,
    id: M.Generated(Mem.NodeId),
    name: S.String.pipe(SchemaUtils.withKeyDefaults("")),
    type: S.String,
    description: S.String,
  }) {
  static readonly newOption = (params: typeof Model["Encoded"]) => S.decodeOption(Model)(
    {
      ...params,
      name: params._tag ?? "",
    })

  static readonly newUnsafe = (params: typeof Model["Encoded"]) => S.decodeSync(Model)(
    {
      ...params,
      name: params._tag ?? "",
    })
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

