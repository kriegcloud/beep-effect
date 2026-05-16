/**
 * installer channels server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { Discord, DiscordChannelRequest, DiscordCreateMessageRequest } from "@beep/discord";
import {
  DiscordChannelPlan,
  DiscordLiveValidationRequest,
  DiscordLiveValidationResult,
  P1A_DISCORD_CHANNEL_VERB_INPUTS,
} from "@beep/installer-channels-use-cases/public";
import { InstallerChannelsUseCases } from "@beep/installer-channels-use-cases/server";
import type { TUnsafe } from "@beep/types";
import { Effect, Layer, type Redacted } from "effect";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const decodeDiscordChannelPlan = S.decodeUnknownEffect(DiscordChannelPlan);
const decodeDiscordLiveValidationRequest = S.decodeUnknownEffect(DiscordLiveValidationRequest);

const p1aDiscordChannelPlanInput = {
  channels: [
    {
      botTokenReference: "op://Private/Discord Bot/token",
      channelId: "012345678901234567",
      displayName: "ai-stack-installer",
      guildId: "987654321098765432",
      id: "discord-ai-stack-installer",
      kind: "guild-text-channel",
      status: "unchecked",
    },
  ],
  notes: ["Discord is the only v1 channel; P1A does not send messages or update guild configuration."],
  verbs: P1A_DISCORD_CHANNEL_VERB_INPUTS,
} as const;

/**
 * Build the deterministic channel dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerChannelsServer = Effect.fn("InstallerChannelsServer.make")(function* () {
  const plan = yield* decodeDiscordChannelPlan(p1aDiscordChannelPlanInput);
  const discord = yield* Discord;

  return {
    previewDiscordChannels: () => Effect.succeed(plan),
    validateDiscordChannel: Effect.fn("InstallerChannelsServer.validateDiscordChannel")(function* (
      rawRequest: DiscordLiveValidationRequest,
      botToken: Redacted.Redacted<string>
    ) {
      const request = yield* decodeDiscordLiveValidationRequest(rawRequest);

      return yield* Effect.gen(function* () {
        yield* discord.getChannel(new DiscordChannelRequest({ channelId: request.channel.channelId }), botToken);
        const message = yield* discord.createMessage(
          new DiscordCreateMessageRequest({
            channelId: request.channel.channelId,
            content: request.testMessageContent,
          }),
          botToken
        );

        return new DiscordLiveValidationResult({
          channel: {
            ...request.channel,
            status: "configured",
          },
          message: "Discord channel is live and accepted the P1 test message.",
          status: "configured",
          ...R.getSomes({
            messageId: S.decodeUnknownOption(S.String)(message.messageId),
          }),
        });
      }).pipe(
        Effect.match({
          onFailure: () =>
            new DiscordLiveValidationResult({
              channel: {
                ...request.channel,
                status: "missing",
              },
              message: "Discord channel liveness or test-message proof failed.",
              status: "missing",
            }),
          onSuccess: (result) => result,
        })
      );
    }),
  };
});

const installerChannelsServerEffect: Effect.Effect<TUnsafe.Any, S.SchemaError, Discord> = makeInstallerChannelsServer();

/**
 * Deterministic channel server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerChannelsServerLive: Layer.Layer<InstallerChannelsUseCases, S.SchemaError, Discord> = Layer.effect(
  InstallerChannelsUseCases,
  installerChannelsServerEffect
);
