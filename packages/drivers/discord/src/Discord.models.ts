/**
 * Data models for Discord REST probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DiscordId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $DiscordId.create("Discord.models");

/**
 * Discord's public REST v10 base URL.
 *
 * @example
 * ```ts
 * import { DISCORD_API_URL } from "@beep/discord"
 *
 * console.log(DISCORD_API_URL) // "https://discord.com/api/v10"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const DISCORD_API_URL = "https://discord.com/api/v10";

/**
 * Runtime configuration accepted by {@link Discord.makeLayer}.
 *
 * @remarks
 * Omit `baseUrl` for Discord's public v10 API. Tests and local adapters can
 * provide a replacement base URL; the service layer normalizes trailing slashes
 * before building request paths.
 *
 * @example
 * ```ts
 * import { DiscordConfigInput } from "@beep/discord"
 *
 * const config = DiscordConfigInput.make({
 *   baseUrl: "https://discord.example.test/api/v10/"
 * })
 *
 * console.log(config.baseUrl)
 * ```
 *
 * @see {@link Discord.makeLayer}
 * @category models
 * @since 0.0.0
 */
export class DiscordConfigInput extends S.Class<DiscordConfigInput>($I`DiscordConfigInput`)(
  {
    baseUrl: S.String.pipe(SchemaUtils.withKeyDefaults(DISCORD_API_URL)).annotateKey({
      description: "Discord REST base URL; defaults to Discord's public v10 API.",
    }),
  },
  $I.annote("DiscordConfigInput", {
    description: "Runtime configuration accepted by the Discord REST driver layer.",
  })
) {}

/**
 * Request payload for proving a Discord channel can be reached.
 *
 * @example
 * ```ts
 * import { DiscordChannelRequest } from "@beep/discord"
 *
 * const request = DiscordChannelRequest.make({
 *   channelId: "123456789012345678"
 * })
 *
 * console.log(request.channelId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordChannelRequest extends S.Class<DiscordChannelRequest>($I`DiscordChannelRequest`)(
  {
    channelId: S.NonEmptyString,
  },
  $I.annote("DiscordChannelRequest", {
    description: "Request payload for proving a Discord channel can be reached.",
  })
) {}

/**
 * Request payload for creating a Discord proof message.
 *
 * @remarks
 * The service sends the content with `allowed_mentions.parse` set to an empty
 * array so proof messages do not notify users, roles, or everyone mentions.
 *
 * @example
 * ```ts
 * import { DiscordCreateMessageRequest } from "@beep/discord"
 *
 * const request = DiscordCreateMessageRequest.make({
 *   channelId: "123456789012345678",
 *   content: "P1 Discord proof"
 * })
 *
 * console.log(request.content)
 * ```
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
    description: "Request payload for creating a Discord proof message.",
  })
) {}

/**
 * Sanitized metadata returned after a successful channel lookup.
 *
 * @remarks
 * The proof keeps the channel identifier, HTTP status, and optional guild/name
 * metadata needed for liveness evidence without retaining the raw Discord
 * response payload.
 *
 * @example
 * ```ts
 * import { DiscordChannelProof } from "@beep/discord"
 *
 * const proof = DiscordChannelProof.make({
 *   channelId: "123456789012345678",
 *   guildId: "987654321098765432",
 *   name: "proof-channel",
 *   status: 200
 * })
 *
 * console.log(proof.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordChannelProof extends S.Class<DiscordChannelProof>($I`DiscordChannelProof`)(
  {
    channelId: S.NonEmptyString,
    guildId: S.optionalKey(S.String),
    name: S.optionalKey(S.String),
    status: S.Finite,
  },
  $I.annote("DiscordChannelProof", {
    description: "Sanitized metadata returned after a successful channel lookup.",
  })
) {}

/**
 * Sanitized metadata returned after a successful proof message creation.
 *
 * @remarks
 * The proof records identifiers, HTTP status, and Discord's optional timestamp
 * while excluding message content and authorization data.
 *
 * @example
 * ```ts
 * import { DiscordMessageProof } from "@beep/discord"
 *
 * const proof = DiscordMessageProof.make({
 *   channelId: "123456789012345678",
 *   messageId: "111111111111111111",
 *   status: 200,
 *   timestamp: "2026-05-14T14:30:00.000Z"
 * })
 *
 * console.log(proof.messageId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DiscordMessageProof extends S.Class<DiscordMessageProof>($I`DiscordMessageProof`)(
  {
    channelId: S.NonEmptyString,
    messageId: S.NonEmptyString,
    status: S.Finite,
    timestamp: S.optionalKey(S.String),
  },
  $I.annote("DiscordMessageProof", {
    description: "Sanitized metadata returned after a successful proof message creation.",
  })
) {}
