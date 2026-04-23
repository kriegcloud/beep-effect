/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {O} from "@beep/utils";
import * as S from "effect/Schema";
import {Effect} from "effect";

const $I = $ScratchId.create("mem/values/Relationship/Relationship.model")

export class Relationship extends S.Class<Relationship>($I`Relationship`)(
  {
    type: S.String,
    source: S.OptionFromOptionalKey(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<string>())),
    ),
    target: S.OptionFromOptionalKey(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<string>())),
    ),
    properties: S.OptionFromOptionalKey(
      S.Record(
        S.String,
        S.Any,
      ),
    ).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<Record<string, any>>())),
    ),
  },
  $I.annote(
    "Relationship",
    {
      description: "A relationship in the knowledge graph",
    },
  ),
) {
  static readonly new = (
    type: string,
    rest?: undefined | Omit<typeof Relationship.Encoded, "type">,
  ): Relationship => S.decodeSync(Relationship)({
    type,
    ...rest,
  })
}
