import * as S from "effect/Schema";

export class Uint8Arr extends S.instanceOf(Uint8Array).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Uint8Arr"),
  identifier: "Uint8Arr",
  title: "Uint8Array",
  description: "A Uint8Array",
}) {
  static readonly is = S.is(this);
}

export declare namespace Uint8Arr {
  export type Type = S.Schema.Type<typeof Uint8Arr>;
  export type Encoded = S.Schema.Encoded<typeof Uint8Arr>;
}
