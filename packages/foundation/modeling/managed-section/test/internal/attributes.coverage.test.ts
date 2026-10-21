import { parseAttributeRun } from "@beep/managed-section/internal/attributes";
import { describe, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";

describe("attribute run boundary coverage", () => {
  it.effect("refuses incomplete runs instead of accepting a partial record", () =>
    Effect.sync(() => {
      for (const run of [
        "",
        'a="x" ',
        'a="x"\t',
        '9name="x"',
        '_name="x"',
        '-name="x"',
        'a="unclosed',
        'a="',
        "a",
        "a=x",
        'a="x"b="y"',
        'a="x" a="y"',
        'a="x\ny"',
        'a="x\ry"',
      ]) {
        assertNone(parseAttributeRun(run));
      }
    })
  );
  it.effect("retains pairs in insertion order across tabs and spaces", () =>
    Effect.sync(() => {
      assertSome(parseAttributeRun('Z9_-=""\t  a="--- = 😀"'), { "Z9_-": "", a: "--- = 😀" });
    })
  );
});
