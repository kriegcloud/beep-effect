import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { Entity, EntityId } from "./Entity";

export type RuleType<
  Type extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = {
  Rule: S.Struct<
    {
      entity: S.Literal<["rule"]>;
      id: typeof EntityId;
    } & {
      readonly type: S.Literal<[Type]>;
      readonly parentId: typeof EntityId;
    } & Fields
  >;
  Input: S.Struct<{
    [K in keyof Pick<
      {
        entity: S.Literal<["rule"]>;
        id: typeof EntityId;
      } & {
        readonly type: S.Literal<[Type]>;
        readonly parentId: typeof EntityId;
      } & Fields,
      "type" | (keyof Fields & string)
    >]: Pick<
      {
        entity: S.Literal<["rule"]>;
        id: typeof EntityId;
      } & {
        readonly type: S.Literal<[Type]>;
        readonly parentId: typeof EntityId;
      } & Fields,
      "type" | (keyof Fields & string)
    >[K];
  }>;
};

export const makeRule = <
  const Type extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
>(
  type: Type,
  fields: Fields,
): RuleType<Type, Fields> => {
  const Rule = Entity.make("rule", {
    type: S.Literal(type),
    parentId: EntityId,
    ...fields,
  });

  return {
    Rule,
    Input: Rule.pick("type", ...Struct.keys(fields)),
  };
};
