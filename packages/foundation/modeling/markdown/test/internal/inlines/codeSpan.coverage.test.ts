import { codeSpanConstruct } from "@beep/markdown/internal/inlines/codeSpan";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { fakeScanner } from "./fakeScanner.ts";

it.effect("refuses a non-backtick without advancing or emitting text", () =>
  Effect.sync(() => {
    const scanner = fakeScanner("ordinary");
    assert.strictEqual(codeSpanConstruct.parse(scanner), false);
    assert.strictEqual(scanner.pos, 0);
    assert.deepStrictEqual(scanner.emitted, []);
  })
);
