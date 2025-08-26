import type { StringTypes, StructTypes } from "@beep/types";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
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
      id: typeof NodeId;
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
        id: typeof NodeId;
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
        id: typeof NodeId;
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
): RuleType<Type, Fields> => {
  const Rule = Node.make("rule", {
    type: S.Literal(type).pipe(
      S.optional,
      S.withDefaults({
        constructor: () => type,
        decoding: () => type,
      }),
    ),
    parentId: NodeId,
    ...fields,
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
