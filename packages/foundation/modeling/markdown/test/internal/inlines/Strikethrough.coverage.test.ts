import { strikethroughConstruct } from "@beep/markdown/internal/inlines/strikethrough";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { fakeScanner } from "./fakeScanner.ts";

it.effect("rejects a cursor without a tilde run without emitting text or moving the cursor", () =>
  Effect.sync(() => {
    const scanner = fakeScanner("plain");
    assert.strictEqual(strikethroughConstruct.parse(scanner), false);
    assert.strictEqual(scanner.pos, 0);
    assert.deepStrictEqual(scanner.emitted, []);
    assert.strictEqual(scanner.delimiters, undefined);
  })
);
