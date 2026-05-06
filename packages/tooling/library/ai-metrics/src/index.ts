/**
 * Repo AI-agent metrics models and helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Repo-local configuration snapshot helpers.
 *
 * @example
 * ```ts
 * import { makeAiMetricsConfigSnapshot } from "@beep/repo-ai-metrics"
 * console.log(makeAiMetricsConfigSnapshot)
 * ```
 * @category services
 * @since 0.0.0
 */
export * from "./config-snapshot.ts";
/**
 * Transcript ingest helpers.
 *
 * @example
 * ```ts
 * import { summarizeTranscriptText } from "@beep/repo-ai-metrics"
 * console.log(summarizeTranscriptText)
 * ```
 * @category services
 * @since 0.0.0
 */
export * from "./ingest.ts";
/**
 * Install and deployment target helpers.
 *
 * @example
 * ```ts
 * import { makeAiMetricsInstallSpec } from "@beep/repo-ai-metrics"
 * console.log(makeAiMetricsInstallSpec())
 * ```
 * @category services
 * @since 0.0.0
 */
export * from "./install.ts";
/**
 * Canonical AI metrics models.
 *
 * @example
 * ```ts
 * import { AiMetricsDeployTarget } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDeployTarget.Enum.local)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./models.ts";
/**
 * Privacy and derived-payload proof helpers.
 *
 * @example
 * ```ts
 * import { makeAiMetricsPrivacyCheckResult } from "@beep/repo-ai-metrics"
 * console.log(makeAiMetricsPrivacyCheckResult)
 * ```
 * @category services
 * @since 0.0.0
 */
export * from "./privacy.ts";
/**
 * Local AI-agent source discovery helpers.
 *
 * @example
 * ```ts
 * import { discoverAiMetricsSources } from "@beep/repo-ai-metrics"
 * console.log(discoverAiMetricsSources)
 * ```
 * @category services
 * @since 0.0.0
 */
export * from "./source-discovery.ts";
