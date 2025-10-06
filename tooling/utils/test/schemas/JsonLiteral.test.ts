import { JsonLiteral } from "@beep/tooling-utils";
import { describe, it } from "@effect/vitest";
import { deepStrictEqual, throws } from "@effect/vitest/utils";
import * as S from "effect/Schema";

describe("JsonLiteral", () => {
  it("accepts primitives: string, number, boolean, null", () => {
    const decode = S.decodeUnknownSync(JsonLiteral);
    deepStrictEqual(decode("hello"), "hello");
    deepStrictEqual(decode(42), 42);
    deepStrictEqual(decode(true), true);
    deepStrictEqual(decode(null), null);
  });

  it("rejects non-literals like objects and arrays", () => {
    const decode = S.decodeUnknownSync(JsonLiteral);
    throws(() => decode({}));
    throws(() => decode([]));
    throws(() => decode(undefined));
  });
});
