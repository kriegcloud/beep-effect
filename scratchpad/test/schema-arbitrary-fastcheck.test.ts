import { faker } from "@faker-js/faker";
import { $ScratchpadId } from "@beep/identity";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import { FastCheck as fc } from "effect/testing";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("schema-arbitrary-fastcheck");

const fake = <A>(
  gen: (fakerModule: typeof faker, context: S.Annotations.ToArbitrary.Context) => A
): S.Annotations.ToArbitrary.Declaration<A, readonly []> =>
  () => (fc, context) =>
    fc.nat().map((seed) => {
      faker.seed(seed);
      return gen(faker, context);
    });

// =============================================================================
// Why this scratch exists
// =============================================================================
//
// Static fixtures prove that one hand-picked value works. Schema-derived
// arbitraries prove that the behavior holds for the whole domain described by
// the schema. When that domain is too broad, the property test fails and tells us
// the schema was under-specified.
//
// This is the practical payoff of schema-first development:
// - runtime boundaries decode the same schema we use for types;
// - property tests generate values from that schema;
// - failures pressure the schema toward precise production constraints.

export class UnsafeRetryPolicy extends S.Class<UnsafeRetryPolicy>($I`UnsafeRetryPolicy`)(
  {
    // This accepts every JavaScript number at runtime, including NaN and
    // infinities. The derived arbitrary mostly exposes the other broad-domain
    // bugs first: negative, tiny, and very large floats.
    timeoutMs: S.Number,
  },
  $I.annote("UnsafeRetryPolicy", {
    description: "Intentionally under-specified retry policy used to show why fixture-only tests are weak.",
  })
) {}

const UnsafeRetryPolicyArbitrary = S.toArbitrary(UnsafeRetryPolicy);

const TimeoutMs = S.Int.check(S.isBetween({ minimum: 0, maximum: 60_000 })).annotate({
  identifier: "TimeoutMs",
  description: "Integer timeout in milliseconds, bounded to the operational retry window.",
  // Faker is useful when generated data should look like product/user data.
  // Seed Faker from FastCheck entropy so failed cases are reproducible.
  toArbitrary: fake((faker) => faker.number.int({ min: 0, max: 60_000 })),
});

export class RetryPolicy extends S.Class<RetryPolicy>($I`RetryPolicy`)(
  {
    timeoutMs: TimeoutMs,
  },
  $I.annote("RetryPolicy", {
    description: "Precisely modeled retry policy whose arbitrary is safe for production-like property tests.",
  })
) {}

const RetryPolicyArbitrary = S.toArbitrary(RetryPolicy);

const toRetryDelaySeconds = (policy: { readonly timeoutMs: number }): number => Math.ceil(policy.timeoutMs / 1000);

const isOperationalRetryDelay = (policy: { readonly timeoutMs: number }): boolean => {
  const retryDelaySeconds = toRetryDelaySeconds(policy);
  return Number.isFinite(policy.timeoutMs) && retryDelaySeconds >= 0 && retryDelaySeconds <= 60;
};

describe("schema-derived arbitraries", () => {
  it("lets a static fixture pass even when the schema is dangerously broad", () => {
    const fixture = UnsafeRetryPolicy.make({ timeoutMs: 5_000 });

    expect(toRetryDelaySeconds(fixture)).toBe(5);
    expect(isOperationalRetryDelay(fixture)).toBe(true);
  });

  it("catches the same broad schema with property-based data", () => {
    const result = fc.check(fc.property(UnsafeRetryPolicyArbitrary, isOperationalRetryDelay), {
      numRuns: 50,
      seed: 20_260_608,
    });

    expect(result.failed).toBe(true);
    expect(result.counterexample).not.toBeNull();
    if (result.counterexample !== null) {
      const [policy] = result.counterexample;
      expect(policy).toBeInstanceOf(UnsafeRetryPolicy);
      expect(isOperationalRetryDelay(policy)).toBe(false);
    }
  });

  it("passes once the schema states the actual finite bounded domain", () => {
    fc.assert(fc.property(RetryPolicyArbitrary, isOperationalRetryDelay), {
      numRuns: 100,
      seed: 20_260_608,
    });
  });

  it("uses faker from an arbitrary annotation without losing schema precision", () => {
    const samples = fc.sample(RetryPolicyArbitrary, {
      numRuns: 5,
      seed: 20_260_608,
    });

    for (const sample of samples) {
      expect(sample).toBeInstanceOf(RetryPolicy);
      expect(isOperationalRetryDelay(sample)).toBe(true);
    }
  });

  it("shows why S.FiniteFromString is often the correct boundary schema", async () => {
    const broadNumber = await Effect.runPromise(Effect.exit(S.decodeUnknownEffect(S.NumberFromString)("Infinity")));
    const finiteNumber = await Effect.runPromise(Effect.exit(S.decodeUnknownEffect(S.FiniteFromString)("Infinity")));

    expect(Exit.isSuccess(broadNumber)).toBe(true);
    expect(Exit.isFailure(finiteNumber)).toBe(true);
  });
});
