import { SegmentMap } from "@beep/law-practice-domain/values";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as S from "effect/Schema";

describe("SegmentMap", () => {
  it.effect("decodes equal segment maps to Equal values", () =>
    Effect.gen(function* () {
      const encoded = { segments: [{ cleanPos: 0, origPos: 2, len: 4 }] };
      const left = yield* S.decodeEffect(SegmentMap)(encoded);
      const right = yield* S.decodeEffect(SegmentMap)(encoded);

      expect(Equal.equals(left, right)).toBe(true);
      expect(left.lookup(1)).toBe(3);
    })
  );
});
