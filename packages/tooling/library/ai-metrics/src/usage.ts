/**
 * Observed native coding-harness usage. Counts are unavailable until evidenced.
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoAiMetricsId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoAiMetricsId.create("usage");
const Count = S.Natural.pipe(S.OptionFromNullOr);

/**
 * Meaning of the provider's reported input count.
 * **Example** (Keep provider accounting explicit)
 * ```ts
 * import { NativeInputAccounting } from "@beep/repo-ai-metrics/usage"
 * console.log(NativeInputAccounting.Enum["includes-cache"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const NativeInputAccounting = LiteralKit(["includes-cache", "excludes-cache", "unknown"]).pipe(
  $I.annoteSchema("NativeInputAccounting", {
    description: "Whether native input includes cache counts; never sum an inclusive input twice.",
  })
);
/**
 * Provider input accounting admitted by the native usage schema.
 * @category models
 * @since 0.0.0
 */
export type NativeInputAccounting = typeof NativeInputAccounting.Type;

/**
 * Content-free token observations with explicit missing counts and semantics.
 * **Example** (Decode unavailable measurements)
 * ```ts
 * import { NativeTokenUsage } from "@beep/repo-ai-metrics/usage"
 * import * as S from "effect/Schema"
 * import * as O from "effect/Option"
 * const decoded = S.decodeUnknownOption(NativeTokenUsage)({
 *   inputTokens: 50, outputTokens: 5, cacheReadInputTokens: 40,
 *   cacheWriteInputTokens: null, reasoningOutputTokens: null,
 *   requestCount: null, turnCount: 1, inputAccounting: "includes-cache",
 *   observedScope: "host", childCoverage: "unknown",
 *   aggregateBasis: "additive-turn-totals"
 * })
 * console.log(O.map(decoded, (usage) => usage.inputAccounting)) // Some(includes-cache)
 * ```
 * @category models
 * @since 0.0.0
 */
export class NativeTokenUsage extends S.Class<NativeTokenUsage>($I`NativeTokenUsage`)(
  {
    inputTokens: Count,
    outputTokens: Count,
    cacheReadInputTokens: Count,
    cacheWriteInputTokens: Count,
    reasoningOutputTokens: Count,
    requestCount: Count,
    turnCount: Count,
    inputAccounting: NativeInputAccounting,
    observedScope: S.Literal("host"),
    childCoverage: S.Literal("unknown"),
    aggregateBasis: S.Literals(["additive-turn-totals", "terminal-cumulative", "unavailable"]),
  },
  $I.annote("NativeTokenUsage", {
    description:
      "Observed provider-native usage; null is unknown, counts preserve native cache accounting and exclude estimated savings.",
  })
) {}
