import * as S from "effect/Schema";

export class DecodeString extends S.transform(S.Uint8ArrayFromSelf, S.String, {
  decode: (data) => new TextDecoder().decode(data),
  encode: (data) => new TextEncoder().encode(data),
  strict: true,
}) {}

export declare namespace DecodeString {
  export type Type = typeof DecodeString.Type;
  export type Encoded = typeof DecodeString.Encoded;
}
