import { type ProviderAccountCandidate, ProviderAccountSelectionRequiredError } from "@beep/shared-domain/Policy";
import * as Effect from "effect/Effect";

type RequireProviderAccountIdArgs<E, R> = {
  readonly providerId: string;
  readonly providerAccountId?: string | undefined;
  readonly listCandidates: Effect.Effect<ReadonlyArray<ProviderAccountCandidate>, E, R>;
  readonly callbackURL: "/settings?settingsTab=connections";
};

/**
 * Enforces deterministic provider account selection for multi-account OAuth providers.
 *
 * Demo-fatal invariant (C-06):
 * - When provider is "google" and providerAccountId is missing, the server must never pick
 *   an arbitrary linked account. It must fail with ProviderAccountSelectionRequiredError.
 */
export const requireProviderAccountId = <E, R>(
  args: RequireProviderAccountIdArgs<E, R>
): Effect.Effect<string | undefined, E | ProviderAccountSelectionRequiredError, R> =>
  Effect.gen(function* () {
    if (args.providerId !== "google") {
      return args.providerAccountId;
    }

    if (args.providerAccountId !== undefined) {
      return args.providerAccountId;
    }

    const candidates = yield* args.listCandidates;

    return yield* new ProviderAccountSelectionRequiredError({
      providerId: "google",
      requiredParam: "providerAccountId",
      candidates: [...candidates],
      select: { callbackURL: args.callbackURL },
      message: "providerAccountId is required",
    });
  });
