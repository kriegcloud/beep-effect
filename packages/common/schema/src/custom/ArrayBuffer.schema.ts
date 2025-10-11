import * as S from "effect/Schema";

export class ArrBuffer extends S.instanceOf(ArrayBuffer).annotations({
  schemaId: Symbol.for("@beep/schema/custom/ArrayBuffer"),
  identifier: "ArrayBuffer",
  title: "Array Buffer",
  description: "An Array Buffer",
}) {
  static readonly is = S.is(this);
}

export declare namespace ArrBuffer {
  export type Type = S.Schema.Type<typeof ArrBuffer>;
  export type Encoded = S.Schema.Encoded<typeof ArrBuffer>;
}
