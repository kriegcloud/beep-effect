import { unescapeString } from "@beep/markdown/internal/unescape";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("unknown named entities remain literal and decoding is one pass", () =>
  Effect.sync(() => {
    assert.strictEqual(unescapeString("&zzzzUnknownEntity;"), "&zzzzUnknownEntity;");
    assert.strictEqual(unescapeString("&amp;amp;"), "&amp;");
    assert.strictEqual(unescapeString("\\q"), "\\q");
  })
);
