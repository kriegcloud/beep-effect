/**
 * installer-channels public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerChannelsUseCasesId } from "@beep/identity/packages";
import { DiscordChannel } from "@beep/installer-channels-domain/aggregates/DiscordChannel";
import * as S from "effect/Schema";

const $I = $InstallerChannelsUseCasesId.create("public");

/**
 * Dry-run verb owned by the installer-channels slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class DiscordChannelVerb extends S.Class<DiscordChannelVerb>($I`DiscordChannelVerb`)(
  {
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    summary: S.NonEmptyString,
    requiresApproval: S.Boolean,
    dryRunOnly: S.Boolean,
  },
  $I.annote("DiscordChannelVerb", {
    title: "Discord channel verb",
    description: "Slice-owned dry-run verb contract for Discord channel validation.",
  })
) {}

/**
 * Dry-run Discord channel preview plan.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class DiscordChannelPlan extends S.Class<DiscordChannelPlan>($I`DiscordChannelPlan`)(
  {
    channels: S.Array(DiscordChannel),
    verbs: S.Array(DiscordChannelVerb),
    notes: S.Array(S.NonEmptyString),
  },
  $I.annote("DiscordChannelPlan", {
    title: "Discord channel plan",
    description: "Deterministic preview of Discord routing without sending messages or mutating a guild.",
  })
) {}

/**
 * Static P1A verb contracts owned by the channel slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_DISCORD_CHANNEL_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.channels.validate-discord-target",
    label: "Validate Discord Target",
    requiresApproval: false,
    summary: "Check guild/channel identifiers and bot-token reference shape without contacting Discord.",
  },
  {
    dryRunOnly: true,
    id: "installer.channels.preview-message-route",
    label: "Preview Message Route",
    requiresApproval: true,
    summary: "Render the Discord route a human would approve before live messaging exists.",
  },
] as const;
