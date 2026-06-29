import { StrFromUnknown } from "@beep/schema/String";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { StrFromUnknown as RootStrFromUnknown, StrFromUnknown as RootStrFromUnknownType } from "@beep/schema";
import type { StrFromUnknown as StrFromUnknownType } from "@beep/schema/String";
import type { Effect } from "effect";

describe("String", () => {
  it("tracks the unknown-to-string codec types", () => {
    expect<StrFromUnknownType>().type.toBe<string>();
    expect<typeof StrFromUnknown.Encoded>().type.toBe<unknown>();
    expect<typeof StrFromUnknown.DecodingServices>().type.toBe<never>();
    expect<typeof StrFromUnknown.EncodingServices>().type.toBe<never>();
  });

  it("exposes decode and encode helpers with expected effect types", () => {
    const decode = S.decodeUnknownEffect(StrFromUnknown);
    const encode = S.encodeEffect(StrFromUnknown);

    expect(decode({ ok: true })).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
    expect(encode("ok")).type.toBe<Effect.Effect<unknown, S.SchemaError, never>>();
  });

  it("exports unknown-to-string helpers from the package root barrel", () => {
    expect<typeof RootStrFromUnknown>().type.toBe<typeof StrFromUnknown>();
    expect<RootStrFromUnknownType>().type.toBe<StrFromUnknownType>();
  });
});
