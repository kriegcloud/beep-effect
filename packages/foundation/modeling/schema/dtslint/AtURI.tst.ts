import { AtUri } from "@beep/schema/AtURI";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { AtUri as AtUriFromRoot, AtUri as AtUriRootType } from "@beep/schema";
import type { AtUri as AtUriType } from "@beep/schema/AtURI";
import type { Effect } from "effect";
import type * as Brand from "effect/Brand";

const knownAtUri = "at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.post/3jui7kd54zh2y";

describe("AtUri", () => {
  it("preserves the branded AT URI schema surface", () => {
    expect<AtUri>().type.toBe<string & Brand.Brand<"AtUri">>();
    expect<typeof AtUri.Encoded>().type.toBe<string>();
    expect<AtUriType>().type.toBe<string & Brand.Brand<"AtUri">>();
  });

  it("keeps the root barrel aligned with the AtURI subpath", () => {
    expect<typeof AtUriFromRoot>().type.toBe<typeof AtUri>();
    expect<AtUriRootType>().type.toBe<AtUriType>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(AtUri);
    const encode = S.encodeEffect(AtUri);
    const uri = S.decodeSync(AtUri)(knownAtUri);

    expect(uri).type.toBe<AtUriType>();
    expect(decode(knownAtUri)).type.toBe<Effect.Effect<AtUriType, S.SchemaError, never>>();
    expect(encode(uri)).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });
});
