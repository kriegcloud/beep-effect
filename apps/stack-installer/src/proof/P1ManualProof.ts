/**
 * App-local P1 Manual Mode proof harness.
 *
 * @packageDocumentation
 * @category proof
 * @since 0.0.0
 */

import { DiscordChannel } from "@beep/installer-channels-domain/aggregates/DiscordChannel";
import { InstallerChannelsServerLive } from "@beep/installer-channels-server";
import { DiscordLiveValidationRequest } from "@beep/installer-channels-use-cases";
import { InstallerChannelsUseCases } from "@beep/installer-channels-use-cases/server";
import { InstallerDependenciesServerLive } from "@beep/installer-dependencies-server";
import { InstallerDependenciesUseCases } from "@beep/installer-dependencies-use-cases/server";
import { InstallerProvidersServerLive } from "@beep/installer-providers-server";
import { InstallerProvidersUseCases } from "@beep/installer-providers-use-cases/server";
import { InstallerSecurityServerLive } from "@beep/installer-security-server";
import { SecretReferenceValidationRequest } from "@beep/installer-security-use-cases";
import { InstallerSecurityUseCases } from "@beep/installer-security-use-cases/server";
import {
  AIStackManifest,
  ManifestCapability,
  ManifestDiscordChannel,
  ManifestProvider,
  P1LiveProofSnapshot,
  ValidationEvent,
} from "@beep/installer-workspace-domain/aggregates/StackManifest";
import { P1ManualProofRequest, P1ManualProofResult } from "@beep/installer-workspace-use-cases";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeP1ManualProofRequest = S.decodeUnknownEffect(P1ManualProofRequest);

/**
 * Layer that composes the live P1 installer slice services.
 *
 * @category proof
 * @since 0.0.0
 */
export const P1ManualProofSliceLayer = Layer.mergeAll(
  InstallerDependenciesServerLive,
  InstallerSecurityServerLive,
  InstallerProvidersServerLive,
  InstallerChannelsServerLive
);

const validationEvent = (
  id: string,
  tier: "existence" | "version" | "config" | "liveness" | "user-confirmation",
  status: "passed" | "failed" | "indeterminate",
  subject: string,
  message: string
) =>
  new ValidationEvent({
    id,
    message,
    status,
    subject,
    tier,
  });

/**
 * Run the live Manual Mode P1 proof and return only sanitized evidence.
 *
 * @category proof
 * @since 0.0.0
 */
export const runP1ManualProof = Effect.fn("StackInstaller.runP1ManualProof")(function* (
  rawRequest: P1ManualProofRequest
) {
  const request = yield* decodeP1ManualProofRequest(rawRequest);
  const dependencies = yield* InstallerDependenciesUseCases;
  const security = yield* InstallerSecurityUseCases;
  const providers = yield* InstallerProvidersUseCases;
  const channels = yield* InstallerChannelsUseCases;

  const dependencyValidations = yield* dependencies.validateRequiredCommands();
  const secretValidation = yield* security.validateSecretReference(
    new SecretReferenceValidationRequest({
      id: "discord-bot-token",
      purpose: "discord-bot-token",
      reference: request.discordBotTokenReference,
      usedBy: "installer-channels",
    })
  );
  const botToken = yield* security.readSecretReference(request.discordBotTokenReference);
  const providerValidations = yield* providers.validateProviderAuths();
  const channel = new DiscordChannel({
    botTokenReference: request.discordBotTokenReference,
    channelId: request.discordChannelId,
    displayName: request.discordChannelDisplayName,
    guildId: request.discordGuildId,
    id: "discord-ai-stack-installer",
    kind: "guild-text-channel",
    status: "unchecked",
  });
  const discordValidation = yield* channels.validateDiscordChannel(
    new DiscordLiveValidationRequest({
      channel,
      testMessageContent: request.testMessageContent,
    }),
    botToken
  );

  const providersForManifest = A.map(
    providerValidations,
    (provider) =>
      new ManifestProvider({
        authMode: provider.authMode,
        provider: provider.provider,
        status: provider.status,
      })
  );

  const providerEvents = A.map(providerValidations, (provider) =>
    validationEvent(
      `provider-${provider.provider}-auth`,
      "liveness",
      provider.status === "configured" ? "passed" : "failed",
      `installer-providers:${provider.provider}`,
      provider.message
    )
  );
  const dependencyEvents = A.map(dependencyValidations, (dependency) =>
    validationEvent(
      `dependency-${dependency.dependency.id}`,
      "existence",
      dependency.dependency.status === "present" ? "passed" : "failed",
      `installer-dependencies:${dependency.dependency.name}`,
      dependency.message
    )
  );
  const discordMessage = pipe(
    O.fromUndefinedOr(discordValidation.messageId),
    O.match({
      onNone: () => discordValidation.message,
      onSome: (messageId) => `${discordValidation.message} Message ID: ${messageId}.`,
    })
  );

  const manifest = new AIStackManifest({
    capabilities: [
      new ManifestCapability({
        id: "provider-claude",
        label: "Claude Provider",
        summary: "Claude local-session status was validated in Manual Mode.",
      }),
      new ManifestCapability({
        id: "provider-codex",
        label: "Codex Provider",
        summary: "Codex local-session status was validated in Manual Mode.",
      }),
      new ManifestCapability({
        id: "channel-discord",
        label: "Discord Channel",
        summary: "Discord channel liveness and test-message delivery were validated.",
      }),
    ],
    credentialReferences: [request.discordBotTokenReference],
    discordChannel: new ManifestDiscordChannel({
      channelId: request.discordChannelId,
      displayName: request.discordChannelDisplayName,
      guildId: request.discordGuildId,
    }),
    dryRunOnly: false,
    manifestId: `stack-installer-p1-live-${request.targetPlatform}`,
    providers: providersForManifest,
    targetPlatform: request.targetPlatform,
    version: "p1.live.0",
  });

  return new P1ManualProofResult({
    snapshot: new P1LiveProofSnapshot({
      generatedBy: `@beep/stack-installer:${request.operatorLabel}`,
      manifest,
      validationEvents: [
        ...dependencyEvents,
        validationEvent(
          "onepassword-discord-token-reference",
          "liveness",
          secretValidation.status === "reference-valid" ? "passed" : "failed",
          "installer-security:discord-bot-token",
          secretValidation.message
        ),
        ...providerEvents,
        validationEvent(
          "discord-test-message",
          "liveness",
          discordValidation.status === "configured" ? "passed" : "failed",
          "installer-channels:discord",
          discordMessage
        ),
      ],
    }),
  });
});
