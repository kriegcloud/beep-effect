import * as S from "effect/Schema";
import { withIdentifier } from "./Annotations.js";
import { SdkBeta, SdkPluginConfig } from "./Common.js";
import { HookCallbackMatcher, HookEvent } from "./Hooks.js";
import { McpServerConfig, McpServerConfigForProcessTransport } from "./Mcp.js";
import { CanUseTool, PermissionMode } from "./Permission.js";
import { AbortController, SpawnClaudeCodeProcess, StderrCallback } from "./Runtime.js";
import { SandboxSettings } from "./Sandbox.js";

export const SettingSource = withIdentifier(S.Literals(["user", "project", "local"]), "SettingSource");

export type SettingSource = typeof SettingSource.Type;
export type SettingSourceEncoded = typeof SettingSource.Encoded;

const SystemPromptPreset = S.Struct({
  type: S.Literal("preset"),
  preset: S.Literal("claude_code"),
  append: S.optional(S.String),
});

export const SystemPrompt = withIdentifier(S.Union([S.String, SystemPromptPreset]), "SystemPrompt");

export type SystemPrompt = typeof SystemPrompt.Type;
export type SystemPromptEncoded = typeof SystemPrompt.Encoded;

const ToolsPreset = S.Struct({
  type: S.Literal("preset"),
  preset: S.Literal("claude_code"),
});

export const ToolsConfig = withIdentifier(S.Union([S.Array(S.String), ToolsPreset]), "ToolsConfig");

export type ToolsConfig = typeof ToolsConfig.Type;
export type ToolsConfigEncoded = typeof ToolsConfig.Encoded;

export const JsonSchemaOutputFormat = withIdentifier(
  S.Struct({
    type: S.Literal("json_schema"),
    schema: S.Record(S.String, S.Unknown),
  }),
  "JsonSchemaOutputFormat"
);

export type JsonSchemaOutputFormat = typeof JsonSchemaOutputFormat.Type;
export type JsonSchemaOutputFormatEncoded = typeof JsonSchemaOutputFormat.Encoded;

export const OutputFormat = withIdentifier(JsonSchemaOutputFormat, "OutputFormat");

export type OutputFormat = typeof OutputFormat.Type;
export type OutputFormatEncoded = typeof OutputFormat.Encoded;

export const AgentDefinition = withIdentifier(
  S.Struct({
    description: S.String,
    tools: S.optional(S.Array(S.String)),
    disallowedTools: S.optional(S.Array(S.String)),
    prompt: S.String,
    model: S.optional(S.Literals(["sonnet", "opus", "haiku", "inherit"])),
    mcpServers: S.optional(S.Union([S.Array(S.String), S.Record(S.String, McpServerConfigForProcessTransport)])),
    criticalSystemReminder_EXPERIMENTAL: S.optional(S.String),
    skills: S.optional(S.Array(S.String)),
    maxTurns: S.optional(S.Number),
  }),
  "AgentDefinition"
);

export type AgentDefinition = typeof AgentDefinition.Type;
export type AgentDefinitionEncoded = typeof AgentDefinition.Encoded;

export const AgentMcpServerSpec = withIdentifier(
  S.Union([S.String, S.Record(S.String, McpServerConfigForProcessTransport)]),
  "AgentMcpServerSpec"
);

export type AgentMcpServerSpec = typeof AgentMcpServerSpec.Type;
export type AgentMcpServerSpecEncoded = typeof AgentMcpServerSpec.Encoded;

const HookMap = S.Record(S.optionalKey(HookEvent), S.UndefinedOr(S.Array(HookCallbackMatcher)));

const ThinkingConfig = S.Union([
  S.Struct({ type: S.Literal("adaptive") }),
  S.Struct({ type: S.Literal("enabled"), budgetTokens: S.Number }),
  S.Struct({ type: S.Literal("disabled") }),
]);

export const Options = withIdentifier(
  S.Struct({
    abortController: S.optional(AbortController),
    additionalDirectories: S.optional(S.Array(S.String)),
    agent: S.optional(S.String),
    agents: S.optional(S.Record(S.String, AgentDefinition)),
    allowDangerouslySkipPermissions: S.optional(S.Boolean),
    allowedTools: S.optional(S.Array(S.String)),
    betas: S.optional(S.Array(SdkBeta)),
    canUseTool: S.optional(CanUseTool),
    continue: S.optional(S.Boolean),
    cwd: S.optional(S.String),
    debug: S.optional(S.Boolean),
    debugFile: S.optional(S.String),
    disallowedTools: S.optional(S.Array(S.String)),
    effort: S.optional(S.Literals(["low", "medium", "high", "max"])),
    enableFileCheckpointing: S.optional(S.Boolean),
    env: S.optional(S.Record(S.String, S.Union([S.String, S.Undefined]))),
    executable: S.optional(S.Literals(["bun", "deno", "node"])),
    executableArgs: S.optional(S.Array(S.String)),
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
    pathToClaudeCodeExecutable: S.optional(S.String),
    permissionMode: S.optional(PermissionMode),
    permissionPromptToolName: S.optional(S.String),
    persistSession: S.optional(S.Boolean),
    plugins: S.optional(S.Array(SdkPluginConfig)),
    resume: S.optional(S.String),
    resumeSessionAt: S.optional(S.String),
    sandbox: S.optional(SandboxSettings),
    sessionId: S.optional(S.String),
    settingSources: S.optional(S.Array(SettingSource)),
    stderr: S.optional(StderrCallback),
    strictMcpConfig: S.optional(S.Boolean),
    systemPrompt: S.optional(SystemPrompt),
    thinking: S.optional(ThinkingConfig),
    tools: S.optional(ToolsConfig),
    spawnClaudeCodeProcess: S.optional(SpawnClaudeCodeProcess),
  }),
  "Options"
);

export type Options = typeof Options.Type;
export type OptionsEncoded = typeof Options.Encoded;
