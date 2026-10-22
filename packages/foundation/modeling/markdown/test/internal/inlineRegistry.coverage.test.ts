import { inlineDialect } from "@beep/markdown/internal/inlineRegistry";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("reports unsupported runtime dialects as programmer errors", () =>
  Effect.sync(() => {
    assert.throws(
      () => Reflect.apply(inlineDialect, undefined, ["unsupported"]),
      /unknown markdown dialect: unsupported/
    );
  })
);
