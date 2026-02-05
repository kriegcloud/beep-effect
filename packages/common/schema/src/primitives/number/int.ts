import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/number/int");

export class PosInt extends S.Int.pipe(S.positive()).annotations(
  $I.annotations("PosInt", {
    description: "Positive integer",
  })
) {}

export declare namespace PosInt {
  export type Type = typeof PosInt.Type;
  export type Encoded = typeof PosInt.Encoded;
}
