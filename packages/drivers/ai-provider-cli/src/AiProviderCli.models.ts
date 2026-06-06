/**
 * Data models for provider CLI probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiProviderCliId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiProviderCliId.create("AiProviderCli.models");

/**
 * AI provider CLI vocabulary.
 *
 * @example
 * ```ts
 * import { AiProviderCliProvider } from "@beep/ai-provider-cli/AiProviderCli.models"
 *
 * console.log(AiProviderCliProvider)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AiProviderCliProvider = LiteralKit(["claude", "codex"]).pipe(
  $I.annoteSchema("AiProviderCliProvider", {
    description: "AI provider CLI names supported by the driver.",
  })
);

/**
 * Runtime type for {@link AiProviderCliProvider}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiProviderCliProvider = typeof AiProviderCliProvider.Type;

/**
 * Provider CLI authentication status.
 *
 * @example
 * ```ts
 * import { AiProviderCliAuthStatus } from "@beep/ai-provider-cli/AiProviderCli.models"
 *
 * console.log(AiProviderCliAuthStatus)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AiProviderCliAuthStatus = LiteralKit(["authenticated", "not-authenticated"]).pipe(
  $I.annoteSchema("AiProviderCliAuthStatus", {
    description: "Authentication state inferred from a provider CLI status command.",
  })
);

/**
 * Runtime type for {@link AiProviderCliAuthStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiProviderCliAuthStatus = typeof AiProviderCliAuthStatus.Type;

/**
 * Provider CLI process result.
 *
 * @example
 * ```ts
 * import { AiProviderCliProcessResult } from "@beep/ai-provider-cli/AiProviderCli.models"
 *
 * console.log(AiProviderCliProcessResult)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AiProviderCliProcessResult extends S.Class<AiProviderCliProcessResult>($I`AiProviderCliProcessResult`)(
  {
    exitCode: S.Finite,
    stderr: S.String,
    stdout: S.String,
  },
  $I.annote("AiProviderCliProcessResult", {
    description: "Stdout, stderr, and exit code captured from a provider CLI status command.",
  })
) {}

/**
 * Redacted provider CLI authentication probe.
 *
 * @example
 * ```ts
 * import { AiProviderCliAuthProbe } from "@beep/ai-provider-cli/AiProviderCli.models"
 *
 * console.log(AiProviderCliAuthProbe)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AiProviderCliAuthProbe extends S.Class<AiProviderCliAuthProbe>($I`AiProviderCliAuthProbe`)(
  {
    command: S.String,
    provider: AiProviderCliProvider,
    status: AiProviderCliAuthStatus,
  },
  $I.annote("AiProviderCliAuthProbe", {
    description: "Provider CLI auth probe result without raw account or token output.",
  })
) {}
