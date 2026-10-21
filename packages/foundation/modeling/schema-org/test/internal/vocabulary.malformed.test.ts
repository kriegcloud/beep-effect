import { SUPERSEDED_TYPE_MAP, SUPERSEDED_TYPES } from "@beep/schema-org/internal/vocabulary";
import { assert, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";
import { vi } from "vitest";

// Supply absent and singleton token lists at the decoder boundary. The vendored
// literals remain untouched; the normal-table suite independently pins them.
vi.mock("effect/String", (importOriginal) =>
  importOriginal<typeof import("effect/String")>().then((actual) => ({
    ...actual,
    split: (row: string, separator: string | RegExp) => {
      if (row === "150,793") return [];
      if (row === "211,526") return actual.split("211", separator);
      return actual.split(row, separator);
    },
  }))
);

it.effect("supersession decoding skips rows missing either index and retains complete pairs", () =>
  Effect.sync(() => {
    assert.strictEqual(MutableHashMap.size(SUPERSEDED_TYPE_MAP), SUPERSEDED_TYPES.length - 2);
    assertNone(MutableHashMap.get(SUPERSEDED_TYPE_MAP, 150));
    assertNone(MutableHashMap.get(SUPERSEDED_TYPE_MAP, 211));
    assertNone(MutableHashMap.get(SUPERSEDED_TYPE_MAP, Number.NaN));
    assertSome(MutableHashMap.get(SUPERSEDED_TYPE_MAP, 764), 191);
  })
);
