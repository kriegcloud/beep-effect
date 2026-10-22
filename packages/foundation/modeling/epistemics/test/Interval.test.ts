import { KnowledgeInterval, KnowledgeIntervalFields, knownAt } from "@beep/epistemics/KnowledgeInterval";
import { holdsAt, ValidInterval, ValidIntervalFields } from "@beep/epistemics/ValidInterval";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const at = DateTime.makeUnsafe;

describe("ValidInterval", () => {
  const decode = S.decodeEffect(ValidInterval);
  const encode = S.encodeEffect(ValidInterval);

  it.effect("round-trips flat epoch-millis columns with a null open end", () =>
    Effect.gen(function* () {
      const open = yield* decode({ validFrom: 1_000, validTo: null });
      const closed = yield* decode({ validFrom: 1_000, validTo: 2_000 });
      assertNone(open.validTo);
      expect(yield* encode(open)).toStrictEqual({ validFrom: 1_000, validTo: null });
      expect(yield* encode(closed)).toStrictEqual({ validFrom: 1_000, validTo: 2_000 });
    })
  );

  it.effect("holds on [validFrom, validTo)", () =>
    Effect.gen(function* () {
      const closed = yield* decode({ validFrom: 1_000, validTo: 2_000 });
      expect(holdsAt(closed, at(999))).toBe(false);
      expect(holdsAt(closed, at(1_000))).toBe(true);
      expect(holdsAt(closed, at(1_999))).toBe(true);
      expect(holdsAt(closed, at(2_000))).toBe(false);
      expect(holdsAt(at(1_500))(closed)).toBe(true);
    })
  );

  it.effect("holds from validFrom onward when the upper bound is open", () =>
    Effect.gen(function* () {
      const open = yield* decode({ validFrom: 1_000, validTo: null });
      expect(holdsAt(open, at(999))).toBe(false);
      expect(holdsAt(open, at(4_102_444_800_000))).toBe(true);
    })
  );

  it.effect("exposes its fields for spreading into flat rows", () =>
    Effect.gen(function* () {
      const Row = S.Struct({ ...ValidIntervalFields, name: S.String });
      const encoded = { name: "fact", validFrom: 1_000, validTo: null };
      const row = yield* S.decodeEffect(Row)(encoded);
      expect(holdsAt(row, at(1_000))).toBe(true);
      expect(yield* S.encodeEffect(Row)(row)).toStrictEqual(encoded);
    })
  );
});

describe("KnowledgeInterval", () => {
  const decode = S.decodeEffect(KnowledgeInterval);
  const encode = S.encodeEffect(KnowledgeInterval);

  it.effect("round-trips flat epoch-millis columns with a null open end", () =>
    Effect.gen(function* () {
      const current = yield* decode({ expiredAt: null, recordedAt: 1_000 });
      const expired = yield* decode({ expiredAt: 2_000, recordedAt: 1_000 });
      expect(yield* encode(current)).toStrictEqual({ expiredAt: null, recordedAt: 1_000 });
      expect(yield* encode(expired)).toStrictEqual({ expiredAt: 2_000, recordedAt: 1_000 });
    })
  );

  it.effect("is known on [recordedAt, expiredAt)", () =>
    Effect.gen(function* () {
      const expired = yield* decode({ expiredAt: 2_000, recordedAt: 1_000 });
      expect(knownAt(expired, at(999))).toBe(false);
      expect(knownAt(expired, at(1_000))).toBe(true);
      expect(knownAt(expired, at(1_999))).toBe(true);
      expect(knownAt(expired, at(2_000))).toBe(false);
      expect(knownAt(at(1_500))(expired)).toBe(true);
    })
  );

  it.effect("is known from recordedAt onward while current", () =>
    Effect.gen(function* () {
      const current = yield* decode({ expiredAt: null, recordedAt: 1_000 });
      expect(knownAt(current, at(999))).toBe(false);
      expect(knownAt(current, at(4_102_444_800_000))).toBe(true);
    })
  );

  it.effect("exposes its fields for spreading into flat rows", () =>
    Effect.gen(function* () {
      const Row = S.Struct({ ...KnowledgeIntervalFields, name: S.String });
      const encoded = { expiredAt: null, name: "fact", recordedAt: 1_000 };
      const row = yield* S.decodeEffect(Row)(encoded);
      expect(knownAt(row, at(1_000))).toBe(true);
      expect(yield* S.encodeEffect(Row)(row)).toStrictEqual(encoded);
    })
  );
});

describe("interval schema laws", () => {
  it.effect.prop(
    "round-trips schema-derived intervals through their flat columns",
    [Arbitrary.schema(ValidInterval), Arbitrary.schema(KnowledgeInterval)],
    ([valid, knowledge]) =>
      Effect.gen(function* () {
        const validRoundTrip = yield* S.decodeEffect(ValidInterval)(yield* S.encodeEffect(ValidInterval)(valid));
        const knowledgeRoundTrip = yield* S.decodeEffect(KnowledgeInterval)(
          yield* S.encodeEffect(KnowledgeInterval)(knowledge)
        );
        expect(S.toEquivalence(ValidInterval)(validRoundTrip, valid)).toBe(true);
        expect(S.toEquivalence(KnowledgeInterval)(knowledgeRoundTrip, knowledge)).toBe(true);
      })
  );
});
