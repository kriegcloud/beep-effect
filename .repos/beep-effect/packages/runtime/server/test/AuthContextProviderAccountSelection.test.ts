import { describe, expect, it } from "bun:test";
import { ProviderAccountSelectionRequiredError } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import { requireProviderAccountId } from "../src/AuthContext/providerAccountSelection";

describe("AuthContext providerAccountId enforcement (C-06)", () => {
  it("fails with ProviderAccountSelectionRequiredError when providerAccountId is missing for google", async () => {
    const program = Effect.gen(function* () {
      const called = yield* Ref.make(0);

      const effect = requireProviderAccountId({
        providerId: "google",
        providerAccountId: undefined,
        callbackURL: "/settings?settingsTab=connections",
        listCandidates: Ref.updateAndGet(called, (n) => n + 1).pipe(
          Effect.as([
            { providerAccountId: "iam_account__a", accountId: "external_a", scope: "s1 s2" },
            { providerAccountId: "iam_account__b", accountId: "external_b", scope: "s1" },
          ])
        ),
      });

      const error = yield* Effect.flip(effect);

      const callCount = yield* Ref.get(called);

      return { error, callCount };
    });

    const { error, callCount } = await Effect.runPromise(program);

    expect(callCount).toBe(1);
    expect(error).toBeInstanceOf(ProviderAccountSelectionRequiredError);
    expect(error.providerId).toBe("google");
    expect(error.requiredParam).toBe("providerAccountId");
    expect(error.select.callbackURL).toBe("/settings?settingsTab=connections");
    expect(error.candidates.length).toBe(2);
  });

  it("does not consult candidates when providerAccountId is provided", async () => {
    const program = Effect.gen(function* () {
      const called = yield* Ref.make(0);

      const selected = yield* requireProviderAccountId({
        providerId: "google",
        providerAccountId: "iam_account__selected",
        callbackURL: "/settings?settingsTab=connections",
        listCandidates: Ref.update(called, (n) => n + 1).pipe(Effect.as([])),
      });

      const callCount = yield* Ref.get(called);

      return { selected, callCount };
    });

    const { selected, callCount } = await Effect.runPromise(program);

    expect(selected).toBe("iam_account__selected");
    expect(callCount).toBe(0);
  });
});
