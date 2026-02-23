import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, extname, resolve } from "node:path";
import YAML from "yaml";

export const scaffoldVersion = "0.0.0-scaffold";

export type Severity = "error" | "warning";

export type Diagnostic = {
  code: string;
  message: string;
  path: string;
  severity: Severity;
};

type CanonicalCommand = {
  id: string;
  run: string;
  cwd?: string;
};

type CanonicalMcpServer = {
  transport: string;
  url?: string;
  command?: string;
  args?: string[];
};

export type CanonicalConfig = {
  version: number;
  instructions: {
    base: string[];
  };
  commands: CanonicalCommand[];
  mcp_servers: Record<string, CanonicalMcpServer>;
};

export type NormalizedEnvelope = {
  version: 1;
  hash: string;
  config: CanonicalConfig;
};

export type McpTool = "codex" | "cursor" | "windsurf";

type McpServer = Record<string, unknown>;

type McpFixture = {
  servers: Record<string, McpServer>;
};

export type McpGenerationResult = {
  output: string;
  warnings: string[];
  capabilityMap: Record<McpTool, string[]>;
};

export type JetbrainsPromptMode = "bundle_only" | "native_file";

type JetbrainsPrompt = {
  id: string;
  title: string;
  prompt_file: string;
};

type JetbrainsPromptLibraryFixture = {
  mode: JetbrainsPromptMode;
  prompts: JetbrainsPrompt[];
};

export type JetbrainsArtifact = {
  path: string;
  content: string;
  sha256: string;
};

export type JetbrainsPromptLibraryEnvelope = {
  tool: "jetbrains";
  mode: JetbrainsPromptMode;
  warnings: string[];
  artifacts: JetbrainsArtifact[];
  bundleHash: string;
  nativeProbe: {
    enabled: boolean;
    path: string | null;
    roundTripDeterministic: boolean;
  };
};

type Poc04State = {
  version: 1;
  managedFile: string;
  backupFile: string;
  managedHash: string;
  unmanagedFile: string;
  unmanagedHashAtApply: string | null;
  lastAction: "apply";
};

type Poc04Plan = {
  fixturePath: string;
  workspaceRoot: string;
  managedFile: string;
  unmanagedFile: string;
  backupFile: string;
  stateFile: string;
  managedTargets: string[];
  generatedContent: string;
};

export type Poc04OperationResult = {
  ok: boolean;
  action: "apply" | "check" | "revert";
  dryRun: boolean;
  changed: boolean;
  managedFile: string;
  unmanagedFile: string;
  stateFile: string;
  messages: string[];
};

type SecretRef = {
  id: string;
  ref: string;
};

type SecretFixture = {
  required: SecretRef[];
  optional: SecretRef[];
  optionalPolicy: "warn";
};

type SecretResolverMode = "mock" | "desktop" | "service_account";

