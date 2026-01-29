import { $UISpreadsheetId } from "@beep/identity/packages";
import type * as B from "effect/Brand";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $UISpreadsheetId.create("utils/isNumerical");

export class Numerical extends S.declare((u: unknown): u is B.Branded<string, "Numerical"> => {
  if (!P.isString(u)) return false;

  return !Number.isNaN(u) && !Number.isNaN(Number.parseFloat(u));
})
  .pipe(S.brand("Numerical"))
  .annotations(
    $I.annotations("Numerical", {
      description: "A string that can be parsed to a number",
    })
  ) {
  static readonly is = S.is(Numerical);
}

export declare namespace Numerical {
  export type Type = typeof Numerical.Type;
  export type Encoded = typeof Numerical.Encoded;
}
