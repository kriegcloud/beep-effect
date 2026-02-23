import { $YjsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $YjsId.create("protocol/SerializedCrdt");

export const IdTuple = <T, E, R>(schema: S.Schema<T, E, R>) => S.Tuple(S.String, schema);

export declare namespace IdTuple {
  export type Type<T, E, R> = S.Schema.Type<ReturnType<typeof IdTuple<T, E, R>>>;
  export type Encoded<T, E, R> = S.Schema.Encoded<ReturnType<typeof IdTuple<T, E, R>>>;
}

export class CrdtType extends BS.MappedLiteralKit(["OBJECT", 0], ["LIST", 1], ["MAP", 2], ["REGISTER", 3]).annotations(
  $I.annotations("CrdtType", {
    description: "Crdt type for Yjs protocol",
  })
) {}

export class SerializedRootObject extends S.Class<SerializedRootObject>($I`SerializedRootObject`)(
  {
    type: S.Literal(CrdtType.DecodedEnum.OBJECT),
    data: BS.JsonObject,
    // Root objects don't have a parent relationship
    parentId: S.optional(S.Never),
    parentKey: S.optional(S.Never),
  },
  $I.annotations("SerializedRootObject", {
    description: "Serialized root object for Yjs protocol",
  })
) {}

export class SerializedObject extends S.Class<SerializedObject>($I`SerializedObject`)(
  {
    type: S.Literal(CrdtType.DecodedEnum.OBJECT),
    data: BS.JsonObject,
    parentId: S.String,
    parentKey: S.String,
  },
  $I.annotations("SerializedObject", {
    description: "Serialized object for Yjs protocol",
  })
) {}

export class SerializedList extends S.Class<SerializedList>($I`SerializedList`)(
  {
    type: S.Literal(CrdtType.DecodedEnum.LIST),
    parentId: S.String,
    parentKey: S.String,
  },
  $I.annotations("SerializedList", {
    description: "Serialized list for Yjs protocol",
  })
) {}

export class SerializedMap extends S.Class<SerializedMap>($I`SerializedMap`)(
  {
    type: S.Literal(CrdtType.DecodedEnum.MAP),
    parentId: S.String,
    parentKey: S.String,
  },
  $I.annotations("SerializedMap", {
    description: "Serialized map for yjs protocol",
  })
) {}

export class SerializedRegister extends S.Class<SerializedRegister>($I`SerializedRegister`)(
  {
    type: S.Literal(CrdtType.DecodedEnum.REGISTER),
    parentId: S.String,
    parentKey: S.String,
    data: BS.Json,
  },
  $I.annotations("SerializedRegister", {
    description: "Serialized register for Yjs protocol",
  })
) {}

export class SerializedChild extends S.Union(
  SerializedObject,
  SerializedList,
  SerializedMap,
  SerializedRegister
).annotations(
  $I.annotations("SerializedChild", {
    description: "Serialized child for Yjs protocol",
  })
) {}

export declare namespace SerializedChild {
  export type Type = typeof SerializedChild.Type;
  export type Encoded = typeof SerializedChild.Encoded;
}

export class SerializedCrdt extends S.Union(SerializedRootObject, SerializedChild).annotations(
  $I.annotations("SerializedCrdt", {
    description: "Serialized CRDT for Yjs protocol",
  })
) {}

export declare namespace SerializedCrdt {
  export type Type = typeof SerializedCrdt.Type;
  export type Encoded = typeof SerializedCrdt.Encoded;
}
