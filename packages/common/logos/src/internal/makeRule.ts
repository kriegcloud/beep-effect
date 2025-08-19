import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { Entity, EntityId } from "./Entity";

export type RuleType<
  Tag extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = {
  Rule: S.Struct<
    {
      entity: S.Literal<["rule"]>;
      id: typeof EntityId;
    } & {
      readonly _tag: S.Literal<[Tag]>;
      readonly parentId: typeof EntityId;
    } & Fields
  >;
  Input: S.Struct<{
    [K in keyof Pick<
      {
        entity: S.Literal<["rule"]>;
        id: typeof EntityId;
      } & {
        readonly _tag: S.Literal<[Tag]>;
        readonly parentId: typeof EntityId;
      } & Fields,
      "_tag" | (keyof Fields & string)
    >]: Pick<
      {
        entity: S.Literal<["rule"]>;
        id: typeof EntityId;
      } & {
        readonly _tag: S.Literal<[Tag]>;
        readonly parentId: typeof EntityId;
      } & Fields,
      "_tag" | (keyof Fields & string)
    >[K];
  }>;
};

export const makeRule = <
  const Tag extends StringTypes.NonEmptyString<string>,
  const Fields extends StructTypes.StructFieldsWithStringKeys,
>(
  tag: Tag,
  fields: Fields,
): RuleType<Tag, Fields> => {
  const Rule = Entity.make("rule", {
    _tag: S.Literal(tag),
    parentId: EntityId,
    ...fields,
  });

  return {
    Rule,
    Input: Rule.pick("_tag", ...Struct.keys(fields)),
  };
};
