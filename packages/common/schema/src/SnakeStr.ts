/**
 * A module containing effect schema's for SnakeCase strings
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";
import { NonEmptyTrimmedStr } from "./String.ts";

const $I = $SchemaId.create("SnakeStr");

export const SnakeCaseStr = NonEmptyTrimmedStr.pipe(
  S.check(
    S.isPattern(/^[a-z][a-z0-9]*(_[a-z0-9]+)*$/, {
      message: "Must be SnakeCase format",
    })
  ),
  S.brand("SnakeCaseStr"),
  $I.annoteSchema("SnakeCaseStr", {
    description: "SnakeCaseStr - A schema for a SnakeCase format string",
  })
);

export type SnakeCaseStr = typeof SnakeCaseStr.Type;
