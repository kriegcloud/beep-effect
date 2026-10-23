import { MAX_NESTING_DEPTH } from "@beep/markdown/internal/limits";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("pins the shared parser nesting boundary", () =>
  Effect.sync(() => {
    assert.strictEqual(MAX_NESTING_DEPTH, 256);
  })
);
