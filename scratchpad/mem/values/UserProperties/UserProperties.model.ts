/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {SchemaUtils} from "@beep/schema";
import * as S from "effect/Schema";
import {O} from "@beep/utils";
import type {TUnsafe} from "@beep/types";
import {UserLocation} from "../UserLocation/index.ts";

const $I = $ScratchId.create("mem/values/UserProperties/UserProperties.model")

export class UserProperties extends S.Class<UserProperties>($I`UserProperties`)(
  {
    customProperties: S.Record(
      S.String,
      S.Any,
    )
      .pipe(
        S.Option,
        S.optionalKey,
        SchemaUtils.withKeyDefaults(O.none<Record<string, TUnsafe.Any>>()),
      ),
    location: UserLocation.pipe(
      S.Option,
      S.optionalKey,
      SchemaUtils.withKeyDefaults(O.none<UserLocation>()),
    ),
  },
  $I.annote(
    "UserProperties",
    {
      description: "",
    },
  ),
) {
}
