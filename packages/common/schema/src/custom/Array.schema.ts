import type * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { CustomId } from "./_id";

const Id = CustomId.compose("array");
export class ArrayOfNumbers extends S.Array(S.Number).annotations(
  Id.annotations("ArrayOfNumbers", {
    description: "Array of numbers",
  })
) {
  static readonly is = S.is(this);
}

export declare namespace ArrayOfNumbers {
  export type Type = S.Schema.Type<typeof ArrayOfNumbers>;
  export type Encoded = S.Schema.Encoded<typeof ArrayOfNumbers>;
}

export const arrayToCommaSeparatedString = <A extends string | number | boolean>(
  literalSchema: S.Schema<A, A, never>
) =>
  S.transform(S.String, S.Array(literalSchema), {
    decode: (str) => Str.split(",")(str) as A.NonEmptyArray<A>,
    encode: (array) => array.join(","),
    strict: true,
  }).annotations(
    Id.annotations("arrayToCommaSeparatedString", {
      description: "Converts an array to a comma separated string",
    })
  );
