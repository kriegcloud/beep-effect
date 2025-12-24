import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/Op");

export class OpCode extends BS.MappedLiteralKit(
  ["INIT", 0],
  ["SET_PARENT_KEY", 1],
  ["CREATE_LIST", 2],
  ["UPDATE_OBJECT", 3],
  ["CREATE_OBJECT", 4],
  ["DELETE_CRDT", 5],
  ["DELETE_OBJECT_KEY", 6],
  ["CREATE_MAP", 7],
  ["CREATE_REGISTER", 8],
  ["ACK", 9]
).annotations(
  $I.annotations("OpCode", {
    description: "Operation code for Yjs protocol",
  })
) {}

export declare namespace OpCode {
  export type Type = typeof OpCode.Type;
  export type Encoded = typeof OpCode.Encoded;
}

export class UpdateObjectOp extends S.Class<UpdateObjectOp>($I`UpdateObjectOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    type: S.Literal(OpCode.DecodedEnum.UPDATE_OBJECT),
    data: BS.JsonObject.pipe(S.partial),
  },
  $I.annotations("UpdateObjectOp", {
    description: "Update object operation for Yjs protocol",
  })
) {}

export class CreateObjectOp extends S.Class<CreateObjectOp>($I`CreateObjectOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    intent: S.optional(S.Literal("set")),
    deleteId: S.optional(S.String),
    type: S.Literal(OpCode.DecodedEnum.CREATE_OBJECT),
    parentId: S.String,
    parentKey: S.String,
    data: BS.JsonObject,
  },
  $I.annotations("CreateObjectOp", {
    description: "Create object operation for Yjs protocol",
  })
) {}

export class CreateListOp extends S.Class<CreateListOp>($I`CreateListOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    intent: S.optional(S.Literal("set")),
    deleteId: S.optional(S.String),
    type: S.Literal(OpCode.DecodedEnum.CREATE_LIST),
    parentId: S.String,
    parentKey: S.String,
  },
  $I.annotations("CreateListOp", {
    description: "Create list operation for Yjs protocol",
  })
) {}

export class CreateMapOp extends S.Class<CreateMapOp>($I`CreateMapOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    intent: S.optional(S.Literal("set")),
    deleteId: S.optional(S.String),
    type: S.Literal(OpCode.DecodedEnum.CREATE_MAP),
    parentId: S.String,
    parentKey: S.String,
  },
  $I.annotations("CreateMapOp", {
    description: "Create map operation for Yjs protocol",
  })
) {}

export class CreateRegisterOp extends S.Class<CreateRegisterOp>($I`CreateRegisterOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    intent: S.optional(S.Literal("set")),
    deleteId: S.optional(S.String),
    type: S.Literal(OpCode.DecodedEnum.CREATE_REGISTER),
    parentId: S.String,
    parentKey: S.String,
    data: BS.Json,
  },
  $I.annotations("CreateRegisterOp", {
    description: "Create register operation for Yjs protocol",
  })
) {}

export class DeleteCrdtOp extends S.Class<DeleteCrdtOp>($I`DeleteCrdtOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    type: S.Literal(OpCode.DecodedEnum.DELETE_CRDT),
  },
  $I.annotations("DeleteCrdtOp", {
    description: "Delete CRDT operation for Yjs protocol",
  })
) {}

export class AckOp extends S.Class<AckOp>($I`AckOp`)(
  {
    type: S.Literal(OpCode.DecodedEnum.ACK),
    opId: S.String,
  },
  $I.annotations("AckOp", {
    description: "Ack operation for Yjs protocol",
  })
) {}

export class SetParentKeyOp extends S.Class<SetParentKeyOp>($I`SetParentKeyOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    type: S.Literal(OpCode.DecodedEnum.SET_PARENT_KEY),
    parentKey: S.String,
  },
  $I.annotations("SetParentKeyOp", {
    description: "Set parent key operation for Yjs protocol",
  })
) {}

export class DeleteObjectKeyOp extends S.Class<DeleteObjectKeyOp>($I`DeleteObjectKeyOp`)(
  {
    opId: S.optional(S.String),
    id: S.String,
    type: S.Literal(OpCode.DecodedEnum.DELETE_OBJECT_KEY),
    key: S.String,
  },
  $I.annotations("DeleteObjectKeyOp", {
    description: "Delete object key operation for Yjs protocol",
  })
) {}

export class CreateOp extends S.Union(CreateObjectOp, CreateRegisterOp, CreateMapOp, CreateListOp).annotations(
  $I.annotations("CreateOp", {
    description: "Create operation for Yjs protocol",
  })
) {}

export declare namespace CreateOp {
  export type Type = typeof CreateOp.Type;
  export type Encoded = typeof CreateOp.Encoded;
}
/**
 * These operations are the payload for {@link UpdateStorageServerMsg} messages
 * only.
 */
export class Op extends S.Union(
  CreateOp,
  UpdateObjectOp,
  DeleteCrdtOp,
  SetParentKeyOp, // only for lists!
  DeleteObjectKeyOp,
  AckOp // Proper Ack
).annotations(
  $I.annotations("Op", {
    description: "Operation for Yjs protocol",
  })
) {}

export declare namespace Op {
  export type Type = typeof Op.Type;
  export type Encoded = typeof Op.Encoded;
}
