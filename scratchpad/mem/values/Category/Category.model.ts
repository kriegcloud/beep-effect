/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import * as S from "effect/Schema";
import {Effect} from "effect";
import {Relationship} from "../Relationship/index.ts";

const $I = $ScratchId.create("mem/values/Category/Category.model")
const defaultRelationshipEncoded = {
  type: "categorized_as",
} satisfies typeof Relationship.Encoded

export class Category extends S.Class<Category>($I`Category`)(
  {
    categoryId: S.String,
    name: S.String,
    defaultRelationship: Relationship.pipe(
      S.withConstructorDefault(Effect.succeed(Relationship.new("categorized_as"))),
      S.withDecodingDefaultKey(Effect.succeed(defaultRelationshipEncoded)),
    ),
  },
  $I.annote(
    "Category",
    {
      description: "A category in the knowledge graph",
    },
  ),
) {
}
