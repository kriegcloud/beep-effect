import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";

export class EntityId extends S.UUID {
  static readonly is = S.is(EntityId);
  static readonly decode = S.decode(EntityId);
}

export namespace EntityId {
  export type Type = S.Schema.Type<typeof EntityId>;
  export type Encoded = S.Schema.Encoded<typeof EntityId>;
}

export namespace Entity {
  export const make = <
    const Name extends StringTypes.NonEmptyString<string>,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
  >(
    name: Name,
    fields: Fields,
  ) =>
    S.Struct({
      entity: S.Literal(name),
      id: EntityId,
      ...fields,
    });

  export type Type<
    Name extends StringTypes.NonEmptyString<string>,
    Fields extends Record<string, unknown>,
  > = Fields & {
    readonly id: EntityId.Type;
    readonly entity: Name;
  };
}
