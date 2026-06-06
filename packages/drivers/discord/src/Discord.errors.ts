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
 * Discord driver error reason vocabulary.
 *
 * @example
 * ```ts
 * import { DiscordErrorReason } from "@beep/discord/Discord.errors"
 *
 * console.log(DiscordErrorReason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const DiscordErrorReason = LiteralKit(["request", "transport", "response-status", "response-decoding"]).pipe(
  $I.annoteSchema("DiscordErrorReason", {
    description: "Technical failure reasons emitted by the Discord REST driver.",
  })
);

/**
 * Runtime type for {@link DiscordErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type DiscordErrorReason = typeof DiscordErrorReason.Type;

/**
 * Technical failure raised by the Discord driver boundary.
 *
 * @example
 * ```ts
 * import { DiscordError } from "@beep/discord/Discord.errors"
 *
 * console.log(DiscordError)
 * ```
 *
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
    description: "Redacted technical failure emitted by the Discord REST driver.",
  })
) {}
