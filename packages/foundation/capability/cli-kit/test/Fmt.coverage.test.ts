import { Fmt } from "@beep/cli-kit/Fmt";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("non-finite limits and zero-width graphemes keep truncation bounded", () =>
  Effect.sync(() => {
    assert.strictEqual(Fmt.truncate("hello", Number.POSITIVE_INFINITY), "hello");
    assert.strictEqual(Fmt.truncate("hello", Number.NaN), "");
    assert.strictEqual(Fmt.truncate("hello", Number.NEGATIVE_INFINITY), "");
    assert.strictEqual(Fmt.truncate("abc", 1, { ellipsis: "" }), "a");
    assert.strictEqual(Fmt.truncate("abc", 1, { ellipsis: "\u0301" }), "a\u0301");
    assert.strictEqual(Fmt.truncate("abc", 1, { ellipsis: "界" }), "a");
  })
);
