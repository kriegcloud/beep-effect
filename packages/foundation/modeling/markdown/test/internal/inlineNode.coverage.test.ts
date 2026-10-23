import { insertAfter, makeInlineNode, unlink } from "@beep/markdown/internal/inlineNode";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("inserts and unlinks siblings with no parent container", () =>
  Effect.sync(() => {
    const first = makeInlineNode("text", 0, 1, "a");
    const second = makeInlineNode("text", 1, 2, "b");
    insertAfter(first, second);
    assert.strictEqual(first.next, second);
    assert.strictEqual(second.prev, first);
    assert.strictEqual(second.parent, undefined);
    unlink(first);
    assert.strictEqual(second.prev, undefined);
    unlink(second);
    assert.strictEqual(second.next, undefined);
  })
);
