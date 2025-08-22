import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";

export const NodeId = S.UUID;

export namespace NodeId {
  export type Type = S.Schema.Type<typeof NodeId>;
  export type Encoded = S.Schema.Encoded<typeof NodeId>;
}

export namespace Node {
  export const make = <
    const Name extends StringTypes.NonEmptyString<string>,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
  >(
    name: Name,
    fields: Fields,
  ) =>
    S.Struct({
      node: S.Literal(name),
      id: NodeId,
      ...fields,
    });

  export type Type<
    Name extends StringTypes.NonEmptyString<string>,
    Fields extends Record<string, unknown>,
  > = Fields & {
    id: NodeId.Type;
    node: Name;
  };
}
