import { $AiSdkId } from "@beep/identity/packages";
import { FilePath, LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";
import { SdkBeta, SdkPluginConfig } from "./Common.js";
import { HookCallbackMatcher, HookEvent } from "./Hooks.js";
import { McpServerConfig, McpServerConfigForProcessTransport } from "./Mcp.js";
import { CanUseTool, PermissionMode } from "./Permission.js";
import { AbortController, SpawnClaudeCodeProcess, StderrCallback } from "./Runtime.js";
import { SandboxSettings } from "./Sandbox.js";

const $I = $AiSdkId.create("core/Schema/Options");

/**
 * @since 0.0.0
 * @category Validation
 */
export const SettingSource = LiteralKit(["user", "project", "local"]).annotate(
  $I.annote("SettingSource", {
    description: "Origin marker indicating whether a setting came from user, project, or local configuration.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SettingSource = typeof SettingSource.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SettingSourceEncoded = typeof SettingSource.Encoded;

class SystemPromptPresetData extends S.Class<SystemPromptPresetData>($I`SystemPromptPreset`)(
  {
    type: S.Literal("preset"),
    preset: S.Literal("claude_code"),
    append: S.optional(S.String),
  },
  $I.annote("SystemPromptPreset", {
    description: "Named system prompt preset configuration with optional appended instructions.",
  })
) {}

const SystemPromptPreset = SystemPromptPresetData;

/**
 * @since 0.0.0
 * @category Validation
 */
export const SystemPrompt = S.Union([S.String, SystemPromptPreset]).annotate(
  $I.annote("SystemPrompt", {
    description: "System prompt configuration supplied as raw text or a named preset with appended instructions.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type SystemPrompt = typeof SystemPrompt.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type SystemPromptEncoded = typeof SystemPrompt.Encoded;

class ToolsPresetData extends S.Class<ToolsPresetData>($I`ToolsPreset`)(
  {
    type: S.Literal("preset"),
    preset: S.Literal("claude_code"),
  },
  $I.annote("ToolsPreset", {
    description: "Named tool preset configuration selecting the built-in Claude Code tool bundle.",
  })
) {}

const ToolsPreset = ToolsPresetData;

/**
 * @since 0.0.0
 * @category Validation
 */
export const ToolsConfig = S.Union([S.Array(S.String), ToolsPreset]).annotate(
  $I.annote("ToolsConfig", {
    description: "Tool selection configuration supplied as explicit tool names or a built-in preset.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type ToolsConfig = typeof ToolsConfig.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type ToolsConfigEncoded = typeof ToolsConfig.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class JsonSchemaOutputFormatData extends S.Class<JsonSchemaOutputFormatData>($I`JsonSchemaOutputFormat`)(
  {
    type: S.Literal("json_schema"),
    schema: S.Record(S.String, S.Unknown),
  },
  $I.annote("JsonSchemaOutputFormat", {
    description: "Output format requesting responses constrained by a caller-provided JSON schema.",
  })
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const JsonSchemaOutputFormat = JsonSchemaOutputFormatData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type JsonSchemaOutputFormat = typeof JsonSchemaOutputFormat.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type JsonSchemaOutputFormatEncoded = typeof JsonSchemaOutputFormat.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const OutputFormat = JsonSchemaOutputFormat.annotate(
  $I.annote("OutputFormat", {
    description: "Requested response format for SDK output, currently backed by JSON-schema constraints.",
  })
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type OutputFormat = typeof OutputFormat.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type OutputFormatEncoded = typeof OutputFormat.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
class AgentDefinitionData extends S.Class<AgentDefinitionData>($I`AgentDefinition`)(
  {
    description: S.String,
    tools: S.optional(S.String.pipe(S.Array)),
    disallowedTools: S.optional(S.String.pipe(S.Array)),
    prompt: S.String,
    model: S.optional(LiteralKit(["sonnet", "opus", "haiku", "inherit"])),
    mcpServers: S.optional(S.Union([S.String.pipe(S.Array), S.Record(S.String, McpServerConfigForProcessTransport)])),
    criticalSystemReminder_EXPERIMENTAL: S.optional(S.String),
    skills: S.optional(S.String.pipe(S.Array)),
    maxTurns: S.optional(S.Number),
  },
  $I.annote("AgentDefinition", {
    description: "Named agent configuration including prompt, tool policy, model selection, and MCP servers.",
  })
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const AgentDefinition = AgentDefinitionData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type AgentDefinition = typeof AgentDefinition.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type AgentDefinitionEncoded = typeof AgentDefinition.Encoded;

/**
 * @since 0.0.0
 * @category Validation
 */
export const AgentMcpServerSpec = S.Union([S.String, S.Record(S.String, McpServerConfigForProcessTransport)]).pipe(
  S.annotate(
    $I.annote("AgentMcpServerSpec", {
      description: "Agent-local MCP server selection expressed as names or inline process transport definitions.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export type AgentMcpServerSpec = typeof AgentMcpServerSpec.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type AgentMcpServerSpecEncoded = typeof AgentMcpServerSpec.Encoded;

const HookMap = S.Record(S.optionalKey(HookEvent), HookCallbackMatcher.pipe(S.Array, S.UndefinedOr));

class ThinkingConfigAdaptiveData extends S.Class<ThinkingConfigAdaptiveData>($I`ThinkingConfigAdaptive`)(
  {
    type: S.Literal("adaptive"),
  },
  $I.annote("ThinkingConfigAdaptive", {
    description: "Thinking configuration that lets the SDK choose the reasoning budget adaptively.",
  })
) {}

const ThinkingConfigAdaptive = ThinkingConfigAdaptiveData;

class ThinkingConfigEnabledData extends S.Class<ThinkingConfigEnabledData>($I`ThinkingConfigEnabled`)(
  {
    type: S.Literal("enabled"),
    budgetTokens: S.Number,
  },
  $I.annote("ThinkingConfigEnabled", {
    description: "Thinking configuration with an explicit reasoning token budget.",
  })
) {}

const ThinkingConfigEnabled = ThinkingConfigEnabledData;

class ThinkingConfigDisabledData extends S.Class<ThinkingConfigDisabledData>($I`ThinkingConfigDisabled`)(
  {
    type: S.Literal("disabled"),
  },
  $I.annote("ThinkingConfigDisabled", {
    description: "Thinking configuration that disables extra reasoning effort.",
  })
) {}

const ThinkingConfigDisabled = ThinkingConfigDisabledData;

const ThinkingConfig = S.Union([ThinkingConfigAdaptive, ThinkingConfigEnabled, ThinkingConfigDisabled]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("ThinkingConfig", {
      description: "Tagged union schema describing available thinking configuration modes.",
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
class OptionsData extends S.Class<OptionsData>($I`Options`)(
  {
    abortController: S.optional(AbortController),
    additionalDirectories: S.optional(S.String.pipe(S.Array)),
    agent: S.optional(S.String),
    agents: S.optional(S.Record(S.String, AgentDefinition)),
    allowDangerouslySkipPermissions: S.optional(S.Boolean),
    allowedTools: S.optional(S.String.pipe(S.Array)),
    betas: S.optional(SdkBeta.pipe(S.Array)),
    canUseTool: S.optional(CanUseTool),
    continue: S.optional(S.Boolean),
    cwd: S.optional(S.String),
    debug: S.optional(S.Boolean),
    debugFile: S.optional(FilePath),
    disallowedTools: S.optional(S.String.pipe(S.Array)),
    effort: S.optional(LiteralKit(["low", "medium", "high", "max"])),
    enableFileCheckpointing: S.optional(S.Boolean),
    env: S.optional(S.Record(S.String, S.Union([S.String, S.Undefined]))),
    executable: S.optional(LiteralKit(["bun", "deno", "node"])),
    executableArgs: S.optional(S.String.pipe(S.Array)),
    extraArgs: S.optional(S.Record(S.String, S.Union([S.String, S.Null]))),
    fallbackModel: S.optional(S.String),
    forkSession: S.optional(S.Boolean),
    hooks: S.optional(HookMap),
    includePartialMessages: S.optional(S.Boolean),
    maxBudgetUsd: S.optional(S.Number),
    maxTurns: S.optional(S.Number),
    mcpServers: S.optional(S.Record(S.String, McpServerConfig)),
    model: S.optional(S.String),
    outputFormat: S.optional(OutputFormat),
    pathToClaudeCodeExecutable: S.optional(FilePath),
    permissionMode: S.optional(PermissionMode),
    permissionPromptToolName: S.optional(S.String),
    persistSession: S.optional(S.Boolean),
    plugins: S.optional(SdkPluginConfig.pipe(S.Array)),
    resume: S.optional(S.String),
    resumeSessionAt: S.optional(S.String),
    sandbox: S.optional(SandboxSettings),
    sessionId: S.optional(S.String),
    settingSources: S.optional(SettingSource.pipe(S.Array)),
    stderr: S.optional(StderrCallback),
    strictMcpConfig: S.optional(S.Boolean),
    systemPrompt: S.optional(SystemPrompt),
    thinking: S.optional(ThinkingConfig),
    tools: S.optional(ToolsConfig),
    spawnClaudeCodeProcess: S.optional(SpawnClaudeCodeProcess),
  },
  $I.annote("Options", {
    description: "Top-level SDK runtime options covering tools, model selection, hooks, sandbox, and session behavior.",
  })
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const Options = OptionsData;

/**
 * @since 0.0.0
 * @category Validation
 */
export type Options = typeof Options.Type;
/**
 * @since 0.0.0
 * @category Validation
 */
export type OptionsEncoded = typeof Options.Encoded;
