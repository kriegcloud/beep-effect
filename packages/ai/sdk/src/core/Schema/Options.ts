import * as Schema from "effect/Schema"
import { withIdentifier } from "./Annotations.js"
import {
  SdkBeta,
  SdkPluginConfig
} from "./Common.js"
import { HookCallbackMatcher, HookEvent } from "./Hooks.js"
import { McpServerConfig, McpServerConfigForProcessTransport } from "./Mcp.js"
import { CanUseTool, PermissionMode } from "./Permission.js"
import { SandboxSettings } from "./Sandbox.js"
import {
  AbortController,
  SpawnClaudeCodeProcess,
  StderrCallback
} from "./Runtime.js"

export const SettingSource = withIdentifier(
  Schema.Literal("user", "project", "local"),
  "SettingSource"
)

export type SettingSource = typeof SettingSource.Type
export type SettingSourceEncoded = typeof SettingSource.Encoded

const SystemPromptPreset = Schema.Struct({
  type: Schema.Literal("preset"),
  preset: Schema.Literal("claude_code"),
  append: Schema.optional(Schema.String)
})

export const SystemPrompt = withIdentifier(
  Schema.Union(Schema.String, SystemPromptPreset),
  "SystemPrompt"
)

export type SystemPrompt = typeof SystemPrompt.Type
export type SystemPromptEncoded = typeof SystemPrompt.Encoded

const ToolsPreset = Schema.Struct({
  type: Schema.Literal("preset"),
  preset: Schema.Literal("claude_code")
})

export const ToolsConfig = withIdentifier(
  Schema.Union(Schema.Array(Schema.String), ToolsPreset),
  "ToolsConfig"
)

export type ToolsConfig = typeof ToolsConfig.Type
export type ToolsConfigEncoded = typeof ToolsConfig.Encoded

export const JsonSchemaOutputFormat = withIdentifier(
  Schema.Struct({
    type: Schema.Literal("json_schema"),
    schema: Schema.Record({ key: Schema.String, value: Schema.Unknown })
  }),
  "JsonSchemaOutputFormat"
)

export type JsonSchemaOutputFormat = typeof JsonSchemaOutputFormat.Type
export type JsonSchemaOutputFormatEncoded = typeof JsonSchemaOutputFormat.Encoded

export const OutputFormat = withIdentifier(JsonSchemaOutputFormat, "OutputFormat")

export type OutputFormat = typeof OutputFormat.Type
export type OutputFormatEncoded = typeof OutputFormat.Encoded

export const AgentDefinition = withIdentifier(
  Schema.Struct({
    description: Schema.String,
    tools: Schema.optional(Schema.Array(Schema.String)),
    disallowedTools: Schema.optional(Schema.Array(Schema.String)),
    prompt: Schema.String,
    model: Schema.optional(Schema.Literal("sonnet", "opus", "haiku", "inherit")),
    mcpServers: Schema.optional(
      Schema.Union(
        Schema.Array(Schema.String),
        Schema.Record({ key: Schema.String, value: McpServerConfigForProcessTransport })
      )
    ),
    criticalSystemReminder_EXPERIMENTAL: Schema.optional(Schema.String),
    skills: Schema.optional(Schema.Array(Schema.String)),
    maxTurns: Schema.optional(Schema.Number)
  }),
  "AgentDefinition"
)

export type AgentDefinition = typeof AgentDefinition.Type
export type AgentDefinitionEncoded = typeof AgentDefinition.Encoded

export const AgentMcpServerSpec = withIdentifier(
  Schema.Union(
    Schema.String,
    Schema.Record({ key: Schema.String, value: McpServerConfigForProcessTransport })
  ),
  "AgentMcpServerSpec"
)

export type AgentMcpServerSpec = typeof AgentMcpServerSpec.Type
export type AgentMcpServerSpecEncoded = typeof AgentMcpServerSpec.Encoded

const HookMap = Schema.Record({ key: HookEvent, value: Schema.Array(HookCallbackMatcher) }).pipe(
  Schema.partial
)

const ThinkingConfig = Schema.Union(
  Schema.Struct({ type: Schema.Literal("adaptive") }),
  Schema.Struct({ type: Schema.Literal("enabled"), budgetTokens: Schema.Number }),
  Schema.Struct({ type: Schema.Literal("disabled") })
)

export const Options = withIdentifier(
  Schema.Struct({
    abortController: Schema.optional(AbortController),
    additionalDirectories: Schema.optional(Schema.Array(Schema.String)),
    agent: Schema.optional(Schema.String),
    agents: Schema.optional(Schema.Record({ key: Schema.String, value: AgentDefinition })),
    allowDangerouslySkipPermissions: Schema.optional(Schema.Boolean),
    allowedTools: Schema.optional(Schema.Array(Schema.String)),
    betas: Schema.optional(Schema.Array(SdkBeta)),
    canUseTool: Schema.optional(CanUseTool),
    continue: Schema.optional(Schema.Boolean),
    cwd: Schema.optional(Schema.String),
    debug: Schema.optional(Schema.Boolean),
    debugFile: Schema.optional(Schema.String),
    disallowedTools: Schema.optional(Schema.Array(Schema.String)),
    effort: Schema.optional(Schema.Literal("low", "medium", "high", "max")),
    enableFileCheckpointing: Schema.optional(Schema.Boolean),
    env: Schema.optional(
      Schema.Record({
        key: Schema.String,
        value: Schema.Union(Schema.String, Schema.Undefined)
      })
    ),
    executable: Schema.optional(Schema.Literal("bun", "deno", "node")),
    executableArgs: Schema.optional(Schema.Array(Schema.String)),
    extraArgs: Schema.optional(
      Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Null) })
    ),
    fallbackModel: Schema.optional(Schema.String),
    forkSession: Schema.optional(Schema.Boolean),
    hooks: Schema.optional(HookMap),
    includePartialMessages: Schema.optional(Schema.Boolean),
    maxBudgetUsd: Schema.optional(Schema.Number),
    /** @deprecated Use `thinking` instead */
    maxThinkingTokens: Schema.optional(Schema.Number),
    maxTurns: Schema.optional(Schema.Number),
    mcpServers: Schema.optional(Schema.Record({ key: Schema.String, value: McpServerConfig })),
    model: Schema.optional(Schema.String),
    outputFormat: Schema.optional(OutputFormat),
    pathToClaudeCodeExecutable: Schema.optional(Schema.String),
    permissionMode: Schema.optional(PermissionMode),
    permissionPromptToolName: Schema.optional(Schema.String),
    persistSession: Schema.optional(Schema.Boolean),
    plugins: Schema.optional(Schema.Array(SdkPluginConfig)),
    resume: Schema.optional(Schema.String),
    resumeSessionAt: Schema.optional(Schema.String),
    sandbox: Schema.optional(SandboxSettings),
    sessionId: Schema.optional(Schema.String),
    settingSources: Schema.optional(Schema.Array(SettingSource)),
    stderr: Schema.optional(StderrCallback),
    strictMcpConfig: Schema.optional(Schema.Boolean),
    systemPrompt: Schema.optional(SystemPrompt),
    thinking: Schema.optional(ThinkingConfig),
    tools: Schema.optional(ToolsConfig),
    spawnClaudeCodeProcess: Schema.optional(SpawnClaudeCodeProcess)
  }),
  "Options"
)

export type Options = typeof Options.Type
export type OptionsEncoded = typeof Options.Encoded
