/**
 * Chat conversation type schemas and compatibility helpers for `@beep/clawhole`.
 *
 * This module ports the legacy OpenClaw `normalizeChatType` helper to the
 * repository's schema-first conventions while preserving its compatibility
 * behavior for channel-facing inputs.
 *
 * @module @beep/clawhole/channels/ChatType
 * @since 0.0.0
 */

import { $ClawholeId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Effect, Match, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("channels/ChatType");

const ChatTypeBase = LiteralKit(["direct", "group", "channel"] as const);

/**
 * Canonical chat conversation classification used by channel-facing metadata.
 *
 * @example
 * ```typescript
 * import { ChatType } from "@beep/clawhole/channels/ChatType"
 * import * as S from "effect/Schema"
 *
 * const decodeChatType = S.decodeUnknownSync(ChatType)
 *
 * console.log(decodeChatType("group")) // "group"
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const ChatType = ChatTypeBase.pipe(
  $I.annoteSchema("ChatType", {
    description: "Canonical chat conversation classification used by channel-facing metadata.",
  }),
  SchemaUtils.withLiteralKitStatics(ChatTypeBase)
);

/**
 * Type of {@link ChatType}.
 *
 * @category Validation
 * @since 0.0.0
 */
export type ChatType = typeof ChatType.Type;

const noChatType = O.none<ChatType>;

const normalizeChatTypeOption = Match.type<string>().pipe(
  Match.when("direct", () => O.some<ChatType>("direct")),
  Match.when("dm", () => O.some<ChatType>("direct")),
  Match.when("group", () => O.some<ChatType>("group")),
  Match.when("channel", () => O.some<ChatType>("channel")),
  Match.orElse(noChatType)
);

const invalidChatTypeIssue = (value: string) =>
  new SchemaIssue.InvalidValue(O.some(value), {
    message: "Chat type must be one of direct, dm, group, or channel.",
  });

const decodeChatTypeValue = (value: string): Effect.Effect<ChatType, SchemaIssue.InvalidValue> =>
  pipe(
    value,
    normalizeChatTypeOption,
    O.match({
      onNone: () => Effect.fail(invalidChatTypeIssue(value)),
      onSome: Effect.succeed,
    })
  );

const encodeChatTypeValue = (value: ChatType): Effect.Effect<string> => Effect.succeed(value);

const ChatTypeFromInput = S.String.pipe(
  S.decode(SchemaTransformation.trim()),
  S.decode(SchemaTransformation.toLowerCase()),
  S.decodeTo(
    ChatType,
    SchemaTransformation.transformOrFail({
      decode: decodeChatTypeValue,
      encode: encodeChatTypeValue,
    })
  ),
  $I.annoteSchema("ChatTypeFromInput", {
    description:
      "Permissive chat type input schema that trims, lowercases, normalizes the legacy `dm` alias, and decodes to canonical chat types.",
  })
);

const decodeChatTypeOption = S.decodeUnknownOption(ChatTypeFromInput);

/**
 * Normalize a raw chat type string to the canonical chat type domain.
 *
 * Empty strings, whitespace-only values, and unsupported values are treated as
 * unset. The legacy `"dm"` alias continues to normalize to `"direct"`.
 *
 * @example
 * ```typescript
 * import { normalizeChatType } from "@beep/clawhole/channels/ChatType"
 *
 * console.log(normalizeChatType(" dm ")) // "direct"
 * console.log(normalizeChatType("room")) // undefined
 * ```
 *
 * @param raw {string | undefined} - The raw chat type input to normalize.
 * @returns {ChatType | undefined} - The canonical chat type when the input is supported, otherwise `undefined`.
 * @category Utility
 * @since 0.0.0
 */
export const normalizeChatType = (raw?: string): ChatType | undefined =>
  pipe(raw, decodeChatTypeOption, O.getOrUndefined);
