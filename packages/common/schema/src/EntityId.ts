import { invariant } from "@beep/invariant";
import type { DefaultAnnotations } from "@beep/schema/annotations";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import { SnakeTag, UUIDLiteralEncoded } from "./custom";

export class EntityIdPrefixBase extends SnakeTag.annotations({
  schemaId: Symbol.for("@beep/schema/EntityId/EntityIdPrefixBase"),
  identifier: "EntityIdPrefixBase",
  title: "EntityId Prefix Base",
  description: "A base schema for entity id prefixes",
}) {
  static readonly make = SnakeTag.make;
}

export namespace EntityIdPrefixBase {
  export type Type = S.Schema.Type<typeof EntityIdPrefixBase>;
  export type Encoded = S.Schema.Encoded<typeof EntityIdPrefixBase>;
}

export namespace EntityId {
  export const make =
    <const Brand extends string, const Prefix extends string>(prefix: SnakeTag.Literal<Prefix>, brand: Brand) =>
    (
      annotations: DefaultAnnotations<
        S.Schema.Type<
          S.brand<
            S.TemplateLiteral<`${SnakeTag.Literal<Prefix>}__${string}-${string}-${string}-${string}-${string}`>,
            Brand
          >
        >
      >
    ) => {
      const pre = prefix;
      invariant(S.is(EntityIdPrefixBase)(pre), "Not a valid prefix", {
        file: "@beep/schema/EntityId.ts",
        line: 108,
        args: [pre],
      });

      return S.TemplateLiteral(S.Literal(prefix), "__", UUIDLiteralEncoded)
        .pipe(S.brand(brand))
        .annotations(annotations);
    };

  export type Type<Tag extends string> = B.Branded<string, Tag>;
}
