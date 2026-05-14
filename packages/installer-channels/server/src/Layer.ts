/**
 * installer channels server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { DiscordChannelPlan, P1A_DISCORD_CHANNEL_VERB_INPUTS } from "@beep/installer-channels-use-cases/public";
import { InstallerChannelsUseCases } from "@beep/installer-channels-use-cases/server";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const decodeDiscordChannelPlan = S.decodeUnknownEffect(DiscordChannelPlan);

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

  return {
    previewDiscordChannels: () => Effect.succeed(plan),
  };
});

/**
 * Deterministic channel server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerChannelsServerLive = Layer.effect(InstallerChannelsUseCases, makeInstallerChannelsServer());
