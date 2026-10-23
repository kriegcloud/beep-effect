import { encodePath, fileUrlPath } from "@beep/cli-kit/internal/linkTarget";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

it.effect("a relative backslash path is rooted and encoded, while reserved punctuation is data", () =>
  Effect.sync(() => {
    assert.strictEqual(O.getOrUndefined(fileUrlPath("src\\a b.ts")), "/src/a%20b.ts");
    assert.strictEqual(encodePath("/!'()*"), "/%21%27%28%29%2A");
  })
);
