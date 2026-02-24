/**
 * Runtime and fixture helpers for beep-sync managed artifacts.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { jsonStringifyPretty } from "@beep/repo-utils";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import YAML from "yaml";

/**
 * Canonical scaffold version for beep-sync fixtures.
 *
 * @since 0.0.0
 * @category Metadata
 */
export const scaffoldVersion = "0.1.0";

/**
 * Allowed diagnostic severities emitted by canonical validators.
 *
 * @since 0.0.0
 * @category Models
 */
export type Severity = Data.TaggedEnum<{
  error: {};
  warning: {};
}>;
const Severity = Data.taggedEnum<Severity>();
type SeverityTag = Severity["_tag"];

/**
 * Structured validation message for canonical config checks.
 *
 * @since 0.0.0
 * @category Models
 */
export type Diagnostic = {
  code: string;
  message: string;
  path: string;
  severity: SeverityTag;
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

/**
 * Normalized representation of a canonical beep-sync configuration file.
 *
 * @since 0.0.0
 * @category Models
 */
export type CanonicalConfig = {
  version: number;
  instructions: {
    base: string[];
  };
  commands: CanonicalCommand[];
  mcp_servers: Record<string, CanonicalMcpServer>;
};

/**
 * Stable envelope with canonical config and deterministic content hash.
 *
 * @since 0.0.0
 * @category Models
 */
export type NormalizedEnvelope = {
  version: 1;
  hash: string;
  config: CanonicalConfig;
};

/**
 * Supported MCP output targets.
 *
 * @since 0.0.0
 * @category MCP
 */
export type McpTool = Data.TaggedEnum<{
  codex: {};
  cursor: {};
  windsurf: {};
}>;
const McpTool = Data.taggedEnum<McpTool>();
/**
 * Tag value union for {@link McpTool}.
 *
 * @since 0.0.0
 * @category MCP
 */
export type McpToolTag = McpTool["_tag"];

type McpServer = Record<string, unknown>;

type McpFixture = {
  servers: Record<string, McpServer>;
};

/**
 * Generated payload and warnings for an MCP target.
 *
 * @since 0.0.0
 * @category MCP
 */
export type McpGenerationResult = {
  output: string;
  warnings: string[];
  capabilityMap: Record<McpToolTag, string[]>;
};

/**
 * Prompt library generation mode for JetBrains artifacts.
 *
 * @since 0.0.0
 * @category JetBrains
 */
export type JetbrainsPromptMode = Data.TaggedEnum<{
  bundle_only: {};
  native_file: {};
}>;
const JetbrainsPromptMode = Data.taggedEnum<JetbrainsPromptMode>();
type JetbrainsPromptModeTag = JetbrainsPromptMode["_tag"];

type JetbrainsPrompt = {
  id: string;
  title: string;
  prompt_file: string;
};

type JetbrainsPromptLibraryFixture = {
  mode: JetbrainsPromptMode;
  prompts: JetbrainsPrompt[];
};

/**
 * Generated file emitted for JetBrains prompt-library sync.
 *
 * @since 0.0.0
 * @category JetBrains
 */
export type JetbrainsArtifact = {
  path: string;
  content: string;
  sha256: string;
};

/**
 * Deterministic JetBrains prompt-library generation envelope.
 *
 * @since 0.0.0
 * @category JetBrains
 */
export type JetbrainsPromptLibraryEnvelope = {
  tool: "jetbrains";
  mode: JetbrainsPromptModeTag;
  warnings: string[];
  artifacts: JetbrainsArtifact[];
  bundleHash: string;
  nativeProbe: {
    enabled: boolean;
    path: string | null;
    roundTripDeterministic: boolean;
  };
};

class Poc04ApplyAction extends Data.TaggedClass("apply")<{}> {}
class Poc04CheckAction extends Data.TaggedClass("check")<{}> {}
class Poc04RevertAction extends Data.TaggedClass("revert")<{}> {}

const Poc04Action = {
  apply: Poc04ApplyAction,
  check: Poc04CheckAction,
  revert: Poc04RevertAction,
} as const;

type Poc04Action =
  | InstanceType<typeof Poc04ApplyAction>
  | InstanceType<typeof Poc04CheckAction>
  | InstanceType<typeof Poc04RevertAction>;
type Poc04ActionTag = Poc04Action["_tag"];

const poc04ApplyTag = new Poc04Action.apply()._tag;
const poc04CheckTag = new Poc04Action.check()._tag;
const poc04RevertTag = new Poc04Action.revert()._tag;

class Poc04State extends S.Class<Poc04State>("@beep/beep-sync/Poc04State")({
  version: S.Literal(1),
  managedFile: S.String,
  backupFile: S.String,
  managedHash: S.String,
  unmanagedFile: S.String,
  unmanagedHashAtApply: S.NullOr(S.String),
  lastAction: S.Literal(poc04ApplyTag),
}) {}

const Poc04StateFromJson = S.fromJsonString(Poc04State);
const JsonStringFromJson = S.fromJsonString(S.String);

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

/**
 * Result envelope for POC-04 apply/check/revert operations.
 *
 * @since 0.0.0
 * @category POC04
 */
export type Poc04OperationResult = {
  ok: boolean;
  action: Poc04ActionTag;
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

type SecretResolverMode = Data.TaggedEnum<{
  mock: {};
  desktop: {};
  service_account: {};
}>;
const SecretResolverMode = Data.taggedEnum<SecretResolverMode>();
type SecretResolverModeTag = SecretResolverMode["_tag"];

/**
 * Result envelope for resolving secrets referenced by a fixture.
 *
 * @since 0.0.0
 * @category Secrets
 */
export type SecretResolutionResult = {
  ok: boolean;
  source: SecretResolverModeTag;
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

const byString = Order.String;

const isIntegerNumber = (value: unknown): value is number => P.isNumber(value) && Number.isInteger(value);

function isRecord(value: unknown): value is Record<string, unknown> {
  return P.isObject(value);
}

function sortedRecordKeys<V>(record: Record<string, V>): ReadonlyArray<string> {
  return A.sort(R.keys(record), byString);
}

function toSortedUniqueStrings(value: unknown): string[] {
  if (!A.isArray(value)) {
    return A.empty<string>();
  }

  return pipe(value, A.filter(P.isString), A.dedupe, A.sort(byString));
}

function stableSortDeep(value: unknown): unknown {
  if (A.isArray(value)) {
    return A.map(value, stableSortDeep);
  }

  if (!isRecord(value)) {
    return value;
  }

  return R.fromEntries(
    pipe(
      sortedRecordKeys(value),
      A.map((key) => [key, stableSortDeep(value[key])] as const)
    )
  );
}

function stableJson(value: unknown): string {
  const encoded = Effect.runSync(Effect.orDie(jsonStringifyPretty(stableSortDeep(value))));
  return Str.endsWith("\n")(encoded) ? encoded : `${encoded}\n`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

const diagnosticOrder = Order.make<Diagnostic>((self, that) => {
  const byPath = byString(self.path, that.path);
  if (byPath !== 0) {
    return byPath;
  }
  return byString(self.code, that.code);
});

const canonicalCommandOrder = Order.make<CanonicalCommand>((self, that) => {
  const byId = byString(self.id, that.id);
  if (byId !== 0) {
    return byId;
  }

  const byRun = byString(self.run, that.run);
  if (byRun !== 0) {
    return byRun;
  }

  return byString(
    O.getOrElse(O.fromNullishOr(self.cwd), () => ""),
    O.getOrElse(O.fromNullishOr(that.cwd), () => "")
  );
});

const jetbrainsPromptOrder = Order.make<JetbrainsPrompt>((self, that) => byString(self.id, that.id));

function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  return A.sort(diagnostics, diagnosticOrder);
}

function readYamlFile(pathValue: string): unknown {
  const text = readFileSync(pathValue, "utf8");
  return YAML.parse(text);
}

/**
 * Reads and parses a YAML file into an unknown document payload.
 *
 * @param pathValue - Path to the YAML document on disk.
 * @returns Parsed YAML document value.
 * @since 0.0.0
 * @category Canonical
 */
export function readYamlDocument(pathValue: string): unknown {
  return readYamlFile(pathValue);
}

/**
 * Validates a raw canonical config value and returns diagnostics.
 *
 * @param input - Untrusted config payload.
 * @returns Sorted diagnostics for structural and semantic issues.
 * @since 0.0.0
 * @category Canonical
 */
export function validateCanonicalConfig(input: unknown): Diagnostic[] {
  const diagnostics = A.empty<Diagnostic>();

  if (!isRecord(input)) {
    diagnostics.push({
      code: "E_ROOT_TYPE",
      message: "Root value must be an object mapping.",
      path: "$",
      severity: Severity.error()._tag,
    });
    return diagnostics;
  }

  if (!isIntegerNumber(input.version)) {
    diagnostics.push({
      code: "E_VERSION_TYPE",
      message: "`version` must be an integer number.",
      path: "version",
      severity: Severity.error()._tag,
    });
  }

  const instructions = input.instructions;
  if (instructions !== undefined) {
    if (!isRecord(instructions)) {
      diagnostics.push({
        code: "E_INSTRUCTIONS_TYPE",
        message: "`instructions` must be an object.",
        path: "instructions",
        severity: Severity.error()._tag,
      });
    } else if (instructions.base !== undefined) {
      if (!A.isArray(instructions.base) || A.some(instructions.base, (item) => !P.isString(item))) {
        diagnostics.push({
          code: "E_INSTRUCTIONS_BASE_TYPE",
          message: "`instructions.base` must be an array of strings.",
          path: "instructions.base",
          severity: Severity.error()._tag,
        });
      }
    }
  }

  const commands = input.commands;
  if (commands !== undefined) {
    if (!A.isArray(commands)) {
      diagnostics.push({
        code: "E_COMMANDS_TYPE",
        message: "`commands` must be an array.",
        path: "commands",
        severity: Severity.error()._tag,
      });
    } else {
      for (let i = 0; i < commands.length; i++) {
        const entry = commands[i];
        if (!isRecord(entry)) {
          diagnostics.push({
            code: "E_COMMAND_ENTRY_TYPE",
            message: "Each command must be an object.",
            path: `commands[${i}]`,
            severity: Severity.error()._tag,
          });
          continue;
        }

        if (!P.isString(entry.id) || Str.length(entry.id) === 0) {
          diagnostics.push({
            code: "E_COMMAND_ID_TYPE",
            message: "`commands[*].id` must be a non-empty string.",
            path: `commands[${i}].id`,
            severity: Severity.error()._tag,
          });
        }

        if (!P.isString(entry.run) || Str.length(entry.run) === 0) {
          diagnostics.push({
            code: "E_COMMAND_RUN_TYPE",
            message: "`commands[*].run` must be a non-empty string.",
            path: `commands[${i}].run`,
            severity: Severity.error()._tag,
          });
        }

        if (!P.isUndefined(entry.cwd) && !P.isString(entry.cwd)) {
          diagnostics.push({
            code: "E_COMMAND_CWD_TYPE",
            message: "`commands[*].cwd` must be a string when provided.",
            path: `commands[${i}].cwd`,
            severity: Severity.error()._tag,
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
        severity: Severity.error()._tag,
      });
    } else {
      for (const [name, rawServer] of R.toEntries(mcpServers)) {
        const basePath = `mcp_servers.${name}`;
        if (!isRecord(rawServer)) {
          diagnostics.push({
            code: "E_MCP_SERVER_ENTRY_TYPE",
            message: "Each MCP server entry must be an object.",
            path: basePath,
            severity: Severity.error()._tag,
          });
          continue;
        }

        if (!P.isString(rawServer.transport) || Str.length(rawServer.transport) === 0) {
          diagnostics.push({
            code: "E_MCP_TRANSPORT_TYPE",
            message: "`transport` must be a non-empty string.",
            path: `${basePath}.transport`,
            severity: Severity.error()._tag,
          });
        }

        if (!P.isUndefined(rawServer.url) && !P.isString(rawServer.url)) {
          diagnostics.push({
            code: "E_MCP_URL_TYPE",
            message: "`url` must be a string when provided.",
            path: `${basePath}.url`,
            severity: Severity.error()._tag,
          });
        }

        if (!P.isUndefined(rawServer.command) && !P.isString(rawServer.command)) {
          diagnostics.push({
            code: "E_MCP_COMMAND_TYPE",
            message: "`command` must be a string when provided.",
            path: `${basePath}.command`,
            severity: Severity.error()._tag,
          });
        }

        if (rawServer.args !== undefined) {
          const args = rawServer.args;
          if (!A.isArray(args) || A.some(args, (arg) => !P.isString(arg))) {
            diagnostics.push({
              code: "E_MCP_ARGS_TYPE",
              message: "`args` must be an array of strings when provided.",
              path: `${basePath}.args`,
              severity: Severity.error()._tag,
            });
          }
        }
      }
    }
  }

  return sortDiagnostics(diagnostics);
}

/**
 * Normalizes a raw canonical config into a deterministic in-memory shape.
 *
 * @param input - Untrusted config payload.
 * @returns Normalized canonical config object.
 * @since 0.0.0
 * @category Canonical
 */
export function normalizeCanonicalConfig(input: unknown): CanonicalConfig {
  const config = isRecord(input) ? input : {};
  const rawInstructions = isRecord(config.instructions) ? config.instructions : {};
  const rawCommands = A.isArray(config.commands) ? config.commands : A.empty<unknown>();
  const rawMcpServers = isRecord(config.mcp_servers) ? config.mcp_servers : {};

  const commands = A.empty<CanonicalCommand>();
  for (const entry of rawCommands) {
    if (!isRecord(entry)) continue;
    if (!P.isString(entry.id) || Str.length(entry.id) === 0) continue;
    if (!P.isString(entry.run) || Str.length(entry.run) === 0) continue;

    const command: CanonicalCommand = { id: entry.id, run: entry.run };
    if (P.isString(entry.cwd)) {
      command.cwd = entry.cwd;
    }
    commands.push(command);
  }

  const sortedCommands = A.sort(commands, canonicalCommandOrder);

  const mcpServers = R.empty<string, CanonicalMcpServer>();
  for (const serverName of sortedRecordKeys(rawMcpServers)) {
    const rawServer = rawMcpServers[serverName];
    if (!isRecord(rawServer)) continue;
    if (!P.isString(rawServer.transport) || Str.length(rawServer.transport) === 0) continue;

    const normalizedServer: CanonicalMcpServer = {
      transport: rawServer.transport,
    };

    if (P.isString(rawServer.url)) {
      normalizedServer.url = rawServer.url;
    }
    if (P.isString(rawServer.command)) {
      normalizedServer.command = rawServer.command;
    }
    if (A.isArray(rawServer.args)) {
      const args = A.filter(rawServer.args, P.isString);
      if (A.isArrayNonEmpty(args)) {
        normalizedServer.args = args;
      }
    }

    mcpServers[serverName] = normalizedServer;
  }

  return {
    version: isIntegerNumber(config.version) ? config.version : 1,
    instructions: {
      base: toSortedUniqueStrings(rawInstructions.base),
    },
    commands: sortedCommands,
    mcp_servers: mcpServers,
  };
}

/**
 * Wraps normalized config with a deterministic hash envelope.
 *
 * @param input - Untrusted config payload.
 * @returns Normalized envelope with content hash.
 * @since 0.0.0
 * @category Canonical
 */
export function normalizeCanonicalEnvelope(input: unknown): NormalizedEnvelope {
  const config = stableSortDeep(normalizeCanonicalConfig(input)) as CanonicalConfig;
  const hash = sha256(stableJson(config));
  return {
    version: 1,
    hash,
    config,
  };
}

const isYamlExtension = (extension: string): boolean => extension === ".yaml" || extension === ".yml";

const collectYamlFilesFromPath = (pathValue: string): ReadonlyArray<string> => {
  const stat = statSync(pathValue);
  if (stat.isFile()) {
    return isYamlExtension(Str.toLowerCase(extname(pathValue))) ? A.make(pathValue) : A.empty<string>();
  }

  const entries = readdirSync(pathValue, { withFileTypes: true });
  return pipe(
    entries,
    A.flatMap((entry) => {
      const next = resolve(pathValue, entry.name);
      if (entry.isDirectory()) {
        return collectYamlFilesFromPath(next);
      }

      return isYamlExtension(Str.toLowerCase(extname(entry.name))) ? A.make(next) : A.empty<string>();
    })
  );
};

/**
 * Collects YAML files from a file or directory recursively.
 *
 * @param pathValue - File or directory path to scan.
 * @returns Absolute YAML file paths in sorted order.
 * @since 0.0.0
 * @category Canonical
 */
export function collectYamlFiles(pathValue: string): string[] {
  const absolutePath = resolve(pathValue);
  return A.sort(collectYamlFilesFromPath(absolutePath), byString);
}

/**
 * Parses and validates a canonical YAML file from disk.
 *
 * @param filePath - Path to a canonical YAML file.
 * @returns Validation diagnostics and parsed data payload.
 * @since 0.0.0
 * @category Canonical
 */
export function validateCanonicalFile(filePath: string): { diagnostics: Diagnostic[]; data: unknown } {
  return Effect.runSync(
    Effect.try({
      try: () => readYamlFile(filePath),
      catch: (error) => (P.isError(error) ? error.message : String(error)),
    }).pipe(
      Effect.match({
        onFailure: (message) => ({
          diagnostics: [
            {
              code: "E_YAML_PARSE",
              message,
              path: "$",
              severity: Severity.error()._tag,
            },
          ],
          data: null,
        }),
        onSuccess: (data) => ({
          diagnostics: validateCanonicalConfig(data),
          data,
        }),
      })
    )
  );
}

/**
 * Formats diagnostics into a newline-delimited display string.
 *
 * @param diagnostics - Diagnostics to format.
 * @returns Human-readable diagnostics text.
 * @since 0.0.0
 * @category Diagnostics
 */
export function formatDiagnostics(diagnostics: Diagnostic[]): string {
  if (A.isArrayEmpty(diagnostics)) {
    return "no diagnostics";
  }

  return pipe(
    diagnostics,
    A.map((diag) => `[${diag.severity}] ${diag.code} ${diag.path} - ${diag.message}`),
    A.join("\n")
  );
}

const MCP_CAPABILITY_MAP: Record<McpToolTag, string[]> = {
  codex: ["transport", "command", "args", "url", "env", "env_headers"],
  cursor: ["transport", "url", "env_headers", "env"],
  windsurf: ["transport", "url", "env"],
};

function normalizeMcpFixture(input: unknown): McpFixture {
  if (!isRecord(input) || !isRecord(input.servers)) {
    return { servers: {} };
  }

  const servers = R.empty<string, McpServer>();
  for (const serverName of sortedRecordKeys(input.servers)) {
    const raw = input.servers[serverName];
    if (isRecord(raw)) {
      servers[serverName] = raw;
    }
  }

  return { servers };
}

function toTomlString(value: string): string {
  return S.encodeSync(JsonStringFromJson)(value);
}

function mapToStableRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) return undefined;

  const out = R.empty<string, string>();
  for (const key of sortedRecordKeys(value)) {
    const raw = value[key];
    if (P.isString(raw)) {
      out[key] = raw;
    }
  }
  return R.isEmptyRecord(out) ? undefined : out;
}

function toSortedStringArray(value: unknown): string[] | undefined {
  if (!A.isArray(value)) return undefined;
  const strings = A.filter(value, P.isString);
  return A.isArrayEmpty(strings) ? undefined : strings;
}

function buildCodexToml(servers: Record<string, McpServer>): string {
  const lines = A.empty<string>();
  for (const serverName of sortedRecordKeys(servers)) {
    const server = servers[serverName];
    lines.push(`[mcp_servers.${serverName}]`);

    if (P.isString(server.transport)) {
      lines.push(`transport = ${toTomlString(server.transport)}`);
    }
    if (P.isString(server.command)) {
      lines.push(`command = ${toTomlString(server.command)}`);
    }

    const args = toSortedStringArray(server.args);
    if (args) {
      lines.push(`args = [${pipe(args, A.map(toTomlString), A.join(", "))}]`);
    }

    if (P.isString(server.url)) {
      lines.push(`url = ${toTomlString(server.url)}`);
    }

    const env = mapToStableRecord(server.env);
    if (env) {
      const values = pipe(
        sortedRecordKeys(env),
        A.map((key) => `${key} = ${toTomlString(env[key])}`),
        A.join(", ")
      );
      lines.push(`env = { ${values} }`);
    }

    const headers = mapToStableRecord(server.env_headers);
    if (headers) {
      const values = pipe(
        sortedRecordKeys(headers),
        A.map((key) => `${key} = ${toTomlString(headers[key])}`),
        A.join(", ")
      );
      lines.push(`env_headers = { ${values} }`);
    }

    lines.push("");
  }

  return `${Str.trimEnd(A.join(lines, "\n"))}\n`;
}

function buildCursorJson(servers: Record<string, McpServer>): string {
  const mapped = R.empty<string, Record<string, unknown>>();
  for (const serverName of sortedRecordKeys(servers)) {
    const server = servers[serverName];
    const out = R.empty<string, unknown>();

    if (P.isString(server.transport)) out.transport = server.transport;
    if (P.isString(server.url)) out.url = server.url;

    const headers = mapToStableRecord(server.env_headers);
    if (headers) out.env_headers = headers;

    const env = mapToStableRecord(server.env);
    if (env) out.env = env;

    mapped[serverName] = out;
  }

  return stableJson({
    mcpServers: mapped,
  });
}

function buildWindsurfJson(servers: Record<string, McpServer>): string {
  const mapped = R.empty<string, Record<string, unknown>>();
  for (const serverName of sortedRecordKeys(servers)) {
    const server = servers[serverName];
    const out = R.empty<string, unknown>();

    if (P.isString(server.transport)) out.transport = server.transport;
    if (P.isString(server.url)) out.url = server.url;

    const env = mapToStableRecord(server.env);
    if (env) out.env = env;

    mapped[serverName] = out;
  }

  return stableJson({
    servers: mapped,
  });
}

/**
 * Parses an MCP tool identifier into a tagged tool value.
 *
 * @param value - Raw tool identifier string.
 * @returns Matching tool option when recognized.
 * @since 0.0.0
 * @category MCP
 */
export function parseMcpTool(value: string): O.Option<McpTool> {
  switch (value) {
    case "codex":
      return O.some(McpTool.codex());
    case "cursor":
      return O.some(McpTool.cursor());
    case "windsurf":
      return O.some(McpTool.windsurf());
    default:
      return O.none();
  }
}

/**
 * Generates tool-specific MCP output from a shared fixture payload.
 *
 * @param tool - Target MCP tool.
 * @param input - Raw MCP fixture payload.
 * @returns Generated output with compatibility warnings.
 * @since 0.0.0
 * @category MCP
 */
export function generateMcpForTool(tool: McpTool, input: unknown): McpGenerationResult {
  const normalized = normalizeMcpFixture(input);
  const toolTag = tool._tag;
  const allowed = HashSet.fromIterable(MCP_CAPABILITY_MAP[toolTag]);
  const warnings = A.empty<string>();

  for (const serverName of sortedRecordKeys(normalized.servers)) {
    const server = normalized.servers[serverName];
    for (const key of sortedRecordKeys(server)) {
      if (!HashSet.has(allowed, key)) {
        warnings.push(
          `W_UNSUPPORTED_FIELD servers.${serverName}.${key} is not supported by ${toolTag}; dropped during generation.`
        );
      }
    }
  }

  const filteredServers = R.empty<string, McpServer>();
  for (const serverName of sortedRecordKeys(normalized.servers)) {
    const source = normalized.servers[serverName];
    const filtered = R.empty<string, unknown>();

    for (const key of sortedRecordKeys(source)) {
      if (HashSet.has(allowed, key)) {
        filtered[key] = source[key];
      }
    }
    filteredServers[serverName] = filtered;
  }

  const output = McpTool.$match(tool, {
    codex: () => buildCodexToml(filteredServers),
    cursor: () => buildCursorJson(filteredServers),
    windsurf: () => buildWindsurfJson(filteredServers),
  });

  return {
    output,
    warnings,
    capabilityMap: MCP_CAPABILITY_MAP,
  };
}

function normalizeJetbrainsPromptLibrary(input: unknown): JetbrainsPromptLibraryFixture {
  const fallback: JetbrainsPromptLibraryFixture = {
    mode: JetbrainsPromptMode.bundle_only(),
    prompts: [],
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
  const mode = modeRaw === "native_file" ? JetbrainsPromptMode.native_file() : JetbrainsPromptMode.bundle_only();

  const promptsRaw = A.isArray(promptLibrary.prompts) ? promptLibrary.prompts : A.empty<unknown>();
  const prompts = A.empty<JetbrainsPrompt>();
  for (const entry of promptsRaw) {
    if (!isRecord(entry)) continue;
    if (!P.isString(entry.id) || Str.length(entry.id) === 0) continue;
    if (!P.isString(entry.title) || Str.length(entry.title) === 0) continue;
    if (!P.isString(entry.prompt_file) || Str.length(entry.prompt_file) === 0) continue;

    prompts.push({
      id: entry.id,
      title: entry.title,
      prompt_file: entry.prompt_file,
    });
  }

  const sortedPrompts = A.sort(prompts, jetbrainsPromptOrder);
  return {
    mode,
    prompts: sortedPrompts,
  };
}

function renderJetbrainsPromptsMarkdown(mode: JetbrainsPromptMode, prompts: JetbrainsPrompt[]): string {
  const lines = A.empty<string>();
  lines.push("# Prompt Bundle");
  lines.push("");

  if (A.isArrayEmpty(prompts)) {
    lines.push("- (no prompts defined)");
  } else {
    for (const prompt of prompts) {
      lines.push(`- ${prompt.id}: ${prompt.title} (${prompt.prompt_file})`);
    }
  }

  lines.push("");
  lines.push(`_mode: ${mode._tag}_`);
  return `${A.join(lines, "\n")}\n`;
}

function renderJetbrainsImportInstructions(mode: JetbrainsPromptMode): string {
  const lines = A.empty<string>();
  lines.push("# JetBrains Prompt Library Import");
  lines.push("");
  lines.push("1. Treat this directory as managed output from `beep-sync`.");
  lines.push("2. Import prompts from `prompts.md` via JetBrains Prompt Library UI.");
  lines.push("3. Keep `prompts.json` as deterministic machine-readable sidecar.");

  if (mode._tag === "native_file") {
    lines.push("4. Native-file probe enabled: target `.aiassistant/prompt-library/prompts.json`.");
  }

  lines.push("");
  lines.push("Do not hand-edit generated artifacts.");
  return `${A.join(lines, "\n")}\n`;
}

/**
 * Builds deterministic JetBrains prompt-library artifacts from fixture input.
 *
 * @param input - Raw fixture payload.
 * @param modeOverride - Optional mode override.
 * @returns JetBrains prompt-library generation envelope.
 * @since 0.0.0
 * @category JetBrains
 */
export function generateJetbrainsPromptLibrary(input: unknown, modeOverride?: string): JetbrainsPromptLibraryEnvelope {
  const normalized = normalizeJetbrainsPromptLibrary(input);
  const warnings = A.empty<string>();

  let mode: JetbrainsPromptMode = normalized.mode;
  if (modeOverride !== undefined) {
    if (modeOverride === "bundle_only" || modeOverride === "native_file") {
      mode = modeOverride === "native_file" ? JetbrainsPromptMode.native_file() : JetbrainsPromptMode.bundle_only();
    } else {
      warnings.push(
        `W_UNSUPPORTED_MODE Requested mode "${modeOverride}" is unsupported; falling back to "${mode._tag}".`
      );
    }
  }

  const promptsPayload = {
    version: 1,
    mode: mode._tag,
    prompts: normalized.prompts,
  };

  const artifacts: JetbrainsArtifact[] = [
    {
      path: ".aiassistant/prompt-library/prompts.md",
      content: renderJetbrainsPromptsMarkdown(mode, normalized.prompts),
      sha256: "",
    },
    {
      path: ".aiassistant/prompt-library/prompts.json",
      content: stableJson(promptsPayload),
      sha256: "",
    },
    {
      path: ".aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md",
      content: renderJetbrainsImportInstructions(mode),
      sha256: "",
    },
  ];

  for (const artifact of artifacts) {
    artifact.sha256 = sha256(artifact.content);
  }

  const bundleHash = sha256(
    stableJson(
      A.map(artifacts, (artifact) => ({
        path: artifact.path,
        sha256: artifact.sha256,
      }))
    )
  );

  return {
    tool: "jetbrains",
    mode: mode._tag,
    warnings,
    artifacts,
    bundleHash,
    nativeProbe: {
      enabled: mode._tag === "native_file",
      path: mode._tag === "native_file" ? ".aiassistant/prompt-library/prompts.json" : null,
      roundTripDeterministic: true,
    },
  };
}

function parsePoc04Fixture(fixturePath: string): Poc04Plan {
  const fixtureData = readYamlDocument(fixturePath);
  const root = isRecord(fixtureData) ? fixtureData : {};
  const workspaceRoot = resolve(dirname(fixturePath), "workspace");

  const managedTargetsRaw = A.isArray(root.managed_targets) ? root.managed_targets : A.empty<unknown>();
  const managedTargets = pipe(
    managedTargetsRaw,
    A.reduce(A.empty<string>(), (acc, entry) => {
      if (!isRecord(entry)) return acc;
      const pathValue = entry.path;
      if (!P.isString(pathValue) || Str.length(pathValue) === 0) return acc;
      return A.append(acc, pathValue);
    }),
    A.sort(byString)
  );

  const statePathRaw = P.isString(root.state_path) ? root.state_path : ".beep/managed-files.json";

  const managedFile = resolve(workspaceRoot, "managed-target.txt");
  const unmanagedFile = resolve(workspaceRoot, "unmanaged-note.txt");
  const backupFile = `${managedFile}.bak`;
  const stateFile = resolve(workspaceRoot, statePathRaw);

  const lines = ["GENERATED: beep-sync poc-04 managed target content", "managed_targets:"];
  for (const target of managedTargets) {
    lines.push(`- ${target}`);
  }
  const generatedContent = `${A.join(lines, "\n")}\n`;

  return {
    fixturePath: resolve(fixturePath),
    workspaceRoot,
    managedFile,
    unmanagedFile,
    backupFile,
    stateFile,
    managedTargets,
    generatedContent,
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

  return Effect.runSync(
    Effect.try({
      try: () => readFileSync(pathValue, "utf8"),
      catch: () => null,
    }).pipe(
      Effect.flatMap((stateText) => {
        if (stateText === null) {
          return Effect.succeed(null);
        }
        return S.decodeUnknownEffect(Poc04StateFromJson)(stateText).pipe(Effect.orElseSucceed(() => null));
      })
    )
  );
}

/**
 * Applies managed POC-04 artifacts and optionally performs a dry run.
 *
 * @param fixturePath - Path to the POC-04 fixture file.
 * @param dryRun - When true, report changes without writing files.
 * @returns Operation result for the apply action.
 * @since 0.0.0
 * @category POC04
 */
export function runPoc04Apply(fixturePath: string, dryRun: boolean): Poc04OperationResult {
  const plan = parsePoc04Fixture(fixturePath);
  const messages = A.empty<string>();

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
      action: poc04ApplyTag,
      dryRun: true,
      changed,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages,
    };
  }

  mkdirSync(plan.workspaceRoot, { recursive: true });
  if (beforeManaged !== null) {
    copyFileSync(plan.managedFile, plan.backupFile);
    messages.push("backup created");
  }

  writeFileSync(plan.managedFile, plan.generatedContent, "utf8");
  const state = new Poc04State({
    version: 1,
    managedFile: plan.managedFile,
    backupFile: plan.backupFile,
    managedHash: sha256(plan.generatedContent),
    unmanagedFile: plan.unmanagedFile,
    unmanagedHashAtApply: hashTextOrNull(beforeUnmanaged),
    lastAction: poc04ApplyTag,
  });
  writePoc04State(plan.stateFile, state);
  messages.push("managed content written");
  messages.push("state updated");

  return {
    ok: true,
    action: poc04ApplyTag,
    dryRun: false,
    changed: beforeManaged !== plan.generatedContent,
    managedFile: plan.managedFile,
    unmanagedFile: plan.unmanagedFile,
    stateFile: plan.stateFile,
    messages,
  };
}

/**
 * Checks whether current POC-04 managed state matches expectations.
 *
 * @param fixturePath - Path to the POC-04 fixture file.
 * @returns Operation result for the check action.
 * @since 0.0.0
 * @category POC04
 */
export function runPoc04Check(fixturePath: string): Poc04OperationResult {
  const plan = parsePoc04Fixture(fixturePath);
  const messages = A.empty<string>();
  const state = readPoc04State(plan.stateFile);
  if (!state) {
    return {
      ok: false,
      action: poc04CheckTag,
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["state file missing or invalid"],
    };
  }

  const managedContent = readTextOrNull(plan.managedFile);
  if (managedContent === null) {
    return {
      ok: false,
      action: poc04CheckTag,
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["managed file is missing"],
    };
  }

  const managedHash = sha256(managedContent);
  if (managedHash !== state.managedHash || managedContent !== plan.generatedContent) {
    return {
      ok: false,
      action: poc04CheckTag,
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["managed file drift detected"],
    };
  }

  const unmanagedContent = readTextOrNull(plan.unmanagedFile);
  const unmanagedHash = hashTextOrNull(unmanagedContent);
  if (state.unmanagedHashAtApply !== unmanagedHash) {
    return {
      ok: false,
      action: poc04CheckTag,
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["unmanaged file hash changed since apply"],
    };
  }

  messages.push("managed state is consistent");
  return {
    ok: true,
    action: poc04CheckTag,
    dryRun: false,
    changed: false,
    managedFile: plan.managedFile,
    unmanagedFile: plan.unmanagedFile,
    stateFile: plan.stateFile,
    messages,
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

/**
 * Reverts POC-04 managed artifacts using stored state and backups.
 *
 * @param fixturePath - Path to the POC-04 fixture file.
 * @returns Operation result for the revert action.
 * @since 0.0.0
 * @category POC04
 */
export function runPoc04Revert(fixturePath: string): Poc04OperationResult {
  const plan = parsePoc04Fixture(fixturePath);
  const messages = A.empty<string>();
  const state = readPoc04State(plan.stateFile);
  if (!state) {
    return {
      ok: true,
      action: poc04RevertTag,
      dryRun: false,
      changed: false,
      managedFile: plan.managedFile,
      unmanagedFile: plan.unmanagedFile,
      stateFile: plan.stateFile,
      messages: ["no managed state present; revert is idempotent no-op"],
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
    action: poc04RevertTag,
    dryRun: false,
    changed,
    managedFile: plan.managedFile,
    unmanagedFile: plan.unmanagedFile,
    stateFile: plan.stateFile,
    messages,
  };
}

function parseSecretFixture(input: unknown): SecretFixture {
  const fallback: SecretFixture = {
    required: [],
    optional: [],
    optionalPolicy: "warn",
  };
  if (!isRecord(input) || !isRecord(input.secrets)) return fallback;

  const secrets = input.secrets;
  const optionalPolicy = secrets.optional_policy === "warn" ? "warn" : "warn";

  function parseRefs(value: unknown): SecretRef[] {
    if (!A.isArray(value)) return A.empty<SecretRef>();
    const refs = A.empty<SecretRef>();
    for (const entry of value) {
      if (!isRecord(entry)) continue;
      if (!P.isString(entry.id) || Str.length(entry.id) === 0) continue;
      if (!P.isString(entry.ref) || Str.length(entry.ref) === 0) continue;
      refs.push({ id: entry.id, ref: entry.ref });
    }
    return A.sort(
      refs,
      Order.make<SecretRef>((self, that) => byString(self.id, that.id))
    );
  }

  return {
    required: parseRefs(secrets.required),
    optional: parseRefs(secrets.optional),
    optionalPolicy,
  };
}

function resolveSecretRef(ref: string, mode: SecretResolverMode): { ok: boolean; diagnostic?: string } {
  if (mode._tag === "mock") {
    if (Str.includes("DOES_NOT_EXIST")(ref) || Str.includes("/missing/")(ref)) {
      return { ok: false, diagnostic: "E_SECRET_MISSING mock resolver marked ref as missing." };
    }
    return { ok: true };
  }

  const read = spawnSync("op", ["read", ref], {
    encoding: "utf8",
    timeout: 8_000,
  });

  if (read.status === 0) {
    return { ok: true };
  }

  const stderr = Str.toLowerCase(`${read.stderr ?? ""}`);
  if (Str.includes("not signed in")(stderr)) {
    return { ok: false, diagnostic: "E_SECRET_AUTH desktop auth is not signed in." };
  }
  if (Str.includes("service account")(stderr) || Str.includes("token")(stderr)) {
    return { ok: false, diagnostic: "E_SECRET_AUTH service account token is missing or invalid." };
  }
  if (
    Str.includes("isn't an item")(stderr) ||
    Str.includes("not found")(stderr) ||
    Str.includes("does not exist")(stderr)
  ) {
    return { ok: false, diagnostic: "E_SECRET_MISSING secret reference not found." };
  }

  return { ok: false, diagnostic: "E_SECRET_READ_FAILED unable to resolve secret reference." };
}

function detectSecretResolverMode(): SecretResolverMode {
  const forced = process.env.BEEP_SYNC_SECRET_MODE;
  if (forced === "mock") {
    return SecretResolverMode.mock();
  }

  if (P.isString(process.env.OP_SERVICE_ACCOUNT_TOKEN) && Str.length(process.env.OP_SERVICE_ACCOUNT_TOKEN) > 0) {
    return SecretResolverMode.service_account();
  }
  return SecretResolverMode.desktop();
}

function ensureDesktopAuthIfNeeded(mode: SecretResolverMode): string | null {
  if (mode._tag !== "desktop") return null;
  const whoami = spawnSync("op", ["whoami"], {
    encoding: "utf8",
    timeout: 5_000,
  });
  if (whoami.status === 0) return null;
  return "E_SECRET_AUTH desktop auth unavailable (`op whoami` failed).";
}

/**
 * Resolves required and optional secret references for a fixture.
 *
 * @param fixturePath - Path to the fixture file declaring secrets.
 * @returns Resolution status, diagnostics, and redaction metadata.
 * @since 0.0.0
 * @category Secrets
 */
export function resolveSecretsFromFixturePath(fixturePath: string): SecretResolutionResult {
  const fixtureData = readYamlDocument(fixturePath);
  const fixture = parseSecretFixture(fixtureData);
  const source = detectSecretResolverMode();
  const diagnostics = A.empty<string>();

  const desktopAuthError = ensureDesktopAuthIfNeeded(source);
  if (desktopAuthError) {
    diagnostics.push(desktopAuthError);
  }

  const requiredResolved = A.empty<string>();
  const requiredMissing = A.empty<string>();
  const optionalResolved = A.empty<string>();
  const optionalMissing = A.empty<string>();

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
      `W_OPTIONAL_SECRET_MISSING optional missing ids: ${A.join(optionalMissing, ", ")} (policy=${fixture.optionalPolicy}).`
    );
  }

  const uniqueDiagnostics = pipe(diagnostics, A.dedupe, A.sort(byString));

  return {
    ok: requiredMissing.length === 0,
    source: source._tag,
    optionalPolicy: fixture.optionalPolicy,
    required: {
      resolved: A.sort(requiredResolved, byString),
      missing: A.sort(requiredMissing, byString),
    },
    optional: {
      resolved: A.sort(optionalResolved, byString),
      missing: A.sort(optionalMissing, byString),
    },
    diagnostics: uniqueDiagnostics,
    redaction: {
      valuesExposed: false,
    },
  };
}

export type {
  /**
   * Runtime diagnostic entry.
   *
   * @since 0.0.0
   * @category runtime
   */
  RuntimeDiagnostic,
  /**
   * Runtime operation result payload.
   *
   * @since 0.0.0
   * @category runtime
   */
  RuntimeResult,
} from "./runtime.js";

export {
  /**
   * Applies runtime-managed artifacts.
   *
   * @since 0.0.0
   * @category runtime
   */
  runRuntimeApply,
  /**
   * Checks runtime-managed artifacts for drift.
   *
   * @since 0.0.0
   * @category runtime
   */
  runRuntimeCheck,
  /**
   * Runs runtime diagnostics.
   *
   * @since 0.0.0
   * @category runtime
   */
  runRuntimeDoctor,
  /**
   * Reverts runtime-managed artifacts.
   *
   * @since 0.0.0
   * @category runtime
   */
  runRuntimeRevert,
  /**
   * Validates runtime configuration and secrets.
   *
   * @since 0.0.0
   * @category runtime
   */
  runRuntimeValidate,
  /**
   * Current runtime engine version string.
   *
   * @since 0.0.0
   * @category runtime
   */
  runtimeVersion,
} from "./runtime.js";
