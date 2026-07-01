/**
 * Schema-backed payloads for Claude and Codex CLI auth probes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiProviderCliId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiProviderCliId.create("AiProviderCli.models");

/**
 * Supported local AI provider CLI identifiers.
 *
 * @remarks
 * The vocabulary is intentionally limited to CLIs this driver knows how to
 * probe: Claude uses `claude auth status`, and Codex uses `codex login status`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AiProviderCliProvider } from "@beep/ai-provider-cli"
 *
 * const provider = S.decodeUnknownSync(AiProviderCliProvider)("claude")
 *
 * console.log(provider) // "claude"
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
 * Type for a supported local AI provider CLI identifier.
 *
 * @example
 * ```ts
 * import type { AiProviderCliProvider } from "@beep/ai-provider-cli"
 *
 * const provider: AiProviderCliProvider = "codex"
 *
 * console.log(provider) // "codex"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AiProviderCliProvider = typeof AiProviderCliProvider.Type;

/**
 * Redacted authentication state inferred from a provider CLI exit code.
 *
 * @remarks
 * `authenticated` means the provider status command exited with code `0`.
 * `not-authenticated` means the command ran and returned a non-zero exit code;
 * transport and spawning failures are represented by `AiProviderCliError`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AiProviderCliAuthStatus } from "@beep/ai-provider-cli"
 *
 * const status = S.decodeUnknownSync(AiProviderCliAuthStatus)("authenticated")
 *
 * console.log(status) // "authenticated"
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
 * Type for the redacted provider CLI authentication state.
 *
 * @example
 * ```ts
 * import type { AiProviderCliAuthStatus } from "@beep/ai-provider-cli"
 *
 * const status: AiProviderCliAuthStatus = "not-authenticated"
 *
 * console.log(status) // "not-authenticated"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AiProviderCliAuthStatus = typeof AiProviderCliAuthStatus.Type;

/**
 * Captured provider CLI status process output.
 *
 * @remarks
 * This model is for runner boundaries and tests. Public auth probes collapse
 * the process result into a redacted status and do not expose raw stdout or
 * stderr.
 *
 * @example
 * ```ts
 * import { AiProviderCliProcessResult } from "@beep/ai-provider-cli"
 *
 * const result = AiProviderCliProcessResult.make({
 *   exitCode: 0,
 *   stderr: "",
 *   stdout: "claude auth status"
 * })
 *
 * console.log(result.exitCode) // 0
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
 * Redacted provider CLI authentication probe result.
 *
 * @remarks
 * The probe records the executable name and normalized auth status only. It
 * deliberately omits stdout, stderr, account identifiers, and token material.
 *
 * @example
 * ```ts
 * import { AiProviderCliAuthProbe } from "@beep/ai-provider-cli"
 *
 * const probe = AiProviderCliAuthProbe.make({
 *   command: "codex",
 *   provider: "codex",
 *   status: "not-authenticated"
 * })
 *
 * console.log(probe.command) // "codex"
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
