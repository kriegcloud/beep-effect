import { Json } from "@beep/tooling-utils";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual, throws } from "@effect/vitest/utils";
import * as S from "effect/Schema";

describe("Json", () => {
  it("accepts recursive structures of literals, arrays, and objects", () => {
    const decode = S.decodeUnknownSync(Json);
    const value = {
      a: [1, "x", null],
      b: { c: true, d: [{ e: null }] },
    } as const;
    const got = decode(value);
    deepStrictEqual(got, value);
  });

  it("rejects functions, symbols, bigints, and undefined", () => {
    const decode = S.decodeUnknownSync(Json);
    throws(() => decode({ toJSON: () => 1 } as any));
    throws(() => decode(Symbol("s") as any));
    throws(() => decode(10n as any));
    throws(() => decode({ a: undefined } as any));
  });
});
