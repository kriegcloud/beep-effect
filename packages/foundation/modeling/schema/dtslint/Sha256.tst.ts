import { Sha256Hex, Sha256HexFromBytes, Sha256HexFromHexBytes } from "@beep/schema/Sha256";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type {
  Sha256HexFromBytes as Sha256HexFromBytesType,
  Sha256HexFromHexBytes as Sha256HexFromHexBytesType,
  Sha256Hex as Sha256HexType,
} from "@beep/schema/Sha256";
import type { Effect } from "effect";
import type * as Brand from "effect/Brand";
import type * as Crypto from "effect/Crypto";

const knownDigest = "d01b7ce9154ef0264ce71e457ea81903b87a58d6cf2cd6be474886fdbc6f61d9";

describe("Sha256", () => {
  it("preserves the branded digest schema surface", () => {
    expect<Sha256Hex>().type.toBe<string & Brand.Brand<"Sha256Hex">>();
    expect<typeof Sha256Hex.Encoded>().type.toBe<string>();
    expect<Sha256HexType>().type.toBe<string & Brand.Brand<"Sha256Hex">>();
  });

  it("tracks the one-way bytes-to-digest transformation types", () => {
    expect<Sha256HexFromBytes>().type.toBe<Sha256HexType>();
    expect<typeof Sha256HexFromBytes.Encoded>().type.toBe<Uint8Array<ArrayBufferLike>>();
    expect<Sha256HexFromBytesType>().type.toBe<Sha256HexType>();
  });

  it("tracks the hex-byte transport schema types", () => {
    expect<Sha256HexFromHexBytes>().type.toBe<Sha256HexType>();
    expect<typeof Sha256HexFromHexBytes.Encoded>().type.toBe<string>();
    expect<Sha256HexFromHexBytesType>().type.toBe<Sha256HexType>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Sha256HexFromBytes);
    const encode = S.encodeEffect(Sha256HexFromBytes);
    const decodeHex = S.decodeUnknownEffect(Sha256HexFromHexBytes);
    const encodeHex = S.encodeEffect(Sha256HexFromHexBytes);
    const digest = S.decodeSync(Sha256Hex)(knownDigest);
    const bytes = new Uint8Array([0, 1, 2]);

    expect(digest).type.toBe<Sha256HexType>();
    expect(decode(bytes)).type.toBe<Effect.Effect<Sha256HexType, S.SchemaError, Crypto.Crypto>>();
    expect(encode(digest)).type.toBe<Effect.Effect<Uint8Array<ArrayBufferLike>, S.SchemaError, never>>();
    expect(decodeHex("62656570")).type.toBe<Effect.Effect<Sha256HexType, S.SchemaError, Crypto.Crypto>>();
    expect(encodeHex(digest)).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });
});
