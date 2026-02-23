import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
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
