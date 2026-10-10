import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { InvalidRepoRefError, RepoRef } from "../../effected/github/Repo.ts";

const runs = { arbitrary: fcRuns(100) };
const roundTrips = <A, I>(name: string, schema: S.Codec<A, I>): void => {
  it.effect.prop(`${name}: encoded values decode without failure and preserve the original`, [Arbitrary.schema(schema)], ([value]) => Effect.gen(function* () {
    const encoded = yield* S.encodeEffect(schema)(value);
    const decoded = yield* S.decodeEffect(schema)(encoded);
    assertTrue(S.toEquivalence(schema)(decoded, value));
    assert.deepStrictEqual(yield* S.encodeEffect(schema)(decoded), encoded);
  }), runs);
};
const Segment = S.NonEmptyString.check(S.isPattern(/^[a-zA-Z0-9_-]+$/));
const Coordinates = S.Struct({ owner: Segment, repo: Segment });

describe("Repo schema and parser properties", () => {
  roundTrips("RepoRef", RepoRef);
  roundTrips("InvalidRepoRefError", InvalidRepoRefError);
  it.effect.prop("parsing a formatted slash-free coordinate preserves both segments and formatting is stable", [Arbitrary.schema(Coordinates)], ([fields]) => Effect.gen(function* () {
    const ref = RepoRef.make(fields);
    const parsed = yield* RepoRef.parse(ref.slug);
    assertTrue(S.toEquivalence(RepoRef)(parsed, ref));
    assert.strictEqual(parsed.slug, ref.slug);
    assert.strictEqual((yield* RepoRef.parse(parsed.slug)).slug, parsed.slug);
  }), runs);
});
