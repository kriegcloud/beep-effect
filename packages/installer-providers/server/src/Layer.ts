/**
 * installer providers server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { P1A_PROVIDER_ACCOUNT_VERB_INPUTS, ProviderAccountPlan } from "@beep/installer-providers-use-cases/public";
import { InstallerProvidersUseCases } from "@beep/installer-providers-use-cases/server";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const decodeProviderAccountPlan = S.decodeUnknownEffect(ProviderAccountPlan);

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

  return {
    previewProviderAccounts: () => Effect.succeed(plan),
  };
});

/**
 * Deterministic provider server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerProvidersServerLive = Layer.effect(InstallerProvidersUseCases, makeInstallerProvidersServer());
