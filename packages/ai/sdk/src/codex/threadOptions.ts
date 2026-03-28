/**
 * @module @beep/ai-sdk/codex/threadOptions
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/codex/threadOptions");

/**
 * ApprovalMode - Approval mode for codex
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ApprovalMode = LiteralKit(["never", "on-request", "on-failure", "untrusted"]).pipe(
  $I.annoteSchema("ApprovalMode", {
    description: "ApprovalMode - Approval mode for codex",
  })
);

/**
 * Type of {@link ApprovalMode} {@inheritDoc ApprovalMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ApprovalMode = typeof ApprovalMode.Type;

/**
 * SandboxMode - Sandbox mode value for codex
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const SandboxMode = LiteralKit(["read-only", "workspace-write", "danger-full-access"]).pipe(
  $I.annoteSchema("SandboxMode", {
    description: "SandboxMode - Sandbox mode value for codex",
  })
);

/**
 * Type of {@link SandboxMode} {@inheritDoc SandboxMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type SandboxMode = typeof SandboxMode.Type;

/**
 * ModelReasoningEffort - Model Reasoning Effort for codex.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const ModelReasoningEffort = LiteralKit(["minimal", "low", "medium", "high", "xhigh"]).pipe(
  $I.annoteSchema("ModelReasoningEffort", {
    description: "ModelReasoningEffort - Model Reasoning Effort for codex.",
  })
);

/**
 * Type of {@link ModelReasoningEffort} {@inheritDoc ModelReasoningEffort}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type ModelReasoningEffort = typeof ModelReasoningEffort.Type;

/**
 * WebSearchMode - Web Search Mode for codex
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const WebSearchMode = LiteralKit(["disabled", "cached", "live"]).pipe(
  $I.annoteSchema("WebSearchMode", {
    description: "WebSearchMode - Web Search Mode for codex",
  })
);

/**
 * Type of {@link WebSearchMode} {@inheritDoc WebSearchMode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type WebSearchMode = typeof WebSearchMode.Type;

/**
 * ThreadOptions - Thread Options for codex
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ThreadOptions extends S.Class<ThreadOptions>($I`ThreadOptions`)(
  {
    model: S.OptionFromOptionalKey(S.String),
    sandboxMode: S.OptionFromOptionalKey(SandboxMode),
    workingDirectory: S.OptionFromOptionalKey(FilePath),
    skipGitRepoCheck: S.OptionFromOptionalKey(S.Boolean),
    modelReasoningEffort: S.OptionFromOptionalKey(ModelReasoningEffort),
    networkAccessEnabled: S.OptionFromOptionalKey(S.Boolean),
    webSearchMode: S.OptionFromOptionalKey(WebSearchMode),
    approvalPolicy: S.OptionFromOptionalKey(ApprovalMode),
    additionalDirectories: FilePath.pipe(S.Array, S.OptionFromOptionalKey),
  },
  $I.annote("ThreadOptions", {
    description: "ThreadOptions - Thread Options for codex",
  })
) {}
