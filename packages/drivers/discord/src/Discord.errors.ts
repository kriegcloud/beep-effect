/**
 * Typed errors for the Discord REST driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DiscordId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $DiscordId.create("Discord.errors");

/**
 * Literal vocabulary for recoverable failures at the Discord REST boundary.
 *
 * @example
 * ```ts
 * import { DiscordErrorReason } from "@beep/discord"
 *
 * const isTransportFailure = DiscordErrorReason.is.transport("transport")
 * console.log(isTransportFailure) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const DiscordErrorReason = LiteralKit(["request", "transport", "response-status", "response-decoding"]).pipe(
  $I.annoteSchema("DiscordErrorReason", {
    description: "Literal vocabulary for recoverable failures at the Discord REST boundary.",
  })
);

/**
 * {@inheritDoc DiscordErrorReason}
 *
 * @example
 * ```ts
 * import type { DiscordErrorReason } from "@beep/discord"
 *
 * const reason: DiscordErrorReason = "response-status"
 * console.log(reason)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DiscordErrorReason = typeof DiscordErrorReason.Type;

/**
 * Redacted technical failure raised by the Discord REST driver.
 *
 * @remarks
 * `DiscordError` keeps the recovery reason, HTTP method, path, status, and a
 * sanitized cause string while avoiding bot tokens and raw Discord response
 * bodies.
 *
 * @example
 * ```ts
 * import { DiscordError } from "@beep/discord"
 *
 * const failure = DiscordError.make({
 *   method: "GET",
 *   path: "/channels/channel-1",
 *   reason: "response-status",
 *   status: 404
 * })
 *
 * console.log(failure.reason) // "response-status"
 * ```
 *
 * @see {@link DiscordErrorReason} for the reason vocabulary.
 * @category errors
 * @since 0.0.0
 */
export class DiscordError extends TaggedErrorClass<DiscordError>($I`DiscordError`)(
  "DiscordError",
  {
    cause: S.optionalKey(S.String),
    method: S.optionalKey(S.String),
    path: S.optionalKey(S.String),
    reason: DiscordErrorReason,
    status: S.optionalKey(S.Finite),
  },
  $I.annote("DiscordError", {
    description: "Redacted technical failure raised by the Discord REST driver.",
  })
) {}
