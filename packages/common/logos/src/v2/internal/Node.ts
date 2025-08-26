import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";

export const NodeId = S.UUID.annotations({
  identifier: "NodeId",
  title: "Node Id",
  description: "Unique identifier for a node in the rules engine",
});

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
      node: S.Literal(name).pipe(
        S.optional,
        S.withDefaults({
          constructor: () => name,
          decoding: () => name,
        })
      ),
      id: NodeId,
      ...fields,
    }).annotations({
      identifier: "Node",
      title: "Node",
      description: "Base Schema for a Node in the rules engine",
    });

  export type Type<
    Name extends StringTypes.NonEmptyString<string>,
    Fields extends Record<string, unknown>,
  > = Fields & {
    id: NodeId.Type;
    node: Name;
  };
}
