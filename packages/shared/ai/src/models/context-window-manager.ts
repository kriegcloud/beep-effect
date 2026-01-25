import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/context-window-manager");

export class ContextWindowConfigStrategy extends BS.StringLiteralKit("recent", "semantic", "token-based").annotations(
  $I.annotations("ContextWindowConfigStrategy", {
    description: "Context Window Config Strategy",
  })
) {}

export class ContextWindowConfig extends S.Class<ContextWindowConfig>($I`ContextWindowConfig`)(
  {
    maxTokens: S.optionalWith(S.NonNegativeInt, { default: () => 150000 }).annotations({
      description: "Maximum number of tokens to keep in history (heuristic)",
    }),
    maxMessages: S.optionalWith(S.NonNegativeInt, { default: () => 200 }).annotations({
      description: "Maximum number of messages to keep in history",
    }),
    strategy: S.optionalWith(ContextWindowConfigStrategy, {
      default: () => ContextWindowConfigStrategy.Enum["token-based"],
    }).annotations({
      description: "Maximum number of messages to keep in history",
    }),
  },
  $I.annotations("ContextWindowConfig", {
    description: "Configuration for context window management",
  })
) {}

export class TrimResult extends S.Class<TrimResult>($I`TrimResult`)(
  {
    originalCount: S.NonNegativeInt,
    trimmedCount: S.NonNegativeInt,
    messagesRemoved: S.NonNegativeInt,
    estimatedTokens: S.NonNegativeInt,
  },
  $I.annotations("TrimResult", {
    description: "Result of a trim operation",
  })
) {}
