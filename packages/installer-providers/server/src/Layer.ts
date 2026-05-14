/**
 * installer providers server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { AiProviderCli, type AiProviderCliProvider } from "@beep/ai-provider-cli";
import {
  P1A_PROVIDER_ACCOUNT_VERB_INPUTS,
  ProviderAccountPlan,
  ProviderAuthValidationResult,
} from "@beep/installer-providers-use-cases/public";
import { InstallerProvidersUseCases } from "@beep/installer-providers-use-cases/server";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const decodeProviderAccountPlan = S.decodeUnknownEffect(ProviderAccountPlan);
const p1ProviderAuthProviders = ["claude", "codex"] as const satisfies ReadonlyArray<AiProviderCliProvider>;

const p1aProviderAccountPlanInput = {
  accounts: [
    {
      authMode: "one-password-reference",
      credentialReference: "op://Private/Claude/token",
      displayName: "Claude",
      id: "claude",
      provider: "claude",
      status: "unchecked",
      workspaceHint: "Claude credentials are validated only after manual approval.",
    },
    {
      authMode: "one-password-reference",
      credentialReference: "op://Private/Codex/token",
      displayName: "Codex",
      id: "codex",
      provider: "codex",
      status: "unchecked",
      workspaceHint: "Codex credentials are validated only after manual approval.",
    },
  ],
  notes: ["P1A does not launch provider CLIs, exchange tokens, or call provider APIs."],
  verbs: P1A_PROVIDER_ACCOUNT_VERB_INPUTS,
} as const;

/**
 * Build the deterministic provider dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerProvidersServer = Effect.fn("InstallerProvidersServer.make")(function* () {
  const plan = yield* decodeProviderAccountPlan(p1aProviderAccountPlanInput);
  const providerCli = yield* AiProviderCli;

  const validateProvider = Effect.fn("InstallerProvidersServer.validateProvider")(function* (
    provider: AiProviderCliProvider
  ) {
    return yield* providerCli.checkAuth(provider).pipe(
      Effect.match({
        onFailure: () =>
          new ProviderAuthValidationResult({
            authMode: "existing-local-session",
            command: provider,
            message: "Provider CLI status command could not run.",
            provider,
            status: "missing",
          }),
        onSuccess: (probe) =>
          new ProviderAuthValidationResult({
            authMode: "existing-local-session",
            command: probe.command,
            message:
              probe.status === "authenticated"
                ? "Provider CLI reports an authenticated local session."
                : "Provider CLI does not report an authenticated local session.",
            provider,
            status: probe.status === "authenticated" ? "configured" : "missing",
          }),
      })
    );
  });

  return {
    previewProviderAccounts: () => Effect.succeed(plan),
    validateProviderAuths: () => Effect.forEach(p1ProviderAuthProviders, validateProvider, { concurrency: 2 }),
  };
});

/**
 * Deterministic provider server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerProvidersServerLive = Layer.effect(InstallerProvidersUseCases, makeInstallerProvidersServer());
