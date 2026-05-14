/**
 * Data models for Discord REST probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DiscordId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $DiscordId.create("Discord.models");

/**
 * Discord driver configuration.
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordConfigInput extends S.Class<DiscordConfigInput>($I`DiscordConfigInput`)(
  {
    baseUrl: S.optionalKey(S.String),
  },
  $I.annote("DiscordConfigInput", {
    description: "Optional Discord API base URL override for tests and local adapters.",
  })
) {}

/**
 * Discord channel lookup request.
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordChannelRequest extends S.Class<DiscordChannelRequest>($I`DiscordChannelRequest`)(
  {
    channelId: S.NonEmptyString,
  },
  $I.annote("DiscordChannelRequest", {
    description: "Discord channel lookup request.",
  })
) {}

/**
 * Discord message creation request.
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordCreateMessageRequest extends S.Class<DiscordCreateMessageRequest>($I`DiscordCreateMessageRequest`)(
  {
    channelId: S.NonEmptyString,
    content: S.NonEmptyString,
  },
  $I.annote("DiscordCreateMessageRequest", {
    description: "Discord message creation request with deterministic content.",
  })
) {}

/**
 * Redacted Discord channel proof metadata.
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordChannelProof extends S.Class<DiscordChannelProof>($I`DiscordChannelProof`)(
  {
    channelId: S.NonEmptyString,
    guildId: S.optionalKey(S.String),
    name: S.optionalKey(S.String),
    status: S.Number,
  },
  $I.annote("DiscordChannelProof", {
    description: "Sanitized Discord channel lookup proof.",
  })
) {}

/**
 * Redacted Discord message proof metadata.
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordMessageProof extends S.Class<DiscordMessageProof>($I`DiscordMessageProof`)(
  {
    channelId: S.NonEmptyString,
    messageId: S.NonEmptyString,
    status: S.Number,
    timestamp: S.optionalKey(S.String),
  },
  $I.annote("DiscordMessageProof", {
    description: "Sanitized Discord message proof metadata.",
  })
) {}
