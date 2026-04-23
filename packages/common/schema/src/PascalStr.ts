/**
 * A module containing effect schema's for PascalCase strings
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("PascalStr");

export const PascalCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[A-Z][a-zA-Z0-9]*$/, {
      message: "Must be PascalCase format",
    })
  ),
  S.brand("PascalCaseStr"),
  $I.annoteSchema("PascalCaseStr", {
    description: "PascalCaseStr - A schema for a PascalCase format string",
  })
);

export type PascalCaseStr = typeof PascalCaseStr.Type;
