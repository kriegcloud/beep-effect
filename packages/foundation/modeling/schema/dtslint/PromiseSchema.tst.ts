import { PromiseSchema } from "@beep/schema/PromiseSchema";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { PromiseSchema as PromiseSchemaType } from "@beep/schema/PromiseSchema";
import type { Effect } from "effect";

describe("PromiseSchema", () => {
  it("preserves the promise schema surface", () => {
    expect<PromiseSchemaType<unknown>>().type.toBe<globalThis.Promise<unknown>>();
    expect<PromiseSchema<unknown>>().type.toBe<PromiseSchemaType<unknown>>();
    expect<ReturnType<typeof PromiseSchema<unknown>>["Encoded"]>().type.toBe<globalThis.Promise<unknown>>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(PromiseSchema());
    const encode = S.encodeEffect(PromiseSchema());
    const value = globalThis.Promise.resolve("done");

    expect(decode(value)).type.toBe<Effect.Effect<PromiseSchemaType<unknown>, S.SchemaError, never>>();
    expect(encode(value)).type.toBe<Effect.Effect<globalThis.Promise<unknown>, S.SchemaError, never>>();
  });
});
