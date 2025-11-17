import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("custom");
export class Uint8Arr extends S.instanceOf(Uint8Array).annotations(
  Id.annotations("Uint8Arr", {
    description: "A Uint8Array",
  })
) {
  static readonly is = S.is(this);
}

export declare namespace Uint8Arr {
  export type Type = S.Schema.Type<typeof Uint8Arr>;
  export type Encoded = S.Schema.Encoded<typeof Uint8Arr>;
}
