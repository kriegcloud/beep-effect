import { BeepId } from "@beep/identity/BeepId";
import { SchemaId } from "@beep/identity/modules";
import * as S from "effect/Schema";

const Id = BeepId.from(SchemaId.identifier).compose("primitives/array-buffer");
export class ArrBuffer extends S.instanceOf(ArrayBuffer).annotations(
  Id.annotations("ArrayBuffer", {
    description: "An Array Buffer",
  })
) {
  static readonly is = S.is(this);
}

export declare namespace ArrBuffer {
  export type Type = S.Schema.Type<typeof ArrBuffer>;
  export type Encoded = S.Schema.Encoded<typeof ArrBuffer>;
}
