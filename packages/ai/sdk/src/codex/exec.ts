/**
 * @module @beep/ai-sdk/codex/exec
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { AbortSig, FilePath } from "@beep/schema";
import * as S from "effect/Schema";
import { ApprovalMode, ModelReasoningEffort, SandboxMode, WebSearchMode } from "./threadOptions.ts";

const $I = $AiSdkId.create("core/codex/exec");

/**
 * CodexExecArgs - Exec args for codex
 *
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CodexExecArgs extends S.Class<CodexExecArgs>($I`CodexExecArgs`)(
  {
    input: S.String,
    baseUrl: S.OptionFromOptionalKey(S.String),
    apiKey: S.OptionFromOptionalKey(S.String),
    threadId: S.OptionFromOptionalNullOr(S.String, { onNoneEncoding: null }),
    images: S.URLFromString.pipe(S.Array, S.OptionFromOptionalKey),
    // --model
    model: S.OptionFromOptionalKey(S.String),
    // --sandbox
    sandboxMode: S.OptionFromOptionalKey(SandboxMode),
    // --cd
    workingDirectory: S.OptionFromOptionalKey(FilePath),
    // --add-dir
    additionalDirectories: FilePath.pipe(S.Array, S.OptionFromOptionalKey),
    // --skip-git-repo-check
    skipGitRepoCheck: S.OptionFromOptionalKey(S.Boolean),
    // --output-schema
    outputSchemaFile: S.OptionFromOptionalKey(FilePath),
    // --config model_reasoning_effort
    modelReasoningEffort: S.OptionFromOptionalKey(ModelReasoningEffort),
    // AbortSignal to cancel the execution
    signal: S.OptionFromOptionalKey(AbortSig),
    // --config sandbox_workspace_write.network_access
    networkAccessEnabled: S.OptionFromOptionalKey(S.Boolean),
    // --config web_search
    webSearchMode: S.OptionFromOptionalKey(WebSearchMode),
    // legacy --config features.web_search_request
    webSearchEnabled: S.OptionFromOptionalKey(S.Boolean),
    // --config approval_policy
    approvalPolicy: S.OptionFromOptionalKey(ApprovalMode),
  },
  $I.annote("CodexExecArgs", {
    description: "CodexExecArgs - Exec args for codex",
  })
) {}
