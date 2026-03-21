import { Struct } from "@beep/utils";
import { flow } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

/**
 * Makes every locale entry field optional while also allowing explicit `null`
 * values for partial locale payloads.
 *
 * @since 0.0.0
 */
export const LocaleEntry = <TCategoryDef extends S.Struct.Fields>(fields: S.Struct<TCategoryDef>) =>
  fields.mapFields(
    flow(
      Struct.entries,
      A.map(([key, schema]) => [key, schema.pipe(S.NullOr, S.optionalKey)] as const),
      Struct.fromEntries
    )
  );