export type SecretResolutionResult = {
  ok: boolean;
  source: SecretResolverMode;
  optionalPolicy: "warn";
  required: {
    resolved: string[];
    missing: string[];
  };
  optional: {
    resolved: string[];
    missing: string[];
  };
  diagnostics: string[];
  redaction: {
    valuesExposed: false;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSortedUniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const result = new Set<string>();
  for (const item of value) {
    if (typeof item === "string") {
      result.add(item);
    }
  }
  return Array.from(result);
}

function stableSortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => stableSortDeep(entry));
  }

  if (!isRecord(value)) {
    return value;
  }

  const sorted = Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = stableSortDeep(value[key]);
      return acc;
    }, {});

  return sorted;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(stableSortDeep(value), null, 2)}\n`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return diagnostics.sort((a, b) => {
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.code.localeCompare(b.code);
  });
}

function readYamlFile(pathValue: string): unknown {
  const text = readFileSync(pathValue, "utf8");
  return YAML.parse(text);
}

export function readYamlDocument(pathValue: string): unknown {
  return readYamlFile(pathValue);
}

export function validateCanonicalConfig(input: unknown): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!isRecord(input)) {
    diagnostics.push({
      code: "E_ROOT_TYPE",
      message: "Root value must be an object mapping.",
      path: "$",
      severity: "error"
    });
    return diagnostics;
  }

  if (typeof input.version !== "number" || !Number.isInteger(input.version)) {
    diagnostics.push({
      code: "E_VERSION_TYPE",
      message: "`version` must be an integer number.",
      path: "version",
      severity: "error"
    });
  }

  const instructions = input.instructions;
  if (instructions !== undefined) {
    if (!isRecord(instructions)) {
      diagnostics.push({
        code: "E_INSTRUCTIONS_TYPE",
        message: "`instructions` must be an object.",
        path: "instructions",
        severity: "error"
      });
    } else if (instructions.base !== undefined) {
      if (!Array.isArray(instructions.base) || instructions.base.some((item) => typeof item !== "string")) {
        diagnostics.push({
          code: "E_INSTRUCTIONS_BASE_TYPE",
          message: "`instructions.base` must be an array of strings.",
          path: "instructions.base",
          severity: "error"
        });
      }
    }
  }

  const commands = input.commands;
  if (commands !== undefined) {
    if (!Array.isArray(commands)) {
      diagnostics.push({
        code: "E_COMMANDS_TYPE",
        message: "`commands` must be an array.",
        path: "commands",
        severity: "error"
      });
    } else {
      for (let i = 0; i < commands.length; i++) {
        const entry = commands[i];
        if (!isRecord(entry)) {
          diagnostics.push({
            code: "E_COMMAND_ENTRY_TYPE",
            message: "Each command must be an object.",
            path: `commands[${i}]`,
            severity: "error"
          });
          continue;
        }

        if (typeof entry.id !== "string" || entry.id.length === 0) {
          diagnostics.push({
            code: "E_COMMAND_ID_TYPE",
            message: "`commands[*].id` must be a non-empty string.",
            path: `commands[${i}].id`,
            severity: "error"
          });
        }

        if (typeof entry.run !== "string" || entry.run.length === 0) {
          diagnostics.push({
            code: "E_COMMAND_RUN_TYPE",
            message: "`commands[*].run` must be a non-empty string.",
            path: `commands[${i}].run`,
            severity: "error"
          });
        }

        if (entry.cwd !== undefined && typeof entry.cwd !== "string") {
          diagnostics.push({
            code: "E_COMMAND_CWD_TYPE",
            message: "`commands[*].cwd` must be a string when provided.",
            path: `commands[${i}].cwd`,
            severity: "error"
          });
        }
      }
    }
  }

  const mcpServers = input.mcp_servers;
  if (mcpServers !== undefined) {
    if (!isRecord(mcpServers)) {
      diagnostics.push({
        code: "E_MCP_SERVERS_TYPE",
        message: "`mcp_servers` must be an object map.",
        path: "mcp_servers",
        severity: "error"
      });
    } else {
      for (const [name, rawServer] of Object.entries(mcpServers)) {
        const basePath = `mcp_servers.${name}`;
        if (!isRecord(rawServer)) {
          diagnostics.push({
            code: "E_MCP_SERVER_ENTRY_TYPE",
            message: "Each MCP server entry must be an object.",
            path: basePath,
            severity: "error"
          });
          continue;
        }

        if (typeof rawServer.transport !== "string" || rawServer.transport.length === 0) {
          diagnostics.push({
            code: "E_MCP_TRANSPORT_TYPE",
            message: "`transport` must be a non-empty string.",
            path: `${basePath}.transport`,
            severity: "error"
          });
        }

        if (rawServer.url !== undefined && typeof rawServer.url !== "string") {
          diagnostics.push({
            code: "E_MCP_URL_TYPE",
            message: "`url` must be a string when provided.",
            path: `${basePath}.url`,
            severity: "error"
          });
        }

        if (rawServer.command !== undefined && typeof rawServer.command !== "string") {
          diagnostics.push({
            code: "E_MCP_COMMAND_TYPE",
            message: "`command` must be a string when provided.",
            path: `${basePath}.command`,
            severity: "error"
          });
        }

        if (rawServer.args !== undefined) {
          const args = rawServer.args;
          if (!Array.isArray(args) || args.some((arg) => typeof arg !== "string")) {
            diagnostics.push({
              code: "E_MCP_ARGS_TYPE",
              message: "`args` must be an array of strings when provided.",
              path: `${basePath}.args`,
              severity: "error"
            });
          }
        }
      }
    }
  }

  return sortDiagnostics(diagnostics);
}

export function normalizeCanonicalConfig(input: unknown): CanonicalConfig {
  const config = isRecord(input) ? input : {};
  const rawInstructions = isRecord(config.instructions) ? config.instructions : {};
  const rawCommands = Array.isArray(config.commands) ? config.commands : [];
  const rawMcpServers = isRecord(config.mcp_servers) ? config.mcp_servers : {};

  const commands: CanonicalCommand[] = [];
  for (const entry of rawCommands) {
    if (!isRecord(entry)) continue;
    if (typeof entry.id !== "string" || entry.id.length === 0) continue;
    if (typeof entry.run !== "string" || entry.run.length === 0) continue;

    const command: CanonicalCommand = { id: entry.id, run: entry.run };
    if (typeof entry.cwd === "string") {
      command.cwd = entry.cwd;
    }
    commands.push(command);
  }

  commands.sort((a, b) => {
    if (a.id !== b.id) return a.id.localeCompare(b.id);
    if (a.run !== b.run) return a.run.localeCompare(b.run);
    return (a.cwd ?? "").localeCompare(b.cwd ?? "");
  });

  const mcpServers: Record<string, CanonicalMcpServer> = {};
  for (const serverName of Object.keys(rawMcpServers).sort()) {
    const rawServer = rawMcpServers[serverName];
    if (!isRecord(rawServer)) continue;
    if (typeof rawServer.transport !== "string" || rawServer.transport.length === 0) continue;

    const normalizedServer: CanonicalMcpServer = {
      transport: rawServer.transport
    };

    if (typeof rawServer.url === "string") {
      normalizedServer.url = rawServer.url;
    }
    if (typeof rawServer.command === "string") {
      normalizedServer.command = rawServer.command;
    }
    if (Array.isArray(rawServer.args)) {
      const args = rawServer.args.filter((item): item is string => typeof item === "string");
      if (args.length > 0) {
        normalizedServer.args = args;
      }
    }

    mcpServers[serverName] = normalizedServer;
  }

  return {
    version: typeof config.version === "number" && Number.isInteger(config.version) ? config.version : 1,
    instructions: {
      base: toSortedUniqueStrings(rawInstructions.base)
    },
    commands,
    mcp_servers: mcpServers
  };
}

export function normalizeCanonicalEnvelope(input: unknown): NormalizedEnvelope {
  const config = stableSortDeep(normalizeCanonicalConfig(input)) as CanonicalConfig;
  const hash = sha256(stableJson(config));
  return {
    version: 1,
    hash,
    config
  };
}

export function collectYamlFiles(pathValue: string): string[] {
  const absolutePath = resolve(pathValue);
  const stat = statSync(absolutePath);
  if (stat.isFile()) {
    const extension = extname(absolutePath).toLowerCase();
    if (extension === ".yaml" || extension === ".yml") {
      return [absolutePath];
    }
    return [];
  }

  const files: string[] = [];
  const stack = [absolutePath];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    const entries = readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const next = resolve(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(next);
        continue;
      }
      const extension = extname(entry.name).toLowerCase();
      if (extension === ".yaml" || extension === ".yml") {
        files.push(next);
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

export function validateCanonicalFile(filePath: string): { diagnostics: Diagnostic[]; data: unknown } {
  try {
    const data = readYamlFile(filePath);
    return {
      diagnostics: validateCanonicalConfig(data),
      data
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      diagnostics: [
        {
          code: "E_YAML_PARSE",
          message,
          path: "$",
          severity: "error"
        }
      ],
      data: null
    };
  }
}

export function formatDiagnostics(diagnostics: Diagnostic[]): string {
  if (diagnostics.length === 0) {
    return "no diagnostics";
  }

  return diagnostics
    .map((diag) => `[${diag.severity}] ${diag.code} ${diag.path} - ${diag.message}`)
    .join("\n");
}

const MCP_CAPABILITY_MAP: Record<McpTool, string[]> = {
  codex: ["transport", "command", "args", "url", "env", "env_headers"],
  cursor: ["transport", "url", "env_headers", "env"],
  windsurf: ["transport", "url", "env"]
};

function normalizeMcpFixture(input: unknown): McpFixture {
  if (!isRecord(input) || !isRecord(input.servers)) {
    return { servers: {} };
  }

  const servers: Record<string, McpServer> = {};
  for (const serverName of Object.keys(input.servers).sort()) {
    const raw = input.servers[serverName];
    if (isRecord(raw)) {
      servers[serverName] = raw;
    }
  }

  return { servers };
}

function toTomlString(value: string): string {
  return JSON.stringify(value);
}

function mapToStableRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;

  const out: Record<string, string> = {};
  for (const key of Object.keys(value).sort()) {
    const raw = value[key];
    if (typeof raw === "string") {
      out[key] = raw;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function toSortedStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((entry): entry is string => typeof entry === "string");
  return strings.length > 0 ? strings : undefined;
}

function buildCodexToml(servers: Record<string, McpServer>): string {
  const lines: string[] = [];
  for (const serverName of Object.keys(servers).sort()) {
    const server = servers[serverName];
    lines.push(`[mcp_servers.${serverName}]`);

    if (typeof server.transport === "string") {
      lines.push(`transport = ${toTomlString(server.transport)}`);
    }
    if (typeof server.command === "string") {
      lines.push(`command = ${toTomlString(server.command)}`);
    }

    const args = toSortedStringArray(server.args);
    if (args) {
      lines.push(`args = [${args.map((item) => toTomlString(item)).join(", ")}]`);
    }

    if (typeof server.url === "string") {
      lines.push(`url = ${toTomlString(server.url)}`);
    }

    const env = mapToStableRecord(server.env);
    if (env) {
      const values = Object.keys(env)
        .sort()
        .map((key) => `${key} = ${toTomlString(env[key])}`)
        .join(", ");
      lines.push(`env = { ${values} }`);
    }

    const headers = mapToStableRecord(server.env_headers);
    if (headers) {
      const values = Object.keys(headers)
        .sort()
        .map((key) => `${key} = ${toTomlString(headers[key])}`)
        .join(", ");
      lines.push(`env_headers = { ${values} }`);
    }

    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function buildCursorJson(servers: Record<string, McpServer>): string {
  const mapped: Record<string, Record<string, unknown>> = {};
  for (const serverName of Object.keys(servers).sort()) {
    const server = servers[serverName];
    const out: Record<string, unknown> = {};

    if (typeof server.transport === "string") out.transport = server.transport;
    if (typeof server.url === "string") out.url = server.url;

    const headers = mapToStableRecord(server.env_headers);
    if (headers) out.env_headers = headers;

    const env = mapToStableRecord(server.env);
    if (env) out.env = env;

    mapped[serverName] = out;
  }

  return stableJson({
    mcpServers: mapped
  });
}

function buildWindsurfJson(servers: Record<string, McpServer>): string {
  const mapped: Record<string, Record<string, unknown>> = {};
  for (const serverName of Object.keys(servers).sort()) {
    const server = servers[serverName];
    const out: Record<string, unknown> = {};

    if (typeof server.transport === "string") out.transport = server.transport;
    if (typeof server.url === "string") out.url = server.url;

    const env = mapToStableRecord(server.env);
    if (env) out.env = env;

    mapped[serverName] = out;
  }

  return stableJson({
    servers: mapped
  });
}

export function generateMcpForTool(tool: McpTool, input: unknown): McpGenerationResult {
  const normalized = normalizeMcpFixture(input);
  const allowed = new Set(MCP_CAPABILITY_MAP[tool]);
  const warnings: string[] = [];

  for (const serverName of Object.keys(normalized.servers).sort()) {
    const server = normalized.servers[serverName];
    for (const key of Object.keys(server).sort()) {
      if (!allowed.has(key)) {
        warnings.push(
          `W_UNSUPPORTED_FIELD servers.${serverName}.${key} is not supported by ${tool}; dropped during generation.`
        );
      }
    }
  }

  const filteredServers: Record<string, McpServer> = {};
  for (const serverName of Object.keys(normalized.servers).sort()) {
    const source = normalized.servers[serverName];
    const filtered: McpServer = {};

    for (const key of Object.keys(source).sort()) {
      if (allowed.has(key)) {
        filtered[key] = source[key];
      }
    }
    filteredServers[serverName] = filtered;
  }

  let output = "";
  switch (tool) {
    case "codex":
      output = buildCodexToml(filteredServers);
      break;
    case "cursor":
      output = buildCursorJson(filteredServers);
      break;
    case "windsurf":
      output = buildWindsurfJson(filteredServers);
      break;
  }

  return {
    output,
    warnings,
    capabilityMap: MCP_CAPABILITY_MAP
  };
}

function normalizeJetbrainsPromptLibrary(input: unknown): JetbrainsPromptLibraryFixture {
  const fallback: JetbrainsPromptLibraryFixture = {
    mode: "bundle_only",
    prompts: []
  };

  if (!isRecord(input)) {
    return fallback;
  }

  const jetbrains = isRecord(input.jetbrains) ? input.jetbrains : undefined;
  const promptLibrary = jetbrains && isRecord(jetbrains.prompt_library) ? jetbrains.prompt_library : undefined;
  if (!promptLibrary) {
    return fallback;
  }

  const modeRaw = promptLibrary.mode;
  const mode: JetbrainsPromptMode = modeRaw === "native_file" ? "native_file" : "bundle_only";

  const promptsRaw = Array.isArray(promptLibrary.prompts) ? promptLibrary.prompts : [];
  const prompts: JetbrainsPrompt[] = [];
  for (const entry of promptsRaw) {
    if (!isRecord(entry)) continue;
    if (typeof entry.id !== "string" || entry.id.length === 0) continue;
    if (typeof entry.title !== "string" || entry.title.length === 0) continue;
    if (typeof entry.prompt_file !== "string" || entry.prompt_file.length === 0) continue;

    prompts.push({
      id: entry.id,
      title: entry.title,
      prompt_file: entry.prompt_file
    });
  }

  prompts.sort((a, b) => a.id.localeCompare(b.id));
  return {
    mode,
    prompts
  };
}

function renderJetbrainsPromptsMarkdown(mode: JetbrainsPromptMode, prompts: JetbrainsPrompt[]): string {
  const lines: string[] = [];
  lines.push("# Prompt Bundle");
  lines.push("");

  if (prompts.length === 0) {
    lines.push("- (no prompts defined)");
  } else {
    for (const prompt of prompts) {
      lines.push(`- ${prompt.id}: ${prompt.title} (${prompt.prompt_file})`);
    }
  }

  lines.push("");
  lines.push(`_mode: ${mode}_`);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function renderJetbrainsImportInstructions(mode: JetbrainsPromptMode): string {
  const lines: string[] = [];
  lines.push("# JetBrains Prompt Library Import");
  lines.push("");
  lines.push("1. Treat this directory as managed output from `beep-sync`.");
  lines.push("2. Import prompts from `prompts.md` via JetBrains Prompt Library UI.");
  lines.push("3. Keep `prompts.json` as deterministic machine-readable sidecar.");

  if (mode === "native_file") {
    lines.push("4. Native-file probe enabled: target `.aiassistant/prompt-library/prompts.json`.");
  }

  lines.push("");
  lines.push("Do not hand-edit generated artifacts.");
  lines.push("");
  return `${lines.join("\n")}\n`;
}

export function generateJetbrainsPromptLibrary(
  input: unknown,
  modeOverride?: string
): JetbrainsPromptLibraryEnvelope {
  const normalized = normalizeJetbrainsPromptLibrary(input);
  const warnings: string[] = [];

  let mode: JetbrainsPromptMode = normalized.mode;
  if (modeOverride !== undefined) {
    if (modeOverride === "bundle_only" || modeOverride === "native_file") {
      mode = modeOverride;
    } else {
      warnings.push(
        `W_UNSUPPORTED_MODE Requested mode "${modeOverride}" is unsupported; falling back to "${mode}".`
      );
    }
  }

  const promptsPayload = {
    version: 1,
    mode,
    prompts: normalized.prompts
  };

  const artifacts: JetbrainsArtifact[] = [
    {
      path: ".aiassistant/prompt-library/prompts.md",
      content: renderJetbrainsPromptsMarkdown(mode, normalized.prompts),
      sha256: ""
    },
    {
      path: ".aiassistant/prompt-library/prompts.json",
      content: stableJson(promptsPayload),
      sha256: ""
    },
    {
      path: ".aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md",
      content: renderJetbrainsImportInstructions(mode),
      sha256: ""
    }
  ];

  for (const artifact of artifacts) {
    artifact.sha256 = sha256(artifact.content);
  }

  const bundleHash = sha256(
    stableJson(
      artifacts.map((artifact) => ({
        path: artifact.path,
        sha256: artifact.sha256
      }))
    )
  );

  return {
    tool: "jetbrains",
    mode,
    warnings,
    artifacts,
    bundleHash,
    nativeProbe: {
      enabled: mode === "native_file",
      path: mode === "native_file" ? ".aiassistant/prompt-library/prompts.json" : null,
      roundTripDeterministic: true
    }
  };
}

function parsePoc04Fixture(fixturePath: string): Poc04Plan {
  const fixtureData = readYamlDocument(fixturePath);
  const root = isRecord(fixtureData) ? fixtureData : {};
  const workspaceRoot = resolve(dirname(fixturePath), "workspace");

  const managedTargetsRaw = Array.isArray(root.managed_targets) ? root.managed_targets : [];
  const managedTargets = managedTargetsRaw
    .map((entry) => {
      if (!isRecord(entry)) return null;
      const pathValue = entry.path;
      if (typeof pathValue !== "string" || pathValue.length === 0) return null;
      return pathValue;
    })
    .filter((value): value is string => value !== null)
    .sort((a, b) => a.localeCompare(b));

  const statePathRaw = typeof root.state_path === "string" ? root.state_path : ".beep/managed-files.json";

  const managedFile = resolve(workspaceRoot, "managed-target.txt");
  const unmanagedFile = resolve(workspaceRoot, "unmanaged-note.txt");
  const backupFile = `${managedFile}.bak`;
  const stateFile = resolve(workspaceRoot, statePathRaw);

  const lines = ["GENERATED: beep-sync poc-04 managed target content", "managed_targets:"];
  for (const target of managedTargets) {
    lines.push(`- ${target}`);
  }
  const generatedContent = `${lines.join("\n")}\n`;

  return {
    fixturePath: resolve(fixturePath),
    workspaceRoot,
    managedFile,
    unmanagedFile,
    backupFile,
    stateFile,
    managedTargets,
    generatedContent
  };
}

function readTextOrNull(pathValue: string): string | null {
  if (!existsSync(pathValue)) return null;
  return readFileSync(pathValue, "utf8");
}

function hashTextOrNull(value: string | null): string | null {
  if (value === null) return null;
  return sha256(value);
}

function writePoc04State(pathValue: string, state: Poc04State): void {
  mkdirSync(dirname(pathValue), { recursive: true });
  writeFileSync(pathValue, stableJson(state), "utf8");
}

function readPoc04State(pathValue: string): Poc04State | null {
  if (!existsSync(pathValue)) return null;
  try {
    const parsed = JSON.parse(readFileSync(pathValue, "utf8")) as unknown;
    if (!isRecord(parsed)) return null;
    if (parsed.version !== 1) return null;
    if (
      typeof parsed.managedFile !== "string" ||
      typeof parsed.backupFile !== "string" ||
      typeof parsed.managedHash !== "string" ||
      typeof parsed.unmanagedFile !== "string" ||
      (parsed.unmanagedHashAtApply !== null && typeof parsed.unmanagedHashAtApply !== "string")
    ) {
      return null;
    }
    if (parsed.lastAction !== "apply") return null;

    return {
      version: 1,
      managedFile: parsed.managedFile,
      backupFile: parsed.backupFile,
      managedHash: parsed.managedHash,
      unmanagedFile: parsed.unmanagedFile,
      unmanagedHashAtApply: parsed.unmanagedHashAtApply,
      lastAction: "apply"
    };
  } catch {
    return null;
  }
}

export function runPoc04Apply(fixturePath: string, dryRun: boolean): Poc04OperationResult {
  const plan = parsePoc04Fixture(fixturePath);
  const messages: string[] = [];

  const beforeManaged = readTextOrNull(plan.managedFile);
  const beforeUnmanaged = readTextOrNull(plan.unmanagedFile);

  if (dryRun) {
    const changed = beforeManaged !== plan.generatedContent;
    messages.push(
      changed
        ? "managed file would be updated with generated content"
        : "managed file already matches generated content"
    );
    return {
      ok: true,
      action: "apply",
      dryRun: true,
      changed,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages
    };
  }

  mkdirSync(plan.workspaceRoot, { recursive: true });
  if (beforeManaged !== null) {
    copyFileSync(plan.managedFile, plan.backupFile);
    messages.push("backup created");
  }

  writeFileSync(plan.managedFile, plan.generatedContent, "utf8");
  const state: Poc04State = {
    version: 1,
    managedFile: plan.managedFile,
    backupFile: plan.backupFile,
    managedHash: sha256(plan.generatedContent),
    unmanagedFile: plan.unmanagedFile,
    unmanagedHashAtApply: hashTextOrNull(beforeUnmanaged),
    lastAction: "apply"
  };
  writePoc04State(plan.stateFile, state);
  messages.push("managed content written");
  messages.push("state updated");

  return {
    ok: true,
    action: "apply",
    dryRun: false,
    changed: beforeManaged !== plan.generatedContent,
    managedFile: plan.managedFile,
    unmanagedFile: plan.unmanagedFile,
    stateFile: plan.stateFile,
    messages
  };
}

export function runPoc04Check(fixturePath: string): Poc04OperationResult {
  const plan = parsePoc04Fixture(fixturePath);
  const messages: string[] = [];
  const state = readPoc04State(plan.stateFile);
  if (!state) {
    return {
      ok: false,
      action: "check",
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["state file missing or invalid"]
    };
  }

  const managedContent = readTextOrNull(plan.managedFile);
  if (managedContent === null) {
    return {
      ok: false,
      action: "check",
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["managed file is missing"]
    };
  }

  const managedHash = sha256(managedContent);
  if (managedHash !== state.managedHash || managedContent !== plan.generatedContent) {
    return {
      ok: false,
      action: "check",
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["managed file drift detected"]
    };
  }

  const unmanagedContent = readTextOrNull(plan.unmanagedFile);
  const unmanagedHash = hashTextOrNull(unmanagedContent);
  if (state.unmanagedHashAtApply !== unmanagedHash) {
    return {
      ok: false,
      action: "check",
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["unmanaged file hash changed since apply"]
    };
  }

  messages.push("managed state is consistent");
  return {
    ok: true,
    action: "check",
    dryRun: false,
    changed: false,
    managedFile: plan.managedFile,
    unmanagedFile: plan.unmanagedFile,
    stateFile: plan.stateFile,
    messages
  };
}

function removeIfEmpty(pathValue: string): void {
  if (!existsSync(pathValue)) return;
  const stat = statSync(pathValue);
  if (!stat.isDirectory()) return;
  const items = readdirSync(pathValue);
  if (items.length === 0) {
    rmdirSync(pathValue);
  }
}

export function runPoc04Revert(fixturePath: string): Poc04OperationResult {
  const plan = parsePoc04Fixture(fixturePath);
  const messages: string[] = [];
  const state = readPoc04State(plan.stateFile);
  if (!state) {
    return {
      ok: true,
      action: "revert",
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["no managed state present; revert is idempotent no-op"]
    };
  }

  let changed = false;
  if (existsSync(state.backupFile)) {
    copyFileSync(state.backupFile, state.managedFile);
    rmSync(state.backupFile, { force: true });
    changed = true;
    messages.push("restored managed file from backup");
  } else {
    const managedContent = readTextOrNull(state.managedFile);
    if (managedContent !== null && sha256(managedContent) === state.managedHash) {
      rmSync(state.managedFile, { force: true });
      changed = true;
      messages.push("removed managed file with no backup");
    }
  }

  if (existsSync(plan.stateFile)) {
    rmSync(plan.stateFile, { force: true });
    changed = true;
    messages.push("removed managed state");
  }

  removeIfEmpty(dirname(plan.stateFile));

  return {
    ok: true,
    action: "revert",
    dryRun: false,
    changed,
    managedFile: plan.managedFile,
    unmanagedFile: plan.unmanagedFile,
    stateFile: plan.stateFile,
    messages
  };
}

function parseSecretFixture(input: unknown): SecretFixture {
  const fallback: SecretFixture = {
    required: [],
    optional: [],
    optionalPolicy: "warn"
  };
  if (!isRecord(input) || !isRecord(input.secrets)) return fallback;

  const secrets = input.secrets;
  const optionalPolicy = secrets.optional_policy === "warn" ? "warn" : "warn";

  function parseRefs(value: unknown): SecretRef[] {
    if (!Array.isArray(value)) return [];
    const refs: SecretRef[] = [];
    for (const entry of value) {
      if (!isRecord(entry)) continue;
      if (typeof entry.id !== "string" || entry.id.length === 0) continue;
      if (typeof entry.ref !== "string" || entry.ref.length === 0) continue;
      refs.push({ id: entry.id, ref: entry.ref });
    }
    refs.sort((a, b) => a.id.localeCompare(b.id));
    return refs;
  }

  return {
    required: parseRefs(secrets.required),
    optional: parseRefs(secrets.optional),
    optionalPolicy
  };
}

function resolveSecretRef(ref: string, mode: SecretResolverMode): { ok: boolean; diagnostic?: string } {
  if (mode === "mock") {
    if (ref.includes("DOES_NOT_EXIST") || ref.includes("/missing/")) {
      return { ok: false, diagnostic: "E_SECRET_MISSING mock resolver marked ref as missing." };
    }
    return { ok: true };
  }

  const read = spawnSync("op", ["read", ref], {
    encoding: "utf8",
    timeout: 8_000
  });

  if (read.status === 0) {
    return { ok: true };
  }

  const stderr = `${read.stderr ?? ""}`.toLowerCase();
  if (stderr.includes("not signed in")) {
    return { ok: false, diagnostic: "E_SECRET_AUTH desktop auth is not signed in." };
  }
  if (stderr.includes("service account") || stderr.includes("token")) {
    return { ok: false, diagnostic: "E_SECRET_AUTH service account token is missing or invalid." };
  }
  if (stderr.includes("isn't an item") || stderr.includes("not found") || stderr.includes("does not exist")) {
    return { ok: false, diagnostic: "E_SECRET_MISSING secret reference not found." };
  }

  return { ok: false, diagnostic: "E_SECRET_READ_FAILED unable to resolve secret reference." };
}

function detectSecretResolverMode(): SecretResolverMode {
  const forced = process.env.BEEP_SYNC_SECRET_MODE;
  if (forced === "mock") {
    return "mock";
  }

  if (typeof process.env.OP_SERVICE_ACCOUNT_TOKEN === "string" && process.env.OP_SERVICE_ACCOUNT_TOKEN.length > 0) {
    return "service_account";
  }
  return "desktop";
}

function ensureDesktopAuthIfNeeded(mode: SecretResolverMode): string | null {
  if (mode !== "desktop") return null;
  const whoami = spawnSync("op", ["whoami"], {
    encoding: "utf8",
    timeout: 5_000
  });
  if (whoami.status === 0) return null;
  return "E_SECRET_AUTH desktop auth unavailable (`op whoami` failed).";
}

export function resolveSecretsFromFixturePath(fixturePath: string): SecretResolutionResult {
  const fixtureData = readYamlDocument(fixturePath);
  const fixture = parseSecretFixture(fixtureData);
  const source = detectSecretResolverMode();
  const diagnostics: string[] = [];

  const desktopAuthError = ensureDesktopAuthIfNeeded(source);
  if (desktopAuthError) {
    diagnostics.push(desktopAuthError);
  }

  const requiredResolved: string[] = [];
  const requiredMissing: string[] = [];
  const optionalResolved: string[] = [];
  const optionalMissing: string[] = [];

  function resolveGroup(items: SecretRef[], missing: string[], resolved: string[]): void {
    for (const item of items) {
      if (desktopAuthError) {
        missing.push(item.id);
        continue;
      }

      const resolution = resolveSecretRef(item.ref, source);
      if (resolution.ok) {
        resolved.push(item.id);
      } else {
        missing.push(item.id);
        if (resolution.diagnostic) {
          diagnostics.push(`${resolution.diagnostic} id=${item.id}`);
        }
      }
    }
  }

  resolveGroup(fixture.required, requiredMissing, requiredResolved);
  resolveGroup(fixture.optional, optionalMissing, optionalResolved);

  if (optionalMissing.length > 0) {
    diagnostics.push(
      `W_OPTIONAL_SECRET_MISSING optional missing ids: ${optionalMissing.join(", ")} (policy=${fixture.optionalPolicy}).`
    );
  }

  const uniqueDiagnostics = Array.from(new Set(diagnostics)).sort((a, b) => a.localeCompare(b));

  return {
    ok: requiredMissing.length === 0,
    source,
    optionalPolicy: fixture.optionalPolicy,
    required: {
      resolved: requiredResolved.sort((a, b) => a.localeCompare(b)),
      missing: requiredMissing.sort((a, b) => a.localeCompare(b))
    },
    optional: {
      resolved: optionalResolved.sort((a, b) => a.localeCompare(b)),
      missing: optionalMissing.sort((a, b) => a.localeCompare(b))
    },
    diagnostics: uniqueDiagnostics,
    redaction: {
      valuesExposed: false
    }
  };
}
