import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { v4 as uuid } from "uuid";
import { Node, NodeId } from "./Node";

export type RuleType<
  Type extends StringTypes.NonEmptyString<string>,
  Fields extends StructTypes.StructFieldsWithStringKeys,
> = {
  Rule: S.Struct<
    {
      node: S.PropertySignature<
        ":",
        Exclude<"rule", undefined>,
        never,
        "?:",
        "rule" | undefined,
        true,
        never
      >;
      id: S.PropertySignature<
        ":",
        NodeId.Type,
        never,
        ":",
        NodeId.Type,
        true,
        never
      >;
    } & {
      readonly type: S.PropertySignature<
        ":",
        Exclude<Type, undefined>,
        never,
        "?:",
        Type | undefined,
        true,
        never
      >;
      readonly parentId: typeof NodeId;
    } & Fields
  >;
  Input: S.Struct<{
    [K in keyof Pick<
      {
        node: S.PropertySignature<
          ":",
          Exclude<"rule", undefined>,
          never,
          "?:",
          "rule" | undefined,
          true,
          never
        >;
        id: S.PropertySignature<
          ":",
          NodeId.Type,
          never,
          ":",
          NodeId.Type,
          true,
          never
        >;
      } & {
        readonly type: S.PropertySignature<
          ":",
          Exclude<Type, undefined>,
          never,
          "?:",
          Type | undefined,
          true,
          never
        >;
        readonly parentId: typeof NodeId;
      } & Fields,
      "type" | (keyof Fields & string)
    >]: Pick<
      {
        node: S.PropertySignature<
          ":",
          Exclude<"rule", undefined>,
          never,
          "?:",
          "rule" | undefined,
          true,
          never
        >;
        id: S.PropertySignature<
          ":",
          NodeId.Type,
          never,
          ":",
          NodeId.Type,
          true,
          never
        >;
      } & {
        readonly type: S.PropertySignature<
          ":",
          Exclude<Type, undefined>,
          never,
          "?:",
          Type | undefined,
          true,
          never
        >;
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
) => {
  const Rule = Node.make("rule", {
    ...fields,
    type: S.Literal(type),
    parentId: NodeId,
    id: NodeId.pipe(
      S.propertySignature,
      S.withConstructorDefault(() => uuid()),
    ),
  }).annotations({
    identifier: `${Str.capitalize(type)}Rule`,
    title: `${Str.capitalize(type)} Rule`,
    description: `Rule for ${type}'s in the rules engine.`,
  });

  return {
    Rule,
    Input: Rule.pick("type", ...Struct.keys(fields)),
  };
};
