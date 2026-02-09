import { $SemanticWebId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("idna/model");
/**
 * A callback function type for array mapping operations
 */
export type MapCallback<T, R> = (value: T, index: number, array: T[]) => R;

/**
 * A callback function type for domain mapping operations
 */
export type DomainCallback = (string: string) => string;

const UCS2Decode = BS.Fn({
  input: S.String,
  output: S.Array(S.Number),
});

const UCS2Encode = BS.Fn({
  input: S.Array(S.Number),
  output: S.String,
});

const CommonFn = BS.Fn({
  input: S.String,
  output: S.String,
});

export class UCS2 extends S.Class<UCS2>($I`UCS2`)(
  {
    decode: UCS2Decode,
    encode: UCS2Encode,
  },
  $I.annotations("UCS2", {
    description: "UCS2 encoding and decoding",
  })
) {}

/**
 * Configuration interface for the punycode module
 */
export class IDNAConfig extends S.Class<IDNAConfig>($I`IDNAConfig`)(
  {
    version: BS.SemanticVersion,
    ucs2: UCS2,
    decode: CommonFn,
    encode: CommonFn,
    toASCII: CommonFn,
    toUnicode: CommonFn,
  },
  $I.annotations("IDNAConfig", {
    description: "Configuration interface for IDNA (Internationalized Domain Names in Applications) module",
  })
) {}
