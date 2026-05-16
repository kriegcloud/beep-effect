/**
 * Discord channel aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $InstallerChannelsDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerChannelsDomainId.create("aggregates/DiscordChannel/DiscordChannel.model");

/**
 * Discord channel family supported in v1.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const DiscordChannelKind = LiteralKit(["guild-text-channel"] as const).pipe(
  $I.annoteSchema("DiscordChannelKind", {
    description: "Discord channel families supported by the P1A dry-run spine.",
  })
);

/**
 * Runtime type for {@link DiscordChannelKind}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type DiscordChannelKind = typeof DiscordChannelKind.Type;

/**
 * Discord channel dry-run status.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const DiscordChannelStatus = LiteralKit(["configured", "missing", "unchecked"] as const).pipe(
  $I.annoteSchema("DiscordChannelStatus", {
    description: "Dry-run validation status for a Discord channel target.",
  })
);

/**
 * Runtime type for {@link DiscordChannelStatus}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type DiscordChannelStatus = typeof DiscordChannelStatus.Type;

/**
 * Discord channel target for v1 installer notifications.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class DiscordChannel extends S.Class<DiscordChannel>($I`DiscordChannel`)(
  {
    id: S.NonEmptyString,
    kind: DiscordChannelKind,
    guildId: S.NonEmptyString,
    channelId: S.NonEmptyString,
    displayName: S.NonEmptyString,
    status: DiscordChannelStatus,
    botTokenReference: OnePasswordReference,
  },
  $I.annote("DiscordChannel", {
    title: "Discord channel",
    description: "A Discord guild/channel target plus a 1Password bot-token reference.",
  })
) {}
