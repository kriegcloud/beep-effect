/**
 * A module containing effect schema's for KebabCase strings
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("KebabStr");

export const KebabCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Must be KebabCase format",
    })
  ),
  S.brand("KebabCaseStr"),
  $I.annoteSchema("KebabCaseStr", {
    description: "KebabCaseStr - A schema for a KebabCase format string",
  })
);

export type KebabCaseStr = typeof KebabCaseStr.Type;
