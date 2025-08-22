import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import { Node, NodeId } from "./Node";

export type RuleType<
  Type extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = {
  Rule: S.Struct<
    {
      node: S.Literal<["rule"]>;
      id: typeof NodeId;
    } & {
      readonly type: S.Literal<[Type]>;
      readonly parentId: typeof NodeId;
    } & Fields
  >;
  Input: S.Struct<{
    [K in keyof Pick<
      {
        node: S.Literal<["rule"]>;
        id: typeof NodeId;
      } & {
        readonly type: S.Literal<[Type]>;
        readonly parentId: typeof NodeId;
      } & Fields,
      "type" | (keyof Fields & string)
    >]: Pick<
      {
        node: S.Literal<["rule"]>;
        id: typeof NodeId;
      } & {
        readonly type: S.Literal<[Type]>;
        readonly parentId: typeof NodeId;
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
  const Rule = Node.make("rule", {
    type: S.Literal(type),
    parentId: NodeId,
    ...fields,
  });

  return {
    Rule,
    Input: Rule.pick("type", ...Struct.keys(fields)),
  };
};
