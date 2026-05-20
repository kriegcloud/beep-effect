/**
 * installer security server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import {
  P1A_SECRET_REFERENCE_VERB_INPUTS,
  SecretReferencePlan,
  SecretReferenceReadError,
  SecretReferenceValidationRequest,
  SecretReferenceValidationResult,
} from "@beep/installer-security-use-cases/public";
import { InstallerSecurityUseCases } from "@beep/installer-security-use-cases/server";
import { OnePasswordCli } from "@beep/onepassword-cli";
import type { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import type { TUnsafe } from "@beep/types";
import { Effect, Layer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const decodeSecretReferencePlan = S.decodeUnknownEffect(SecretReferencePlan);
const decodeSecretReferenceValidationRequest = S.decodeUnknownEffect(SecretReferenceValidationRequest);

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
  const onePassword = yield* OnePasswordCli;
  const isApprovedReference = (reference: OnePasswordReference): boolean =>
    A.some(plan.references, (approved) => approved.reference === reference);
  const approvedValidationRequest = (request: SecretReferenceValidationRequest) =>
    A.findFirst(
      plan.references,
      (approved) =>
        approved.id === request.id &&
        approved.purpose === request.purpose &&
        approved.reference === request.reference &&
        approved.usedBy === request.usedBy
    );

  return {
    previewSecretReferences: () => Effect.succeed(plan),
    readSecretReference: Effect.fn("InstallerSecurityServer.readSecretReference")(function* (
      reference: OnePasswordReference
    ) {
      if (!isApprovedReference(reference)) {
        return yield* new SecretReferenceReadError({
          message: "Refusing to resolve unapproved 1Password reference.",
          reference,
        });
      }

      return yield* onePassword.read(reference).pipe(
        Effect.mapError(
          () =>
            new SecretReferenceReadError({
              message: "Unable to resolve approved 1Password reference.",
              reference,
            })
        )
      );
    }),
    validateSecretReference: Effect.fn("InstallerSecurityServer.validateSecretReference")(function* (
      rawRequest: SecretReferenceValidationRequest
    ) {
      const request = yield* decodeSecretReferenceValidationRequest(rawRequest);
      const approved = approvedValidationRequest(request);

      if (O.isNone(approved)) {
        return new SecretReferenceValidationResult({
          message: "1Password reference is not approved for this installer proof.",
          purpose: request.purpose,
          reference: request.reference,
          status: "reference-missing",
          usedBy: request.usedBy,
        });
      }

      return yield* onePassword.probeReference(request.reference).pipe(
        Effect.match({
          onFailure: () =>
            new SecretReferenceValidationResult({
              message: "1Password reference could not be resolved.",
              purpose: request.purpose,
              reference: request.reference,
              status: "reference-missing",
              usedBy: request.usedBy,
            }),
          onSuccess: (probe) =>
            new SecretReferenceValidationResult({
              message: "1Password reference resolved without exposing its value.",
              purpose: request.purpose,
              reference: request.reference,
              status: "reference-valid",
              usedBy: request.usedBy,
              ...R.getSomes({
                byteLength: S.decodeUnknownOption(S.Number)(probe.byteLength),
              }),
            }),
        })
      );
    }),
  };
});

const installerSecurityServerEffect: Effect.Effect<TUnsafe.Any, S.SchemaError, OnePasswordCli> =
  makeInstallerSecurityServer();

/**
 * Deterministic security server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerSecurityServerLive: Layer.Layer<InstallerSecurityUseCases, S.SchemaError, OnePasswordCli> =
  Layer.effect(InstallerSecurityUseCases, installerSecurityServerEffect);
