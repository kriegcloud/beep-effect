import { decodePairs } from "@beep/schema-org/internal/rows";
import { SUPERSEDED_TYPE_MAP, SUPERSEDED_TYPES } from "@beep/schema-org/internal/vocabulary";
import { assert, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as MutableHashMap from "effect/MutableHashMap";

// Supply absent and singleton token lists at the decoder boundary. The vendored
// literals remain untouched; the normal-table suite independently pins them.
const malformed = A.map(SUPERSEDED_TYPES, (row) => {
  if (row === "150,793") return "";
  if (row === "211,526") return "211";
  return row;
});

it.effect("supersession decoding skips rows missing either index and retains complete pairs", () =>
  Effect.sync(() => {
    assert.include(SUPERSEDED_TYPES, "150,793", "the absent-row fixture must replace a real pair");
    assert.include(SUPERSEDED_TYPES, "211,526", "the singleton-row fixture must replace a real pair");
    const map = decodePairs(malformed);
    assert.strictEqual(MutableHashMap.size(map), SUPERSEDED_TYPES.length - 2);
    assertNone(MutableHashMap.get(map, 150));
    assertNone(MutableHashMap.get(map, 211));
    assertNone(MutableHashMap.get(map, Number.NaN));
    assertSome(MutableHashMap.get(map, 764), 191);
  })
);

it.effect("the shipped supersession map is the decoder applied to the vendored rows", () =>
  Effect.sync(() => {
    const decoded = decodePairs(SUPERSEDED_TYPES);
    assert.strictEqual(MutableHashMap.size(SUPERSEDED_TYPE_MAP), MutableHashMap.size(decoded));
    for (const [from, to] of decoded) assertSome(MutableHashMap.get(SUPERSEDED_TYPE_MAP, from), to);
  })
);
