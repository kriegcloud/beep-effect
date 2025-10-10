import { describe, it } from "bun:test";
import { deepStrictEqual, throws } from "@beep/testkit";
import { Json } from "@beep/tooling-utils/schemas/Json";
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
    throws(() => decode({ toJSON: () => 1 }));
    throws(() => decode(Symbol("s")));
    throws(() => decode(10n));
    throws(() => decode({ a: undefined }));
  });
});
