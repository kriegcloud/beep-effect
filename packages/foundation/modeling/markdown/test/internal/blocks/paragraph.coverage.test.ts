import { paragraphConstruct } from "@beep/markdown/internal/blocks/paragraph";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("paragraph rejects block children", () =>
  Effect.sync(() => {
    assert.strictEqual(paragraphConstruct.canContain("paragraph"), false);
  })
);
