import * as S from "effect/Schema";

export class ArrayOfNumbers extends S.Array(S.Number).annotations({
  schemaId: Symbol.for("@beep/schema/custom/ArrayOfNumbers"),
  identifier: "ArrayOfNumbers",
  title: "Array of numbers",
  description: "Array of numbers",
}) {
  static readonly is = S.is(this);
}

export namespace ArrayOfNumbers {
  export type Type = S.Schema.Type<typeof ArrayOfNumbers>;
  export type Encoded = S.Schema.Encoded<typeof ArrayOfNumbers>;
}
