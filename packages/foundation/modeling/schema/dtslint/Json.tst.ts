import { decodeJsonString, encodeJsonString } from "@beep/schema/Json";
import { describe, expect, it } from "tstyche";
import type { Effect } from "effect";
import type * as S from "effect/Schema";

describe("Json", () => {
  it("exposes JSON string codecs with SchemaError channels", () => {
    expect(decodeJsonString("{}")).type.toBe<Effect.Effect<unknown, S.SchemaError, never>>();
    expect(encodeJsonString({ ok: true })).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });
});
