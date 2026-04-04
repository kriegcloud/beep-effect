/**
 * Schema-first queue configuration domains for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw queue type surface into repo-native
 * Effect schemas while preserving the literal values and provider override keys
 * defined in `types.queue.ts`.
 *
 * The scope here is intentionally limited to the shared queue domain types.
 * Higher-level message queue object shapes such as `QueueConfig` remain modeled
 * elsewhere.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { QueueModeByProvider } from "../../src/domain/Queue.ts"
 *
 * const queueModes = S.decodeUnknownSync(QueueModeByProvider)({
 *   slack: "collect",
 *   webchat: "queue"
 * })
 *
 * console.log(O.isSome(queueModes.slack)) // true
 * console.log(O.isNone(queueModes.googlechat)) // true
 * ```
 *
 * @module @beep/clawhole/config/Queue
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("config/Queue");

const strictParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

/**
 * Supported inbound queue behavior modes.
 *
 * @example
 * ```typescript
 * import { QueueMode } from "../../src/domain/Queue.ts"
 *
 * const mode = QueueMode.Enum["steer-backlog"]
 *
 * console.log(mode) // "steer-backlog"
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export const QueueMode = LiteralKit([
  "steer",
  "followup",
  "collect",
  "steer-backlog",
  "steer+backlog",
  "queue",
  "interrupt",
] as const).pipe(
  $I.annoteSchema("QueueMode", {
    description:
      "Supported inbound queue behavior modes controlling whether new messages steer, follow up, collect, backlog, queue, or interrupt existing work.",
  })
);

/**
 * Type of {@link QueueMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type QueueMode = typeof QueueMode.Type;

/**
 * Supported drop strategies when an inbound queue exceeds its cap.
 *
 * @example
 * ```typescript
 * import { QueueDropPolicy } from "../../src/domain/Queue.ts"
 *
 * const policy = QueueDropPolicy.Enum.summarize
 *
 * console.log(policy) // "summarize"
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export const QueueDropPolicy = LiteralKit(["old", "new", "summarize"] as const).pipe(
  $I.annoteSchema("QueueDropPolicy", {
    description:
      "Supported drop strategies when an inbound queue exceeds its cap: discard the oldest item, reject the newest item, or summarize overflow.",
  })
);

/**
 * Type of {@link QueueDropPolicy}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type QueueDropPolicy = typeof QueueDropPolicy.Type;

/**
 * Per-provider queue mode overrides keyed by upstream provider id.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { QueueModeByProvider } from "../../src/domain/Queue.ts"
 *
 * const byProvider = S.decodeUnknownSync(QueueModeByProvider)({
 *   telegram: "followup",
 *   googlechat: "collect"
 * })
 *
 * console.log(O.isSome(byProvider.telegram)) // true
 * console.log(O.isNone(byProvider.slack)) // true
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export class QueueModeByProvider extends S.Class<QueueModeByProvider>($I`QueueModeByProvider`)(
  {
    whatsapp: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for WhatsApp inbound message handling.",
    }),
    telegram: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for Telegram inbound message handling.",
    }),
    discord: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for Discord inbound message handling.",
    }),
    irc: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for IRC inbound message handling.",
    }),
    googlechat: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for Google Chat inbound message handling.",
    }),
    slack: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for Slack inbound message handling.",
    }),
    signal: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for Signal inbound message handling.",
    }),
    imessage: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for iMessage inbound message handling.",
    }),
    msteams: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for Microsoft Teams inbound message handling.",
    }),
    webchat: S.OptionFromOptionalKey(QueueMode).annotateKey({
      description: "Optional queue mode override for internal webchat inbound message handling.",
    }),
  },
  $I.annote("QueueModeByProvider", {
    description: "Per-provider queue mode overrides keyed by the upstream queue provider ids.",
    parseOptions: strictParseOptions,
  })
) {}
