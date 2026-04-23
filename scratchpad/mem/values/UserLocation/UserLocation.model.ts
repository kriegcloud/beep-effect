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

const $I = $ScratchId.create("mem/values/UserLocation/UserLocation.model")
const defaultRelationshipEncoded = {
  type: "has_properties",
} satisfies typeof Relationship.Encoded

export class UserLocation extends S.Class<UserLocation>($I`UserLocation`)(
  {
    locationId: S.String,
    description: S.String,
    defaultRelationship: Relationship.pipe(
      S.withConstructorDefault(Effect.succeed(Relationship.new("has_properties"))),
      S.withDecodingDefaultKey(Effect.succeed(defaultRelationshipEncoded)),
    ),
  },
  $I.annote(
    "UserLocation",
    {
      description: ""
    },
  ),
) {
}
