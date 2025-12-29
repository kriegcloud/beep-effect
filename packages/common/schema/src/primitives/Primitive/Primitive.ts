import * as S from "effect/Schema";
import {$SchemaId} from "@beep/identity/packages";

const $I = $SchemaId.create("StringPrimitive");

export class StringPrimitive extends S.String.pipe(S.brand("StringPrimitive")).annotations(
  $I.annotations("StringPrimitive", {
    description: "A data type that represents a string of characters."
  })
) {

}

export class NumberPrimitive extends S.Number.pipe(S.brand("NumberPrimitive")).annotations(
  $I.annotations("NumberPrimitive", {
    description: "A data type that represents a number."
  })
) {

}

export declare namespace NumberPrimitive {
  export type Type = typeof NumberPrimitive.Type
}

export class BooleanPrimitive extends S.Boolean.pipe(S.brand("BooleanPrimitive")).annotations(
  $I.annotations("BooleanPrimitive", {
    description: "A data type that represents a boolean value."
  })
) {
}