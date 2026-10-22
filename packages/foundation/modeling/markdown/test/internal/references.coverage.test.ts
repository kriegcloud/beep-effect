import { ReferenceScanner } from "@beep/markdown/internal/references";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("escaped final punctuation advances past both source characters", () =>
  Effect.sync(() => {
    assert.strictEqual(new ReferenceScanner("(unfinished").parseLinkDestination(), undefined);
    const scanner = new ReferenceScanner("path\\)");
    assert.strictEqual(scanner.parseLinkDestination(), "path)");
    assert.strictEqual(scanner.pos, 6);
    assert.strictEqual(scanner.peek(), -1);
  })
);
