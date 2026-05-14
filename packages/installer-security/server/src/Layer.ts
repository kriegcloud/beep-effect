/**
 * installer security server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { P1A_SECRET_REFERENCE_VERB_INPUTS, SecretReferencePlan } from "@beep/installer-security-use-cases/public";
import { InstallerSecurityUseCases } from "@beep/installer-security-use-cases/server";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const decodeSecretReferencePlan = S.decodeUnknownEffect(SecretReferencePlan);

const p1aSecretReferencePlanInput = {
  notes: ["P1A never resolves 1Password references and never stores plaintext secret values."],
  references: [
    {
      id: "discord-bot-token",
      notes: ["Used only by the Discord channel validator in later P1 work."],
      purpose: "discord-bot-token",
      reference: "op://Private/Discord Bot/token",
      status: "reference-valid",
      usedBy: "installer-channels",
    },
    {
      id: "claude-auth",
      notes: ["Provider auth stays reference-shaped until live provider validation is approved."],
      purpose: "claude-auth",
      reference: "op://Private/Claude/token",
      status: "reference-unchecked",
      usedBy: "installer-providers",
    },
    {
      id: "codex-auth",
      notes: ["Provider auth stays reference-shaped until live provider validation is approved."],
      purpose: "codex-auth",
      reference: "op://Private/Codex/token",
      status: "reference-unchecked",
      usedBy: "installer-providers",
    },
  ],
  verbs: P1A_SECRET_REFERENCE_VERB_INPUTS,
} as const;

/**
 * Build the deterministic security dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerSecurityServer = Effect.fn("InstallerSecurityServer.make")(function* () {
  const plan = yield* decodeSecretReferencePlan(p1aSecretReferencePlanInput);

  return {
    previewSecretReferences: () => Effect.succeed(plan),
  };
});

/**
 * Deterministic security server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerSecurityServerLive = Layer.effect(InstallerSecurityUseCases, makeInstallerSecurityServer());
