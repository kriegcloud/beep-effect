import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { jsonStringifyPretty } from "@beep/repo-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import YAML from "yaml";

/**
 * Current beep-sync runtime implementation version.
 *
 * @since 0.0.0
 * @category Metadata
 */
export const runtimeVersion = "0.1.0";

/**
 * Scaffolding version aligned to the runtime implementation version.
 *
 * @since 0.0.0
 * @category Metadata
 */
export const scaffoldVersion = runtimeVersion;

/**
 * Severity levels used by runtime diagnostics.
 *
 * @since 0.0.0
 * @category Runtime
 */
export type RuntimeSeverity = "error" | "warning" | "info";

/**
 * Tool ownership marker for runtime diagnostics.
 *
 * @since 0.0.0
 * @category Runtime
 */
export type RuntimeTool = "core" | "claude" | "codex" | "cursor" | "windsurf" | "jetbrains";

/**
 * Diagnostic entry emitted by runtime validation and execution flows.
 *
 * @since 0.0.0
 * @category Runtime
 */
export type RuntimeDiagnostic = {
  severity: RuntimeSeverity;
  code: string;
  path: string;
  message: string;
  tool?: RuntimeTool;
};

/**
 * Supported high-level runtime command actions.
 *
 * @since 0.0.0
 * @category Runtime
 */
export type RuntimeAction = "validate" | "apply" | "check" | "doctor" | "revert";

/**
 * Aggregate result returned by runtime command handlers.
 *
 * @since 0.0.0
 * @category Runtime
 */
export type RuntimeResult = {
  action: RuntimeAction;
  ok: boolean;
  changed: boolean;
  dryRun: boolean;
  exitCode: number;
  diagnostics: RuntimeDiagnostic[];
  stats: {
    errorCount: number;
    warningCount: number;
    managedTargetCount?: number;
    staleTargetCount?: number;
    orphanCandidateCount?: number;
    skillTargetCount?: number;
  };
  messages: string[];
};

type RuntimeConfig = {
  version: number;
  project: { name: string };
  settings: {
    ownership: "full_file_rewrite";
    commit_generated: true;
    require_revert_backups: true;
    scope: "project_only";
    platform: "linux";
  };
  instructions: {
    root: string[];
    packages: {
      strategy: "generate_for_all_packages";
      template: string;
    };
    root_template: string;
  };
  commands: Array<{
    id: string;
    run: string;
    cwd?: string;
    description?: string;
  }>;
  hooks: Array<{
    id: string;
    event: string;
    command_id?: string;
    run?: string;
    enabled: boolean;
  }>;
  mcp: {
    secret_provider: {
      type: "onepassword";
      required: boolean;
      optional_policy: "warn";
    };
    servers: Array<{
      id: string;
      transport: "stdio" | "http";
      command?: string;
      args?: string[];
      url?: string;
      env?: Record<string, string>;
      env_headers?: Record<string, string>;
      enabled: boolean;
    }>;
  };
  agents: {
    definitions: Array<{
      id: string;
      prompt_file: string;
      description?: string;
    }>;
  };
  skills: {
    sources: string[];
    include: string[];
  };
  tool_overrides: {
    claude: Record<string, unknown>;
    codex: Record<string, unknown>;
    cursor: Record<string, unknown>;
    windsurf: Record<string, unknown>;
    jetbrains: Record<string, unknown>;
  };
  manifests: {
    managed_files: string;
    state: string;
  };
};

type RuntimeArtifact = {
  path: string;
  format: "markdown" | "json" | "toml";
  content: string;
  contentHash: string;
  sourceHash: string;
  adapter: RuntimeTool;
  adapterVersion: string;
  ownership: "full_file_rewrite";
  freshnessHash?: string;
  backupPath?: string | null;
};

type RuntimePlan = {
  normalizedHash: string;
  sourceHash: string;
  artifacts: RuntimeArtifact[];
  diagnostics: RuntimeDiagnostic[];
  skills: {
    selected: string[];
    copiedFiles: number;
    matrix: Array<{
      runtime: "codex" | "claude";
      targetRoot: string;
      mode: "direct_copy";
    }>;
  };
};

type ManagedFileManifest = {
  version: 1;
  generator: {
    name: "beep-sync";
    version: string;
  };
  files: Array<{
    path: string;
    format: "markdown" | "json" | "toml";
    ownership: "full_file_rewrite";
    managed: true;
    sourceHash: string;
    contentHash: string;
    normalizedHash: string;
    adapter: RuntimeTool;
    adapterVersion: string;
    orphanPolicy: "delete_if_missing_from_plan";
  }>;
};

type StateManifest = {
  version: 1;
  normalizedHash: string;
  targets: Record<
    string,
    {
      adapter: RuntimeTool;
      adapterVersion: string;
      sourceHash: string;
      contentHash: string;
      freshnessHash: string | null;
      managed: true;
      backupPath: string | null;
    }
  >;
  managedPathIndex: string[];
  cleanupInputs: {
    previousManagedPaths: string[];
    currentPlannedPaths: string[];
    orphanCandidates: string[];
  };
};

type ConfigLoadResult = {
  config: O.Option<RuntimeConfig>;
  diagnostics: RuntimeDiagnostic[];
  sourceHash: string;
};

const byString = Order.String;

const diagnosticOrder = Order.make<RuntimeDiagnostic>((self, that) => {
  const byPath = byString(self.path, that.path);
  if (byPath !== 0) {
    return byPath;
  }
  return byString(self.code, that.code);
});

const artifactOrder = Order.make<RuntimeArtifact>((self, that) => byString(self.path, that.path));

function isRecord(value: unknown): value is Record<string, unknown> {
  return P.isObject(value);
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
      A.sort(R.keys(value), byString),
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

function normalizePathToPosix(value: string): string {
  return Str.replace(/\\/g, "/")(value);
}

function isRelativePosixPath(value: string): boolean {
  if (!P.isString(value) || Str.length(value) === 0) {
    return false;
  }
  if (Str.startsWith("/")(value)) {
    return false;
  }
  if (Str.includes("\\")(value)) {
    return false;
  }
  const segments = Str.split("/")(value);
  if (A.some(segments, (segment) => segment === "..")) {
    return false;
  }
  return true;
}

function resolveRepoPath(repoRoot: string, relativePath: string): O.Option<string> {
  if (!isRelativePosixPath(relativePath)) {
    return O.none();
  }
  const resolved = resolve(repoRoot, relativePath);
  const rel = normalizePathToPosix(relative(repoRoot, resolved));
  if (rel === "" || rel === ".") {
    return O.some(resolved);
  }
  if (Str.startsWith("../")(rel) || rel === "..") {
    return O.none();
  }
  return O.some(resolved);
}

function readText(pathValue: string): string {
  return readFileSync(pathValue, "utf8");
}

function readYaml(pathValue: string): unknown {
  return YAML.parse(readText(pathValue));
}

function readJsonOrNull(pathValue: string): unknown {
  if (!existsSync(pathValue)) {
    return null;
  }
  return Effect.runSync(
    Effect.try({
      try: () => JSON.parse(readText(pathValue)),
      catch: () => null,
    })
  );
}

function ensureParent(pathValue: string): void {
  mkdirSync(dirname(pathValue), { recursive: true });
}

function atomicWrite(pathValue: string, content: string): void {
  ensureParent(pathValue);
  const tempPath = `${pathValue}.tmp-${process.pid}`;
  writeFileSync(tempPath, content, "utf8");

  const tempFd = openSync(tempPath, "r");
  try {
    fsyncSync(tempFd);
  } finally {
    closeSync(tempFd);
  }

  renameSync(tempPath, pathValue);
}

function readIfExists(pathValue: string): string | null {
  if (!existsSync(pathValue)) {
    return null;
  }
  return readFileSync(pathValue, "utf8");
}

function removeIfExists(pathValue: string): void {
  if (!existsSync(pathValue)) {
    return;
  }
  rmSync(pathValue, { force: true, recursive: false });
}

function removeDirectoryIfEmpty(pathValue: string): void {
  if (!existsSync(pathValue)) {
    return;
  }
  const stat = statSync(pathValue);
  if (!stat.isDirectory()) {
    return;
  }
  const entries = readdirSync(pathValue);
  if (A.length(entries) === 0) {
    try {
      rmdirSync(pathValue);
    } catch {
      return;
    }
  }
}

function sortedUniqueStrings(input: unknown): string[] {
  if (!A.isArray(input)) {
    return [];
  }
  return pipe(input, A.filter(P.isString), A.dedupe, A.sort(byString));
}

function addDiagnostic(
  diagnostics: RuntimeDiagnostic[],
  severity: RuntimeSeverity,
  code: string,
  pathValue: string,
  message: string,
  tool?: RuntimeTool
): void {
  if (tool) {
    diagnostics.push({ severity, code, path: pathValue, message, tool });
    return;
  }
  diagnostics.push({ severity, code, path: pathValue, message });
}

function validateAllowedTopLevel(
  config: Record<string, unknown>,
  diagnostics: RuntimeDiagnostic[],
  pathValue: string
): void {
  const allowed = [
    "version",
    "project",
    "settings",
    "instructions",
    "commands",
    "hooks",
    "mcp",
    "agents",
    "skills",
    "tool_overrides",
    "manifests",
  ];
  const allowedSet = new Set(allowed);
  for (const key of A.sort(R.keys(config), byString)) {
    if (!allowedSet.has(key)) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_UNKNOWN_FIELD", `${pathValue}.${key}`, "Unknown top-level key.");
    }
  }
}

function parseStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }
  const out = R.empty<string, string>();
  for (const key of A.sort(R.keys(value), byString)) {
    const raw = value[key];
    if (P.isString(raw)) {
      out[key] = raw;
    }
  }
  return out;
}

function parseRuntimeConfig(repoRoot: string, input: unknown): ConfigLoadResult {
  const diagnostics = A.empty<RuntimeDiagnostic>();

  if (!isRecord(input)) {
    addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", "$", "Config root must be an object.");
    return {
      config: O.none(),
      diagnostics: A.sort(diagnostics, diagnosticOrder),
      sourceHash: sha256(stableJson({})),
    };
  }

  validateAllowedTopLevel(input, diagnostics, "$");

  const versionRaw = input.version;
  const version = P.isNumber(versionRaw) ? versionRaw : Number.NaN;
  if (!Number.isInteger(version) || version !== 1) {
    addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", "version", "version must equal 1.");
  }

  const project = isRecord(input.project) ? input.project : {};
  const projectName = P.isString(project.name) && Str.length(project.name) > 0 ? project.name : "beep-effect3";
  if (!P.isString(project.name) || Str.length(project.name) === 0) {
    addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", "project.name", "project.name is required.");
  }

  const settingsRaw = isRecord(input.settings) ? input.settings : {};
  const ownership = settingsRaw.ownership === "full_file_rewrite" ? "full_file_rewrite" : "full_file_rewrite";
  if (settingsRaw.ownership !== "full_file_rewrite") {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "settings.ownership",
      "settings.ownership must be full_file_rewrite."
    );
  }
  const commitGenerated = true;
  if (settingsRaw.commit_generated !== true) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "settings.commit_generated",
      "settings.commit_generated must be true."
    );
  }
  const requireRevertBackups = true;
  if (settingsRaw.require_revert_backups !== true) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "settings.require_revert_backups",
      "settings.require_revert_backups must be true."
    );
  }
  const scope =
    settingsRaw.scope === "project_only" || P.isUndefined(settingsRaw.scope) ? "project_only" : "project_only";
  if (!P.isUndefined(settingsRaw.scope) && settingsRaw.scope !== "project_only") {
    addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", "settings.scope", "settings.scope must be project_only.");
  }
  const platform = settingsRaw.platform === "linux" || P.isUndefined(settingsRaw.platform) ? "linux" : "linux";
  if (!P.isUndefined(settingsRaw.platform) && settingsRaw.platform !== "linux") {
    addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", "settings.platform", "settings.platform must be linux.");
  }

  const instructionsRaw = isRecord(input.instructions) ? input.instructions : {};
  const rootPaths = sortedUniqueStrings(instructionsRaw.root);
  if (!A.isArray(instructionsRaw.root) || A.isArrayEmpty(rootPaths)) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "instructions.root",
      "instructions.root must be a non-empty string array."
    );
  }

  const packagesRaw = isRecord(instructionsRaw.packages) ? instructionsRaw.packages : {};
  const packageStrategy =
    packagesRaw.strategy === "generate_for_all_packages" ? "generate_for_all_packages" : "generate_for_all_packages";
  if (packagesRaw.strategy !== "generate_for_all_packages") {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "instructions.packages.strategy",
      "instructions.packages.strategy must be generate_for_all_packages."
    );
  }
  const packageTemplate =
    P.isString(packagesRaw.template) && Str.length(packagesRaw.template) > 0
      ? packagesRaw.template
      : ".beep/templates/AGENTS.package.md.hbs";
  if (!P.isString(packagesRaw.template) || Str.length(packagesRaw.template) === 0) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "instructions.packages.template",
      "instructions.packages.template is required."
    );
  }
  const rootTemplate =
    P.isString(instructionsRaw.root_template) && Str.length(instructionsRaw.root_template) > 0
      ? instructionsRaw.root_template
      : ".beep/templates/AGENTS.root.md.hbs";

  const instructionPaths = [...rootPaths, packageTemplate, rootTemplate];
  for (const pathValue of instructionPaths) {
    if (!isRelativePosixPath(pathValue)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_NORMALIZE_PATH_ESCAPE",
        `instructions.path:${pathValue}`,
        "Instruction/template paths must be relative POSIX paths."
      );
      continue;
    }
    const resolved = resolveRepoPath(repoRoot, pathValue);
    if (O.isNone(resolved)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_NORMALIZE_PATH_ESCAPE",
        `instructions.path:${pathValue}`,
        "Instruction/template path escapes repository root."
      );
      continue;
    }
    if (!existsSync(resolved.value)) {
      addDiagnostic(diagnostics, "error", "E_IO_READ", pathValue, "Referenced instruction/template file is missing.");
    }
  }

  const commandsRaw = A.isArray(input.commands) ? input.commands : A.empty<unknown>();
  const commands = A.empty<RuntimeConfig["commands"][number]>();
  const commandIds = new Set<string>();
  for (let index = 0; index < commandsRaw.length; index++) {
    const item = commandsRaw[index];
    if (!isRecord(item)) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `commands[${index}]`, "command must be object.");
      continue;
    }
    if (!P.isString(item.id) || Str.length(item.id) === 0) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `commands[${index}].id`, "id is required.");
      continue;
    }
    if (!P.isString(item.run) || Str.length(item.run) === 0) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `commands[${index}].run`, "run is required.");
      continue;
    }
    if (commandIds.has(item.id)) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_DUPLICATE_ID", `commands[${index}].id`, "duplicate command id.");
      continue;
    }
    commandIds.add(item.id);
    const command: RuntimeConfig["commands"][number] = { id: item.id, run: item.run };
    if (P.isString(item.cwd)) {
      command.cwd = item.cwd;
    }
    if (P.isString(item.description)) {
      command.description = item.description;
    }
    commands.push(command);
  }

  const hooksRaw = A.isArray(input.hooks) ? input.hooks : A.empty<unknown>();
  const hooks = A.empty<RuntimeConfig["hooks"][number]>();
  for (let index = 0; index < hooksRaw.length; index++) {
    const item = hooksRaw[index];
    if (!isRecord(item)) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `hooks[${index}]`, "hook must be object.");
      continue;
    }
    if (!P.isString(item.id) || Str.length(item.id) === 0) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `hooks[${index}].id`, "id is required.");
      continue;
    }
    if (!P.isString(item.event) || Str.length(item.event) === 0) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `hooks[${index}].event`, "event is required.");
      continue;
    }
    const hasCommandId = P.isString(item.command_id) && Str.length(item.command_id) > 0;
    const hasRun = P.isString(item.run) && Str.length(item.run) > 0;
    if (hasCommandId && hasRun) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SCHEMA_TYPE",
        `hooks[${index}]`,
        "hook cannot include both command_id and run."
      );
      continue;
    }
    if (!hasCommandId && !hasRun) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `hooks[${index}]`, "hook must include command_id or run.");
      continue;
    }
    const hook: RuntimeConfig["hooks"][number] = {
      id: item.id,
      event: item.event,
      enabled: item.enabled !== false,
    };
    if (hasCommandId && P.isString(item.command_id)) {
      hook.command_id = item.command_id;
    }
    if (hasRun && P.isString(item.run)) {
      hook.run = item.run;
    }
    hooks.push(hook);
  }

  const mcpRaw = isRecord(input.mcp) ? input.mcp : {};
  const secretProviderRaw = isRecord(mcpRaw.secret_provider) ? mcpRaw.secret_provider : {};
  if (secretProviderRaw.type !== "onepassword") {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "mcp.secret_provider.type",
      "mcp.secret_provider.type must be onepassword."
    );
  }
  const secretProviderRequired = secretProviderRaw.required === true;
  if (!P.isBoolean(secretProviderRaw.required)) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "mcp.secret_provider.required",
      "mcp.secret_provider.required must be boolean."
    );
  }
  const optionalPolicy =
    secretProviderRaw.optional_policy === "warn" || P.isUndefined(secretProviderRaw.optional_policy) ? "warn" : "warn";

  const serversRaw = A.isArray(mcpRaw.servers) ? mcpRaw.servers : A.empty<unknown>();
  const servers = A.empty<RuntimeConfig["mcp"]["servers"][number]>();
  const serverIds = new Set<string>();
  for (let index = 0; index < serversRaw.length; index++) {
    const serverRaw = serversRaw[index];
    if (!isRecord(serverRaw)) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `mcp.servers[${index}]`, "MCP server must be object.");
      continue;
    }
    if (!P.isString(serverRaw.id) || Str.length(serverRaw.id) === 0) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `mcp.servers[${index}].id`, "id is required.");
      continue;
    }
    if (serverIds.has(serverRaw.id)) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_DUPLICATE_ID", `mcp.servers[${index}].id`, "duplicate server id.");
      continue;
    }
    serverIds.add(serverRaw.id);
    const transport = serverRaw.transport === "http" ? "http" : serverRaw.transport === "stdio" ? "stdio" : null;
    if (transport === null) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SCHEMA_TYPE",
        `mcp.servers[${index}].transport`,
        "transport must be stdio or http."
      );
      continue;
    }

    const server: RuntimeConfig["mcp"]["servers"][number] = {
      id: serverRaw.id,
      transport,
      enabled: serverRaw.enabled !== false,
    };

    if (transport === "stdio") {
      if (!P.isString(serverRaw.command) || Str.length(serverRaw.command) === 0) {
        addDiagnostic(
          diagnostics,
          "error",
          "E_ADAPTER_REQUIRED_FIELD_MISSING",
          `mcp.servers[${index}].command`,
          "command is required for stdio transport.",
          "core"
        );
      } else {
        server.command = serverRaw.command;
      }
      if (A.isArray(serverRaw.args)) {
        server.args = pipe(serverRaw.args, A.filter(P.isString));
      }
    } else {
      if (!P.isString(serverRaw.url) || Str.length(serverRaw.url) === 0) {
        addDiagnostic(
          diagnostics,
          "error",
          "E_ADAPTER_REQUIRED_FIELD_MISSING",
          `mcp.servers[${index}].url`,
          "url is required for http transport.",
          "core"
        );
      } else {
        server.url = serverRaw.url;
      }
    }

    const env = parseStringRecord(serverRaw.env);
    if (!R.isEmptyRecord(env)) {
      server.env = env;
    }
    const headers = parseStringRecord(serverRaw.env_headers);
    if (!R.isEmptyRecord(headers)) {
      server.env_headers = headers;
    }
    servers.push(server);
  }

  const agentsRaw = isRecord(input.agents) ? input.agents : {};
  const definitionsRaw = A.isArray(agentsRaw.definitions) ? agentsRaw.definitions : A.empty<unknown>();
  const definitions = A.empty<RuntimeConfig["agents"]["definitions"][number]>();
  const agentIds = new Set<string>();
  for (let index = 0; index < definitionsRaw.length; index++) {
    const item = definitionsRaw[index];
    if (!isRecord(item)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SCHEMA_TYPE",
        `agents.definitions[${index}]`,
        "definition must be object."
      );
      continue;
    }
    if (!P.isString(item.id) || Str.length(item.id) === 0) {
      addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", `agents.definitions[${index}].id`, "id is required.");
      continue;
    }
    if (agentIds.has(item.id)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SCHEMA_DUPLICATE_ID",
        `agents.definitions[${index}].id`,
        "duplicate agent id."
      );
      continue;
    }
    agentIds.add(item.id);
    if (!P.isString(item.prompt_file) || Str.length(item.prompt_file) === 0) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SCHEMA_TYPE",
        `agents.definitions[${index}].prompt_file`,
        "prompt_file is required."
      );
      continue;
    }
    if (!isRelativePosixPath(item.prompt_file)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_NORMALIZE_PATH_ESCAPE",
        `agents.definitions[${index}].prompt_file`,
        "prompt_file must be relative POSIX path."
      );
      continue;
    }
    const resolvedPrompt = resolveRepoPath(repoRoot, item.prompt_file);
    if (O.isNone(resolvedPrompt) || !existsSync(resolvedPrompt.value)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_IO_READ",
        `agents.definitions[${index}].prompt_file`,
        "prompt_file does not exist."
      );
      continue;
    }

    const definition: RuntimeConfig["agents"]["definitions"][number] = {
      id: item.id,
      prompt_file: item.prompt_file,
    };
    if (P.isString(item.description)) {
      definition.description = item.description;
    }
    definitions.push(definition);
  }

  const skillsRaw = isRecord(input.skills) ? input.skills : {};
  const skillSources = sortedUniqueStrings(skillsRaw.sources);
  const skillInclude = sortedUniqueStrings(skillsRaw.include);
  if (A.isArrayEmpty(skillSources)) {
    addDiagnostic(diagnostics, "error", "E_SCHEMA_TYPE", "skills.sources", "skills.sources must be a non-empty array.");
  }
  for (const source of skillSources) {
    if (!isRelativePosixPath(source)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_NORMALIZE_PATH_ESCAPE",
        `skills.sources:${source}`,
        "Invalid skills source path."
      );
      continue;
    }
    const resolvedSource = resolveRepoPath(repoRoot, source);
    if (O.isNone(resolvedSource)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_NORMALIZE_PATH_ESCAPE",
        `skills.sources:${source}`,
        "Skill source path escapes repo root."
      );
      continue;
    }
    if (!existsSync(resolvedSource.value)) {
      addDiagnostic(diagnostics, "error", "E_IO_READ", `skills.sources:${source}`, "Skill source path does not exist.");
    }
  }

  const toolOverridesRaw = isRecord(input.tool_overrides) ? input.tool_overrides : {};
  const toolOverrides = {
    claude: isRecord(toolOverridesRaw.claude) ? toolOverridesRaw.claude : {},
    codex: isRecord(toolOverridesRaw.codex) ? toolOverridesRaw.codex : {},
    cursor: isRecord(toolOverridesRaw.cursor) ? toolOverridesRaw.cursor : {},
    windsurf: isRecord(toolOverridesRaw.windsurf) ? toolOverridesRaw.windsurf : {},
    jetbrains: isRecord(toolOverridesRaw.jetbrains) ? toolOverridesRaw.jetbrains : {},
  };
  if (
    !isRecord(toolOverridesRaw.claude) ||
    !isRecord(toolOverridesRaw.codex) ||
    !isRecord(toolOverridesRaw.cursor) ||
    !isRecord(toolOverridesRaw.windsurf) ||
    !isRecord(toolOverridesRaw.jetbrains)
  ) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_SCHEMA_TYPE",
      "tool_overrides",
      "tool_overrides must include claude/codex/cursor/windsurf/jetbrains objects."
    );
  }

  const manifestsRaw = isRecord(input.manifests) ? input.manifests : {};
  const managedManifestPath =
    P.isString(manifestsRaw.managed_files) && Str.length(manifestsRaw.managed_files) > 0
      ? manifestsRaw.managed_files
      : ".beep/manifests/managed-files.json";
  const statePath =
    P.isString(manifestsRaw.state) && Str.length(manifestsRaw.state) > 0
      ? manifestsRaw.state
      : ".beep/manifests/state.json";
  for (const pathValue of A.make(managedManifestPath, statePath)) {
    if (!isRelativePosixPath(pathValue)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_NORMALIZE_PATH_ESCAPE",
        `manifests:${pathValue}`,
        "Manifest path must be relative POSIX path."
      );
    }
  }

  const normalizedConfig: RuntimeConfig = {
    version: 1,
    project: {
      name: projectName,
    },
    settings: {
      ownership,
      commit_generated: commitGenerated,
      require_revert_backups: requireRevertBackups,
      scope,
      platform,
    },
    instructions: {
      root: A.sort(rootPaths, byString),
      packages: {
        strategy: packageStrategy,
        template: packageTemplate,
      },
      root_template: rootTemplate,
    },
    commands: A.sort(
      commands,
      Order.make<RuntimeConfig["commands"][number]>((self, that) => byString(self.id, that.id))
    ),
    hooks: A.sort(
      hooks,
      Order.make<RuntimeConfig["hooks"][number]>((self, that) => byString(self.id, that.id))
    ),
    mcp: {
      secret_provider: {
        type: "onepassword",
        required: secretProviderRequired,
        optional_policy: optionalPolicy,
      },
      servers: A.sort(
        servers,
        Order.make<RuntimeConfig["mcp"]["servers"][number]>((self, that) => byString(self.id, that.id))
      ),
    },
    agents: {
      definitions: A.sort(
        definitions,
        Order.make<RuntimeConfig["agents"]["definitions"][number]>((self, that) => byString(self.id, that.id))
      ),
    },
    skills: {
      sources: A.sort(skillSources, byString),
      include: A.sort(skillInclude, byString),
    },
    tool_overrides: toolOverrides,
    manifests: {
      managed_files: managedManifestPath,
      state: statePath,
    },
  };

  const sourceHash = sha256(stableJson(normalizedConfig));
  const hasError = A.some(diagnostics, (diag) => diag.severity === "error");
  return {
    config: hasError ? O.none() : O.some(normalizedConfig),
    diagnostics: A.sort(diagnostics, diagnosticOrder),
    sourceHash,
  };
}

function readRuntimeConfig(repoRoot: string): ConfigLoadResult {
  const configPath = resolve(repoRoot, ".beep/config.yaml");
  if (!existsSync(configPath)) {
    return {
      config: O.none(),
      diagnostics: [
        {
          severity: "error",
          code: "E_IO_READ",
          path: ".beep/config.yaml",
          message: "Canonical config file is missing.",
          tool: "core",
        },
      ],
      sourceHash: sha256(stableJson({})),
    };
  }

  return Effect.runSync(
    Effect.try({
      try: () => readYaml(configPath),
      catch: (error) =>
        P.isError(error)
          ? ({
              config: O.none<RuntimeConfig>(),
              diagnostics: [
                {
                  severity: "error",
                  code: "E_YAML_PARSE",
                  path: ".beep/config.yaml",
                  message: error.message,
                  tool: "core",
                },
              ],
              sourceHash: sha256(stableJson({})),
            } satisfies ConfigLoadResult)
          : ({
              config: O.none<RuntimeConfig>(),
              diagnostics: [
                {
                  severity: "error",
                  code: "E_YAML_PARSE",
                  path: ".beep/config.yaml",
                  message: String(error),
                  tool: "core",
                },
              ],
              sourceHash: sha256(stableJson({})),
            } satisfies ConfigLoadResult),
    }).pipe(
      Effect.match({
        onSuccess: (yaml) => parseRuntimeConfig(repoRoot, yaml),
        onFailure: (fallback) => fallback,
      })
    )
  );
}

function readWorkspacePatterns(repoRoot: string): string[] {
  const packageJsonPath = resolve(repoRoot, "package.json");
  if (!existsSync(packageJsonPath)) {
    return [];
  }
  const parsed = readJsonOrNull(packageJsonPath);
  if (!isRecord(parsed) || !A.isArray(parsed.workspaces)) {
    return [];
  }
  return pipe(parsed.workspaces, A.filter(P.isString), A.dedupe, A.sort(byString));
}

function listSubdirectories(pathValue: string): string[] {
  if (!existsSync(pathValue)) {
    return [];
  }
  return pipe(
    readdirSync(pathValue, { withFileTypes: true }),
    A.filter((entry) => entry.isDirectory()),
    A.map((entry) => resolve(pathValue, entry.name)),
    A.sort(byString)
  );
}

function discoverWorkspacePackages(repoRoot: string): Array<{ name: string; path: string }> {
  const patterns = readWorkspacePatterns(repoRoot);
  const candidates = A.empty<string>();

  for (const pattern of patterns) {
    if (Str.endsWith("/*/*")(pattern)) {
      const base = Str.slice(0, pattern.length - 4)(pattern);
      const baseAbs = resolve(repoRoot, base);
      for (const levelOne of listSubdirectories(baseAbs)) {
        for (const levelTwo of listSubdirectories(levelOne)) {
          candidates.push(levelTwo);
        }
      }
      continue;
    }
    if (Str.endsWith("/*")(pattern)) {
      const base = Str.slice(0, pattern.length - 2)(pattern);
      const baseAbs = resolve(repoRoot, base);
      for (const dir of listSubdirectories(baseAbs)) {
        candidates.push(dir);
      }
      continue;
    }

    candidates.push(resolve(repoRoot, pattern));
  }

  const dedupedSorted = pipe(
    candidates,
    A.map((pathValue) => resolve(pathValue)),
    A.dedupe,
    A.sort(byString)
  );
  const packages = A.empty<{ name: string; path: string }>();

  for (const absPath of dedupedSorted) {
    const packageJsonPath = resolve(absPath, "package.json");
    if (!existsSync(packageJsonPath)) {
      continue;
    }
    const parsed = readJsonOrNull(packageJsonPath);
    const packageName =
      isRecord(parsed) && P.isString(parsed.name) && Str.length(parsed.name) > 0
        ? parsed.name
        : normalizePathToPosix(relative(repoRoot, absPath));
    packages.push({
      name: packageName,
      path: normalizePathToPosix(relative(repoRoot, absPath)),
    });
  }

  return A.sort(
    packages,
    Order.make<{ name: string; path: string }>((self, that) => byString(self.path, that.path))
  );
}

function readInstructionBundle(repoRoot: string, config: RuntimeConfig): { merged: string; mergedHash: string } {
  const contents = A.empty<string>();
  for (const relativePath of config.instructions.root) {
    const resolved = resolve(repoRoot, relativePath);
    contents.push(readText(resolved).trimEnd());
  }
  const merged = `${A.join(contents, "\n\n")}\n`;
  return {
    merged,
    mergedHash: sha256(merged),
  };
}

function renderTemplate(templateContent: string, variables: Record<string, string>): string {
  let rendered = templateContent;
  for (const key of A.sort(R.keys(variables), byString)) {
    rendered = Str.replaceAll(`{{${key}}}`, variables[key])(rendered);
  }
  for (const key of A.sort(R.keys(variables), byString)) {
    rendered = Str.replaceAll(`{{ ${key} }}`, variables[key])(rendered);
  }
  return rendered;
}

function generatedHeader(format: "markdown" | "toml", adapter: RuntimeTool): string {
  if (format === "toml") {
    return `# GENERATED BY beep-sync ${runtimeVersion}; source=.beep/config.yaml; adapter=${adapter}; ownership=full_file_rewrite\n`;
  }
  return `<!-- GENERATED BY beep-sync ${runtimeVersion}; source=.beep/config.yaml; adapter=${adapter}; ownership=full_file_rewrite -->\n\n`;
}

function renderCommandsSection(commands: RuntimeConfig["commands"]): string {
  if (A.isArrayEmpty(commands)) {
    return "## Commands\n\n- (none)\n";
  }
  const lines = A.empty<string>();
  lines.push("## Commands");
  lines.push("");
  for (const command of commands) {
    const detail =
      command.cwd && Str.length(command.cwd) > 0
        ? `\`${command.id}\` -> \`${command.run}\` (cwd: \`${command.cwd}\`)`
        : `\`${command.id}\` -> \`${command.run}\``;
    lines.push(`- ${detail}`);
  }
  lines.push("");
  return `${A.join(lines, "\n")}\n`;
}

function renderHooksSection(hooks: RuntimeConfig["hooks"]): string {
  if (A.isArrayEmpty(hooks)) {
    return "## Hooks\n\n- (none)\n";
  }
  const lines = A.empty<string>();
  lines.push("## Hooks");
  lines.push("");
  for (const hook of hooks) {
    const runTarget = hook.command_id ? `command:${hook.command_id}` : hook.run ? `run:${hook.run}` : "(invalid)";
    lines.push(`- \`${hook.id}\` event=\`${hook.event}\` ${runTarget} enabled=${hook.enabled ? "true" : "false"}`);
  }
  lines.push("");
  return `${A.join(lines, "\n")}\n`;
}

function renderAgentsSection(agents: RuntimeConfig["agents"]["definitions"]): string {
  if (A.isArrayEmpty(agents)) {
    return "## Agents\n\n- (none)\n";
  }
  const lines = A.empty<string>();
  lines.push("## Agents");
  lines.push("");
  for (const agent of agents) {
    const description = agent.description ? ` - ${agent.description}` : "";
    lines.push(`- \`${agent.id}\` -> \`${agent.prompt_file}\`${description}`);
  }
  lines.push("");
  return `${A.join(lines, "\n")}\n`;
}

function renderSkillsSection(skillNames: string[], skillTargetRoot: string): string {
  const lines = A.empty<string>();
  lines.push("## Skills");
  lines.push("");
  if (A.isArrayEmpty(skillNames)) {
    lines.push("- (none)");
  } else {
    for (const name of skillNames) {
      lines.push(`- \`${name}\` -> \`${skillTargetRoot}/${name}/SKILL.md\``);
    }
  }
  lines.push("");
  return `${A.join(lines, "\n")}\n`;
}

function buildCodexTomlFromServers(servers: RuntimeConfig["mcp"]["servers"]): string {
  const lines = A.empty<string>();
  const enabledServers = A.filter(servers, (server) => server.enabled);
  for (const server of enabledServers) {
    lines.push(`[mcp_servers.${server.id}]`);
    lines.push(`transport = ${JSON.stringify(server.transport)}`);
    if (server.command) {
      lines.push(`command = ${JSON.stringify(server.command)}`);
    }
    if (server.args && !A.isArrayEmpty(server.args)) {
      lines.push(
        `args = [${pipe(
          server.args,
          A.map((arg) => JSON.stringify(arg)),
          A.join(", ")
        )}]`
      );
    }
    if (server.url) {
      lines.push(`url = ${JSON.stringify(server.url)}`);
    }
    if (server.env && !R.isEmptyRecord(server.env)) {
      const values = pipe(
        A.sort(R.keys(server.env), byString),
        A.map((key) => `${key} = ${JSON.stringify(server.env?.[key] ?? "")}`),
        A.join(", ")
      );
      lines.push(`env = { ${values} }`);
    }
    if (server.env_headers && !R.isEmptyRecord(server.env_headers)) {
      const values = pipe(
        A.sort(R.keys(server.env_headers), byString),
        A.map((key) => `${key} = ${JSON.stringify(server.env_headers?.[key] ?? "")}`),
        A.join(", ")
      );
      lines.push(`env_headers = { ${values} }`);
    }
    lines.push("");
  }
  const body = Str.trimEnd(A.join(lines, "\n"));
  return `${generatedHeader("toml", "codex")}${body}\n`;
}

function buildClaudeMcpJsonFromServers(servers: RuntimeConfig["mcp"]["servers"]): string {
  const mapped = R.empty<string, Record<string, unknown>>();
  const enabledServers = A.filter(servers, (server) => server.enabled);
  for (const server of enabledServers) {
    const out: Record<string, unknown> = {
      transport: server.transport,
    };
    if (server.command) {
      out.command = server.command;
    }
    if (server.args && !A.isArrayEmpty(server.args)) {
      out.args = server.args;
    }
    if (server.url) {
      out.url = server.url;
    }
    if (server.env && !R.isEmptyRecord(server.env)) {
      out.env = server.env;
    }
    if (server.env_headers && !R.isEmptyRecord(server.env_headers)) {
      out.env_headers = server.env_headers;
    }
    mapped[server.id] = out;
  }
  return stableJson({
    mcpServers: mapped,
  });
}

function toForwardSlashPath(pathValue: string): string {
  return normalizePathToPosix(pathValue).split(sep).join("/");
}

function walkFiles(pathValue: string): string[] {
  const stat = statSync(pathValue);
  if (stat.isFile()) {
    return [pathValue];
  }
  const out = A.empty<string>();
  const entries = readdirSync(pathValue, { withFileTypes: true });
  for (const entry of entries) {
    const next = resolve(pathValue, entry.name);
    if (entry.isDirectory()) {
      for (const child of walkFiles(next)) {
        out.push(child);
      }
    } else if (entry.isFile()) {
      out.push(next);
    }
  }
  return A.sort(out, byString);
}

function discoverSkills(
  repoRoot: string,
  config: RuntimeConfig,
  diagnostics: RuntimeDiagnostic[]
): Array<{
  name: string;
  sourceRoot: string;
  sourcePath: string;
  files: string[];
}> {
  const discovered = A.empty<{
    name: string;
    sourceRoot: string;
    sourcePath: string;
    files: string[];
  }>();

  for (const source of config.skills.sources) {
    const sourceAbsolute = resolve(repoRoot, source);
    if (!existsSync(sourceAbsolute)) {
      continue;
    }
    for (const entry of readdirSync(sourceAbsolute, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const skillName = entry.name;
      const skillPath = resolve(sourceAbsolute, skillName);
      const markerFile = resolve(skillPath, "SKILL.md");
      if (!existsSync(markerFile)) {
        continue;
      }
      const shouldInclude =
        A.isArrayEmpty(config.skills.include) || A.some(config.skills.include, (included) => included === skillName);
      if (!shouldInclude) {
        continue;
      }
      discovered.push({
        name: skillName,
        sourceRoot: source,
        sourcePath: skillPath,
        files: walkFiles(skillPath),
      });
    }
  }

  const sorted = A.sort(
    discovered,
    Order.make<{ name: string; sourceRoot: string; sourcePath: string; files: string[] }>((self, that) =>
      byString(self.name, that.name)
    )
  );
  for (const includeName of config.skills.include) {
    if (!A.some(sorted, (skill) => skill.name === includeName)) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_IO_READ",
        `skills.include:${includeName}`,
        "Included skill is not discoverable from skills.sources.",
        "core"
      );
    }
  }
  return sorted;
}

function buildPlan(repoRoot: string, config: RuntimeConfig, sourceHash: string): RuntimePlan {
  const diagnostics = A.empty<RuntimeDiagnostic>();
  const artifacts = A.empty<RuntimeArtifact>();
  const workspacePackages = discoverWorkspacePackages(repoRoot);

  const instructions = readInstructionBundle(repoRoot, config);
  const rootTemplate = readText(resolve(repoRoot, config.instructions.root_template));
  const packageTemplate = readText(resolve(repoRoot, config.instructions.packages.template));
  const discoveredSkills = discoverSkills(repoRoot, config, diagnostics);
  const skillNames = A.map(discoveredSkills, (skill) => skill.name);

  const rootBody = renderTemplate(rootTemplate, {
    root_instructions: Str.trimEnd(instructions.merged),
  }).trimEnd();
  const sharedSections =
    `${renderCommandsSection(config.commands)}${renderHooksSection(config.hooks)}${renderAgentsSection(config.agents.definitions)}${renderSkillsSection(skillNames, ".agents/skills")}`.trimEnd();

  const rootAgentsContent = `${generatedHeader("markdown", "core")}${rootBody}\n\n${sharedSections}\n`;
  const rootFreshnessHash = sha256(
    `${instructions.mergedHash}:${sha256(rootTemplate)}:AGENTS.md:${runtimeVersion}:core`
  );
  artifacts.push({
    path: "AGENTS.md",
    format: "markdown",
    content: rootAgentsContent,
    contentHash: sha256(rootAgentsContent),
    sourceHash,
    adapter: "core",
    adapterVersion: runtimeVersion,
    ownership: "full_file_rewrite",
    freshnessHash: rootFreshnessHash,
  });

  const claudeContent = `${generatedHeader("markdown", "claude")}${rootBody}\n\n${sharedSections}\n`;
  const claudeFreshnessHash = sha256(
    `${instructions.mergedHash}:${sha256(rootTemplate)}:CLAUDE.md:${runtimeVersion}:claude`
  );
  artifacts.push({
    path: "CLAUDE.md",
    format: "markdown",
    content: claudeContent,
    contentHash: sha256(claudeContent),
    sourceHash,
    adapter: "claude",
    adapterVersion: runtimeVersion,
    ownership: "full_file_rewrite",
    freshnessHash: claudeFreshnessHash,
  });

  for (const pkg of workspacePackages) {
    const packageOverrides = `## Package Context\n\n- Package name: ${pkg.name}\n- Package path: ${pkg.path}\n`;
    const rendered = renderTemplate(packageTemplate, {
      root_instructions: Str.trimEnd(instructions.merged),
      package_overrides: packageOverrides.trimEnd(),
    }).trimEnd();
    const content = `${generatedHeader("markdown", "core")}${rendered}\n`;
    const targetPath = `${pkg.path}/AGENTS.md`;
    const freshnessHash = sha256(
      `${instructions.mergedHash}:${sha256(packageTemplate)}:${targetPath}:${runtimeVersion}:core`
    );
    artifacts.push({
      path: targetPath,
      format: "markdown",
      content,
      contentHash: sha256(content),
      sourceHash,
      adapter: "core",
      adapterVersion: runtimeVersion,
      ownership: "full_file_rewrite",
      freshnessHash,
    });
  }

  const codexToml = buildCodexTomlFromServers(config.mcp.servers);
  artifacts.push({
    path: ".codex/config.toml",
    format: "toml",
    content: codexToml,
    contentHash: sha256(codexToml),
    sourceHash,
    adapter: "codex",
    adapterVersion: runtimeVersion,
    ownership: "full_file_rewrite",
  });

  const claudeMcp = buildClaudeMcpJsonFromServers(config.mcp.servers);
  artifacts.push({
    path: ".mcp.json",
    format: "json",
    content: claudeMcp,
    contentHash: sha256(claudeMcp),
    sourceHash,
    adapter: "claude",
    adapterVersion: runtimeVersion,
    ownership: "full_file_rewrite",
  });

  for (const skill of discoveredSkills) {
    for (const filePath of skill.files) {
      const relativeWithinSkill = toForwardSlashPath(relative(skill.sourcePath, filePath));
      const targetPath = `.agents/skills/${skill.name}/${relativeWithinSkill}`;
      const content = readText(filePath);
      artifacts.push({
        path: targetPath,
        format: "markdown",
        content,
        contentHash: sha256(content),
        sourceHash,
        adapter: "core",
        adapterVersion: runtimeVersion,
        ownership: "full_file_rewrite",
      });
    }
  }

  const sortedArtifacts = A.sort(artifacts, artifactOrder);
  const normalizedHash = sha256(
    stableJson(
      A.map(sortedArtifacts, (artifact) => ({
        path: artifact.path,
        contentHash: artifact.contentHash,
        sourceHash: artifact.sourceHash,
        adapter: artifact.adapter,
      }))
    )
  );

  return {
    normalizedHash,
    sourceHash,
    artifacts: sortedArtifacts,
    diagnostics: A.sort(diagnostics, diagnosticOrder),
    skills: {
      selected: A.sort(skillNames, byString),
      copiedFiles: A.length(A.filter(sortedArtifacts, (artifact) => Str.startsWith(".agents/skills/")(artifact.path))),
      matrix: [
        {
          runtime: "codex",
          targetRoot: ".agents/skills",
          mode: "direct_copy",
        },
        {
          runtime: "claude",
          targetRoot: ".agents/skills",
          mode: "direct_copy",
        },
      ],
    },
  };
}

function parseManagedManifest(
  repoRoot: string,
  relativePath: string,
  diagnostics: RuntimeDiagnostic[]
): ManagedFileManifest | null {
  const resolved = resolve(repoRoot, relativePath);
  if (!existsSync(resolved)) {
    return null;
  }

  const parsed = readJsonOrNull(resolved);
  if (!isRecord(parsed)) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_MANIFEST_CORRUPT",
      relativePath,
      "managed files manifest is not valid JSON object.",
      "core"
    );
    return null;
  }
  if (parsed.version !== 1 || !A.isArray(parsed.files)) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_MANIFEST_CORRUPT",
      relativePath,
      "managed files manifest version/schema is invalid.",
      "core"
    );
    return null;
  }

  const parseRuntimeTool = (value: unknown): RuntimeTool | null => {
    if (value === "core") return "core";
    if (value === "claude") return "claude";
    if (value === "codex") return "codex";
    if (value === "cursor") return "cursor";
    if (value === "windsurf") return "windsurf";
    if (value === "jetbrains") return "jetbrains";
    return null;
  };
  const files = A.empty<ManagedFileManifest["files"][number]>();
  for (const raw of parsed.files) {
    if (!isRecord(raw)) {
      continue;
    }
    if (!P.isString(raw.path) || Str.length(raw.path) === 0) {
      continue;
    }
    if (!isRelativePosixPath(raw.path)) {
      continue;
    }
    const adapter = parseRuntimeTool(raw.adapter);
    if (!P.isString(raw.contentHash) || !P.isString(raw.sourceHash) || adapter === null) {
      continue;
    }
    files.push({
      path: raw.path,
      format: raw.format === "toml" ? "toml" : raw.format === "json" ? "json" : "markdown",
      ownership: "full_file_rewrite",
      managed: true,
      sourceHash: raw.sourceHash,
      contentHash: raw.contentHash,
      normalizedHash: P.isString(raw.normalizedHash) ? raw.normalizedHash : "",
      adapter,
      adapterVersion: P.isString(raw.adapterVersion) ? raw.adapterVersion : runtimeVersion,
      orphanPolicy: "delete_if_missing_from_plan",
    });
  }

  return {
    version: 1,
    generator: {
      name: "beep-sync",
      version: runtimeVersion,
    },
    files: A.sort(
      files,
      Order.make<ManagedFileManifest["files"][number]>((self, that) => byString(self.path, that.path))
    ),
  };
}

function parseStateManifest(
  repoRoot: string,
  relativePath: string,
  diagnostics: RuntimeDiagnostic[]
): StateManifest | null {
  const resolved = resolve(repoRoot, relativePath);
  if (!existsSync(resolved)) {
    return null;
  }
  const parsed = readJsonOrNull(resolved);
  if (!isRecord(parsed)) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_STATE_PARSE",
      relativePath,
      "state manifest is not valid JSON object.",
      "core"
    );
    return null;
  }
  if (parsed.version !== 1 || !isRecord(parsed.targets)) {
    addDiagnostic(
      diagnostics,
      "error",
      "E_STATE_VERSION",
      relativePath,
      "state manifest version/schema is invalid.",
      "core"
    );
    return null;
  }

  const parseRuntimeTool = (value: unknown): RuntimeTool | null => {
    if (value === "core") return "core";
    if (value === "claude") return "claude";
    if (value === "codex") return "codex";
    if (value === "cursor") return "cursor";
    if (value === "windsurf") return "windsurf";
    if (value === "jetbrains") return "jetbrains";
    return null;
  };
  const targets = R.empty<string, StateManifest["targets"][string]>();
  for (const key of A.sort(R.keys(parsed.targets), byString)) {
    const entry = parsed.targets[key];
    if (!isRecord(entry)) {
      continue;
    }
    const adapter = parseRuntimeTool(entry.adapter);
    if (!P.isString(entry.contentHash) || !P.isString(entry.sourceHash) || adapter === null) {
      continue;
    }
    targets[key] = {
      adapter,
      adapterVersion: P.isString(entry.adapterVersion) ? entry.adapterVersion : runtimeVersion,
      sourceHash: entry.sourceHash,
      contentHash: entry.contentHash,
      freshnessHash: P.isString(entry.freshnessHash) ? entry.freshnessHash : null,
      managed: true,
      backupPath: P.isString(entry.backupPath) ? entry.backupPath : null,
    };
  }

  const managedPathIndex = A.isArray(parsed.managedPathIndex)
    ? pipe(parsed.managedPathIndex, A.filter(P.isString), A.dedupe, A.sort(byString))
    : A.sort(R.keys(targets), byString);
  const cleanupInputs = isRecord(parsed.cleanupInputs) ? parsed.cleanupInputs : {};
  return {
    version: 1,
    normalizedHash: P.isString(parsed.normalizedHash) ? parsed.normalizedHash : "",
    targets,
    managedPathIndex,
    cleanupInputs: {
      previousManagedPaths: sortedUniqueStrings(cleanupInputs.previousManagedPaths),
      currentPlannedPaths: sortedUniqueStrings(cleanupInputs.currentPlannedPaths),
      orphanCandidates: sortedUniqueStrings(cleanupInputs.orphanCandidates),
    },
  };
}

function buildManagedManifest(plan: RuntimePlan): ManagedFileManifest {
  const files = A.map(plan.artifacts, (artifact) => ({
    path: artifact.path,
    format: artifact.format,
    ownership: "full_file_rewrite" as const,
    managed: true as const,
    sourceHash: artifact.sourceHash,
    contentHash: artifact.contentHash,
    normalizedHash: plan.normalizedHash,
    adapter: artifact.adapter,
    adapterVersion: artifact.adapterVersion,
    orphanPolicy: "delete_if_missing_from_plan" as const,
  }));

  return {
    version: 1,
    generator: {
      name: "beep-sync",
      version: runtimeVersion,
    },
    files: A.sort(
      files,
      Order.make<ManagedFileManifest["files"][number]>((self, that) => byString(self.path, that.path))
    ),
  };
}

function buildStateManifest(
  plan: RuntimePlan,
  previousManagedPaths: string[],
  backupByPath: Record<string, string | null>
): StateManifest {
  const targets = R.empty<string, StateManifest["targets"][string]>();
  const plannedPaths = A.map(plan.artifacts, (artifact) => artifact.path);

  for (const artifact of plan.artifacts) {
    targets[artifact.path] = {
      adapter: artifact.adapter,
      adapterVersion: artifact.adapterVersion,
      sourceHash: artifact.sourceHash,
      contentHash: artifact.contentHash,
      freshnessHash: artifact.freshnessHash ?? null,
      managed: true,
      backupPath: backupByPath[artifact.path] ?? null,
    };
  }

  const orphanCandidates = pipe(
    previousManagedPaths,
    A.filter((pathValue) => !A.some(plannedPaths, (plannedPath) => plannedPath === pathValue)),
    A.sort(byString)
  );

  return {
    version: 1,
    normalizedHash: plan.normalizedHash,
    targets,
    managedPathIndex: A.sort(plannedPaths, byString),
    cleanupInputs: {
      previousManagedPaths: A.sort(A.dedupe(previousManagedPaths), byString),
      currentPlannedPaths: A.sort(A.dedupe(plannedPaths), byString),
      orphanCandidates,
    },
  };
}

function resultFromDiagnostics(
  action: RuntimeAction,
  dryRun: boolean,
  changed: boolean,
  diagnostics: RuntimeDiagnostic[],
  messages: string[],
  stats: Omit<RuntimeResult["stats"], "errorCount" | "warningCount">,
  fallbackExitCode = 0
): RuntimeResult {
  const sortedDiagnostics = A.sort(diagnostics, diagnosticOrder);
  const errorCount = A.length(A.filter(sortedDiagnostics, (diag) => diag.severity === "error"));
  const warningCount = A.length(A.filter(sortedDiagnostics, (diag) => diag.severity === "warning"));

  const statsWithCounts = {
    ...stats,
    errorCount,
    warningCount,
  };

  const exitCode = errorCount > 0 ? 1 : fallbackExitCode;
  return {
    action,
    ok: exitCode === 0,
    changed,
    dryRun,
    exitCode,
    diagnostics: sortedDiagnostics,
    stats: statsWithCounts,
    messages,
  };
}

function resolveSecretReference(
  ref: string,
  forceMode?: "mock" | "desktop" | "service_account"
): {
  ok: boolean;
  source: "mock" | "desktop" | "service_account";
  diagnostic?: string;
} {
  const envMode = process.env.BEEP_SYNC_SECRET_MODE;
  const explicitMode =
    forceMode ?? (envMode === "mock" || envMode === "desktop" || envMode === "service_account" ? envMode : undefined);
  const mode: "mock" | "desktop" | "service_account" = explicitMode
    ? explicitMode
    : P.isString(process.env.OP_SERVICE_ACCOUNT_TOKEN) && Str.length(process.env.OP_SERVICE_ACCOUNT_TOKEN) > 0
      ? "service_account"
      : "desktop";

  if (mode === "mock") {
    if (Str.includes("DOES_NOT_EXIST")(ref) || Str.includes("/missing/")(ref)) {
      return {
        ok: false,
        source: mode,
        diagnostic: "E_SECRET_REQUIRED_UNRESOLVED",
      };
    }
    return { ok: true, source: mode };
  }

  if (mode === "desktop") {
    const whoami = spawnSync("op", ["whoami"], { encoding: "utf8", timeout: 5_000 });
    if (whoami.status !== 0) {
      return {
        ok: false,
        source: mode,
        diagnostic: "E_SECRET_AUTH",
      };
    }
  }

  const read = spawnSync("op", ["read", ref], { encoding: "utf8", timeout: 8_000 });
  if (read.status === 0) {
    return { ok: true, source: mode };
  }

  const stderr = Str.toLowerCase(`${read.stderr ?? ""}`);
  if (
    Str.includes("not signed in")(stderr) ||
    Str.includes("service account")(stderr) ||
    Str.includes("token")(stderr)
  ) {
    return {
      ok: false,
      source: mode,
      diagnostic: "E_SECRET_AUTH",
    };
  }
  return {
    ok: false,
    source: mode,
    diagnostic: "E_SECRET_REQUIRED_UNRESOLVED",
  };
}

function collectRequiredSecretRefs(config: RuntimeConfig): Array<{ path: string; value: string }> {
  const refs = A.empty<{ path: string; value: string }>();
  for (const server of config.mcp.servers) {
    if (server.env) {
      for (const key of A.sort(R.keys(server.env), byString)) {
        const value = server.env[key];
        if (Str.startsWith("op://")(value)) {
          refs.push({
            path: `mcp.servers.${server.id}.env.${key}`,
            value,
          });
        }
      }
    }
    if (server.env_headers) {
      for (const key of A.sort(R.keys(server.env_headers), byString)) {
        const value = server.env_headers[key];
        if (Str.startsWith("op://")(value)) {
          refs.push({
            path: `mcp.servers.${server.id}.env_headers.${key}`,
            value,
          });
        }
      }
    }
  }
  return refs;
}

function resolveConfigSecrets(
  config: RuntimeConfig,
  diagnostics: RuntimeDiagnostic[]
): {
  ok: boolean;
  source: "mock" | "desktop" | "service_account" | null;
  resolvedCount: number;
  missingCount: number;
} {
  const refs = collectRequiredSecretRefs(config);
  if (A.isArrayEmpty(refs)) {
    return {
      ok: true,
      source: null,
      resolvedCount: 0,
      missingCount: 0,
    };
  }

  let source: "mock" | "desktop" | "service_account" | null = null;
  let resolvedCount = 0;
  let missingCount = 0;
  for (const ref of refs) {
    const resolved = resolveSecretReference(ref.value);
    source = resolved.source;
    if (resolved.ok) {
      resolvedCount += 1;
      continue;
    }

    missingCount += 1;
    if (resolved.diagnostic === "E_SECRET_AUTH") {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SECRET_AUTH",
        ref.path,
        `Unable to authenticate while resolving required secret reference (${ref.path}).`,
        "core"
      );
    } else {
      addDiagnostic(
        diagnostics,
        "error",
        "E_SECRET_REQUIRED_UNRESOLVED",
        ref.path,
        `Required secret reference could not be resolved (${ref.path}).`,
        "core"
      );
    }
  }

  if (!config.mcp.secret_provider.required && missingCount > 0) {
    for (const ref of refs) {
      addDiagnostic(
        diagnostics,
        "warning",
        "W_SECRET_OPTIONAL_UNRESOLVED",
        ref.path,
        `Optional secret reference unresolved (${ref.path}).`,
        "core"
      );
    }
    return {
      ok: true,
      source,
      resolvedCount,
      missingCount,
    };
  }

  return {
    ok: missingCount === 0,
    source,
    resolvedCount,
    missingCount,
  };
}

function applyStrictMode(diagnostics: RuntimeDiagnostic[], strict: boolean): RuntimeDiagnostic[] {
  if (!strict) {
    return diagnostics;
  }
  return pipe(
    diagnostics,
    A.map((diag) => {
      if (diag.code === "W_UNSUPPORTED_FIELD" || diag.code === "W_SECRET_OPTIONAL_UNRESOLVED") {
        return {
          ...diag,
          severity: "error" as const,
          code: "E_UNSUPPORTED_FIELD_STRICT",
          message: `strict mode escalation: ${diag.message}`,
        };
      }
      return diag;
    })
  );
}

function pathScopeError(repoRoot: string, pathValue: string): RuntimeDiagnostic | null {
  const resolved = resolve(repoRoot, pathValue);
  const rel = normalizePathToPosix(relative(repoRoot, resolved));
  if (rel === "" || rel === ".") {
    return null;
  }
  if (Str.startsWith("../")(rel) || rel === "..") {
    return {
      severity: "error",
      code: "E_CLEANUP_OUT_OF_SCOPE",
      path: pathValue,
      message: "Path escapes repository root.",
      tool: "core",
    };
  }
  return null;
}

function comparePlanToFiles(repoRoot: string, plan: RuntimePlan): RuntimeDiagnostic[] {
  const diagnostics = A.empty<RuntimeDiagnostic>();
  for (const artifact of plan.artifacts) {
    const targetPath = resolve(repoRoot, artifact.path);
    if (!existsSync(targetPath)) {
      if (Str.endsWith("/AGENTS.md")(artifact.path) || artifact.path === "AGENTS.md" || artifact.path === "CLAUDE.md") {
        addDiagnostic(
          diagnostics,
          "warning",
          "E_AGENTS_MISSING",
          artifact.path,
          "Expected managed AGENTS/CLAUDE file is missing.",
          "core"
        );
      } else {
        addDiagnostic(
          diagnostics,
          "warning",
          "E_MANAGED_MISSING",
          artifact.path,
          "Expected managed file is missing.",
          "core"
        );
      }
      continue;
    }
    const currentContent = readText(targetPath);
    const currentHash = sha256(currentContent);
    if (currentHash !== artifact.contentHash) {
      if (Str.endsWith("/AGENTS.md")(artifact.path) || artifact.path === "AGENTS.md" || artifact.path === "CLAUDE.md") {
        addDiagnostic(
          diagnostics,
          "warning",
          "E_AGENTS_STALE",
          artifact.path,
          "AGENTS/CLAUDE content hash differs from compiled artifact.",
          "core"
        );
      } else {
        addDiagnostic(
          diagnostics,
          "warning",
          "E_MANAGED_STALE",
          artifact.path,
          "Managed file content hash differs from compiled artifact.",
          "core"
        );
      }
    }
  }
  return diagnostics;
}

function makeBackupPath(relativePath: string): string {
  return `${relativePath}.beep-sync.bak`;
}

function writeManagedArtifacts(
  repoRoot: string,
  plan: RuntimePlan,
  dryRun: boolean,
  requireBackups: boolean,
  messages: string[],
  diagnostics: RuntimeDiagnostic[]
): {
  changed: boolean;
  backupByPath: Record<string, string | null>;
} {
  const backupByPath = R.empty<string, string | null>();
  let changed = false;

  for (const artifact of plan.artifacts) {
    const scopeError = pathScopeError(repoRoot, artifact.path);
    if (scopeError) {
      diagnostics.push(scopeError);
      continue;
    }

    const absolutePath = resolve(repoRoot, artifact.path);
    const currentContent = readIfExists(absolutePath);
    if (currentContent !== null && sha256(currentContent) === artifact.contentHash) {
      backupByPath[artifact.path] = null;
      continue;
    }

    changed = true;
    if (dryRun) {
      backupByPath[artifact.path] = currentContent === null ? null : makeBackupPath(artifact.path);
      continue;
    }

    if (currentContent !== null && requireBackups) {
      const backupRelative = makeBackupPath(artifact.path);
      const backupAbsolute = resolve(repoRoot, backupRelative);
      ensureParent(backupAbsolute);
      copyFileSync(absolutePath, backupAbsolute);
      backupByPath[artifact.path] = backupRelative;
      messages.push(`backup created: ${backupRelative}`);
    } else {
      backupByPath[artifact.path] = null;
    }

    atomicWrite(absolutePath, artifact.content);
    messages.push(`wrote managed target: ${artifact.path}`);
  }

  return {
    changed,
    backupByPath,
  };
}

function writeSidecars(
  repoRoot: string,
  config: RuntimeConfig,
  managedManifest: ManagedFileManifest,
  stateManifest: StateManifest,
  dryRun: boolean,
  messages: string[]
): boolean {
  const managedText = stableJson(managedManifest);
  const stateText = stableJson(stateManifest);
  const managedPath = resolve(repoRoot, config.manifests.managed_files);
  const statePath = resolve(repoRoot, config.manifests.state);

  const currentManaged = readIfExists(managedPath);
  const currentState = readIfExists(statePath);
  const changed = currentManaged !== managedText || currentState !== stateText;
  if (dryRun) {
    return changed;
  }

  if (currentManaged !== managedText) {
    atomicWrite(managedPath, managedText);
    messages.push(`updated manifest: ${config.manifests.managed_files}`);
  }
  if (currentState !== stateText) {
    atomicWrite(statePath, stateText);
    messages.push(`updated state: ${config.manifests.state}`);
  }
  return changed;
}

function performOrphanCleanup(
  repoRoot: string,
  orphans: string[],
  dryRun: boolean,
  diagnostics: RuntimeDiagnostic[],
  messages: string[]
): boolean {
  let changed = false;
  for (const orphan of A.sort(orphans, byString)) {
    const scopeError = pathScopeError(repoRoot, orphan);
    if (scopeError) {
      diagnostics.push(scopeError);
      continue;
    }
    const absolute = resolve(repoRoot, orphan);
    if (!existsSync(absolute)) {
      continue;
    }
    changed = true;
    if (dryRun) {
      messages.push(`orphan would be removed: ${orphan}`);
      continue;
    }
    rmSync(absolute, { force: true, recursive: false });
    messages.push(`orphan removed: ${orphan}`);
    removeDirectoryIfEmpty(dirname(absolute));
  }
  return changed;
}

/**
 * Validates runtime config and environment constraints.
 *
 * @param repoRoot - Repository root directory.
 * @param strict - Treat warnings as failures when true.
 * @returns Runtime validation result.
 * @since 0.0.0
 * @category Runtime
 */
export function runRuntimeValidate(repoRoot: string, strict: boolean): RuntimeResult {
  const configLoad = readRuntimeConfig(repoRoot);
  const diagnostics = A.empty<RuntimeDiagnostic>();
  diagnostics.push(...configLoad.diagnostics);

  if (O.isSome(configLoad.config)) {
    const secretStatus = resolveConfigSecrets(configLoad.config.value, diagnostics);
    if (secretStatus.source) {
      const modeInfo =
        secretStatus.source === "service_account"
          ? "service_account"
          : secretStatus.source === "desktop"
            ? "desktop"
            : "mock";
      addDiagnostic(
        diagnostics,
        "info",
        "I_SECRET_RESOLUTION_MODE",
        "mcp.secret_provider",
        `secret resolver mode: ${modeInfo}; resolved=${String(secretStatus.resolvedCount)} missing=${String(secretStatus.missingCount)}`,
        "core"
      );
    }
  }

  const strictDiagnostics = applyStrictMode(diagnostics, strict);
  const result = resultFromDiagnostics("validate", false, false, strictDiagnostics, [], {
    managedTargetCount: 0,
  });
  return {
    ...result,
    stats: {
      ...result.stats,
      managedTargetCount: 0,
    },
  };
}

/**
 * Applies managed artifacts and updates runtime manifests/state.
 *
 * @param repoRoot - Repository root directory.
 * @param dryRun - When true, report changes without writing files.
 * @param strict - Treat warnings as failures when true.
 * @returns Runtime apply result.
 * @since 0.0.0
 * @category Runtime
 */
export function runRuntimeApply(repoRoot: string, dryRun: boolean, strict: boolean): RuntimeResult {
  const configLoad = readRuntimeConfig(repoRoot);
  const diagnostics = A.empty<RuntimeDiagnostic>();
  diagnostics.push(...configLoad.diagnostics);
  const messages = A.empty<string>();

  if (O.isNone(configLoad.config)) {
    const strictDiagnostics = applyStrictMode(diagnostics, strict);
    return resultFromDiagnostics("apply", dryRun, false, strictDiagnostics, messages, {
      managedTargetCount: 0,
      orphanCandidateCount: 0,
      skillTargetCount: 0,
    });
  }

  const config = configLoad.config.value;
  resolveConfigSecrets(config, diagnostics);
  if (A.some(diagnostics, (diag) => diag.severity === "error")) {
    const strictDiagnostics = applyStrictMode(diagnostics, strict);
    return resultFromDiagnostics("apply", dryRun, false, strictDiagnostics, messages, {
      managedTargetCount: 0,
      orphanCandidateCount: 0,
      skillTargetCount: 0,
    });
  }

  const plan = buildPlan(repoRoot, config, configLoad.sourceHash);
  diagnostics.push(...plan.diagnostics);

  const previousManifest = parseManagedManifest(repoRoot, config.manifests.managed_files, diagnostics);
  const previousManagedPaths = previousManifest
    ? A.map(previousManifest.files, (file) => file.path)
    : A.empty<string>();

  const writeResult = writeManagedArtifacts(
    repoRoot,
    plan,
    dryRun,
    config.settings.require_revert_backups,
    messages,
    diagnostics
  );

  const state = buildStateManifest(plan, previousManagedPaths, writeResult.backupByPath);
  const managedManifest = buildManagedManifest(plan);
  const sidecarChanged = writeSidecars(repoRoot, config, managedManifest, state, dryRun, messages);
  const orphanChanged = performOrphanCleanup(
    repoRoot,
    state.cleanupInputs.orphanCandidates,
    dryRun,
    diagnostics,
    messages
  );
  const changed = writeResult.changed || sidecarChanged || orphanChanged;

  const strictDiagnostics = applyStrictMode(diagnostics, strict);
  const result = resultFromDiagnostics("apply", dryRun, changed, strictDiagnostics, messages, {
    managedTargetCount: A.length(plan.artifacts),
    orphanCandidateCount: A.length(state.cleanupInputs.orphanCandidates),
    skillTargetCount: plan.skills.copiedFiles,
  });

  if (result.ok) {
    messages.push(`skill-sync selected=${A.join(plan.skills.selected, ",") || "(none)"}`);
    messages.push(`skill-sync target=.agents/skills copied_files=${String(plan.skills.copiedFiles)}`);
  }

  return {
    ...result,
    messages,
  };
}

/**
 * Checks managed artifacts for drift against the compiled plan.
 *
 * @param repoRoot - Repository root directory.
 * @param strict - Treat warnings as failures when true.
 * @returns Runtime check result.
 * @since 0.0.0
 * @category Runtime
 */
export function runRuntimeCheck(repoRoot: string, strict: boolean): RuntimeResult {
  const configLoad = readRuntimeConfig(repoRoot);
  const diagnostics = A.empty<RuntimeDiagnostic>();
  diagnostics.push(...configLoad.diagnostics);
  const messages = A.empty<string>();

  if (O.isNone(configLoad.config)) {
    const strictDiagnostics = applyStrictMode(diagnostics, strict);
    return resultFromDiagnostics("check", false, false, strictDiagnostics, messages, {
      managedTargetCount: 0,
      staleTargetCount: 0,
      orphanCandidateCount: 0,
      skillTargetCount: 0,
    });
  }

  const config = configLoad.config.value;
  resolveConfigSecrets(config, diagnostics);
  if (A.some(diagnostics, (diag) => diag.severity === "error")) {
    const strictDiagnostics = applyStrictMode(diagnostics, strict);
    return resultFromDiagnostics("check", false, false, strictDiagnostics, messages, {
      managedTargetCount: 0,
      staleTargetCount: 0,
      orphanCandidateCount: 0,
      skillTargetCount: 0,
    });
  }

  const plan = buildPlan(repoRoot, config, configLoad.sourceHash);
  diagnostics.push(...plan.diagnostics);
  const managedManifest = parseManagedManifest(repoRoot, config.manifests.managed_files, diagnostics);
  const stateManifest = parseStateManifest(repoRoot, config.manifests.state, diagnostics);

  if (!managedManifest || A.isArrayEmpty(managedManifest.files)) {
    messages.push("no managed manifest baseline found; check passes in pre-cutover mode.");
    const strictDiagnostics = applyStrictMode(diagnostics, strict);
    return resultFromDiagnostics("check", false, false, strictDiagnostics, messages, {
      managedTargetCount: A.length(plan.artifacts),
      staleTargetCount: 0,
      orphanCandidateCount: 0,
      skillTargetCount: plan.skills.copiedFiles,
    });
  }

  const driftDiagnostics = comparePlanToFiles(repoRoot, plan);
  diagnostics.push(...driftDiagnostics);

  const plannedPaths = A.map(plan.artifacts, (artifact) => artifact.path);
  for (const managedFile of managedManifest.files) {
    if (!A.some(plannedPaths, (pathValue) => pathValue === managedFile.path)) {
      addDiagnostic(
        diagnostics,
        "warning",
        "E_AGENTS_SCOPE_DRIFT",
        managedFile.path,
        "Managed manifest contains path not present in current plan.",
        "core"
      );
    }
  }

  if (stateManifest) {
    for (const artifact of plan.artifacts) {
      const stateEntry = stateManifest.targets[artifact.path];
      if (!stateEntry) {
        continue;
      }
      if (stateEntry.contentHash !== artifact.contentHash) {
        addDiagnostic(
          diagnostics,
          "warning",
          "E_STATE_DRIFT",
          artifact.path,
          "State content hash differs from compiled artifact hash.",
          "core"
        );
      }
      if (artifact.freshnessHash && stateEntry.freshnessHash && artifact.freshnessHash !== stateEntry.freshnessHash) {
        addDiagnostic(
          diagnostics,
          "warning",
          "E_AGENTS_STALE",
          artifact.path,
          "Freshness hash differs from state manifest.",
          "core"
        );
      }
    }
  }

  const strictDiagnostics = applyStrictMode(diagnostics, strict);
  const staleCount = A.length(
    A.filter(
      strictDiagnostics,
      (diag) => Str.startsWith("E_AGENTS")(diag.code) || Str.startsWith("E_MANAGED")(diag.code)
    )
  );
  const hasErrors = A.some(strictDiagnostics, (diag) => diag.severity === "error");
  const hasWarnings = A.some(strictDiagnostics, (diag) => diag.severity === "warning");
  const driftExitCode = !hasErrors && hasWarnings ? 3 : 0;
  const result = resultFromDiagnostics(
    "check",
    false,
    false,
    strictDiagnostics,
    messages,
    {
      managedTargetCount: A.length(plan.artifacts),
      staleTargetCount: staleCount,
      orphanCandidateCount: stateManifest ? A.length(stateManifest.cleanupInputs.orphanCandidates) : 0,
      skillTargetCount: plan.skills.copiedFiles,
    },
    driftExitCode
  );

  return result;
}

/**
 * Reports runtime health and planning diagnostics without mutation.
 *
 * @param repoRoot - Repository root directory.
 * @param strict - Treat warnings as failures when true.
 * @returns Runtime doctor result.
 * @since 0.0.0
 * @category Runtime
 */
export function runRuntimeDoctor(repoRoot: string, strict: boolean): RuntimeResult {
  const diagnostics = A.empty<RuntimeDiagnostic>();
  const messages = A.empty<string>();
  const configLoad = readRuntimeConfig(repoRoot);
  diagnostics.push(...configLoad.diagnostics);

  if (O.isSome(configLoad.config)) {
    const config = configLoad.config.value;
    const plan = buildPlan(repoRoot, config, configLoad.sourceHash);
    diagnostics.push(...plan.diagnostics);

    const manifestDiagnostics = A.empty<RuntimeDiagnostic>();
    parseManagedManifest(repoRoot, config.manifests.managed_files, manifestDiagnostics);
    parseStateManifest(repoRoot, config.manifests.state, manifestDiagnostics);
    diagnostics.push(...manifestDiagnostics);

    const packageCount = A.length(discoverWorkspacePackages(repoRoot));
    const agentsTargetCount = A.length(
      A.filter(plan.artifacts, (artifact) => Str.endsWith("/AGENTS.md")(artifact.path) || artifact.path === "AGENTS.md")
    );
    messages.push(`workspace packages discovered: ${String(packageCount)}`);
    messages.push(`agents targets planned: ${String(agentsTargetCount)}`);
    messages.push(`skill targets planned: ${String(plan.skills.copiedFiles)}`);

    if (packageCount + 1 !== agentsTargetCount) {
      addDiagnostic(
        diagnostics,
        "warning",
        "E_AGENTS_SCOPE_DRIFT",
        "instructions.packages",
        "Planned AGENTS fanout count differs from discovered workspace package count.",
        "core"
      );
    }
  }

  const strictDiagnostics = applyStrictMode(diagnostics, strict);
  const errorCount = A.length(A.filter(strictDiagnostics, (diag) => diag.severity === "error"));
  const warningCount = A.length(A.filter(strictDiagnostics, (diag) => diag.severity === "warning"));
  const fallbackExitCode = errorCount > 0 ? 1 : warningCount > 0 ? (strict ? 1 : 4) : 0;

  return resultFromDiagnostics(
    "doctor",
    false,
    false,
    strictDiagnostics,
    messages,
    {
      managedTargetCount: 0,
    },
    fallbackExitCode
  );
}

/**
 * Reverts managed artifacts using recorded runtime state.
 *
 * @param repoRoot - Repository root directory.
 * @param dryRun - When true, report changes without writing files.
 * @returns Runtime revert result.
 * @since 0.0.0
 * @category Runtime
 */
export function runRuntimeRevert(repoRoot: string, dryRun: boolean): RuntimeResult {
  const diagnostics = A.empty<RuntimeDiagnostic>();
  const messages = A.empty<string>();
  const configLoad = readRuntimeConfig(repoRoot);
  diagnostics.push(...configLoad.diagnostics);

  if (O.isNone(configLoad.config)) {
    return resultFromDiagnostics("revert", dryRun, false, diagnostics, messages, {
      managedTargetCount: 0,
    });
  }

  const config = configLoad.config.value;
  const state = parseStateManifest(repoRoot, config.manifests.state, diagnostics);
  if (!state || A.isArrayEmpty(state.managedPathIndex)) {
    messages.push("no managed state present; revert is idempotent no-op");
    return resultFromDiagnostics("revert", dryRun, false, diagnostics, messages, {
      managedTargetCount: 0,
    });
  }

  let changed = false;
  for (const managedPath of A.sort(state.managedPathIndex, byString)) {
    const scopeError = pathScopeError(repoRoot, managedPath);
    if (scopeError) {
      scopeError.code = "E_REVERT_UNMANAGED_TARGET";
      diagnostics.push(scopeError);
      continue;
    }

    const targetAbsolute = resolve(repoRoot, managedPath);
    const stateEntry = state.targets[managedPath];
    if (!stateEntry) {
      continue;
    }

    if (stateEntry.backupPath) {
      const backupAbsolute = resolve(repoRoot, stateEntry.backupPath);
      if (!existsSync(backupAbsolute)) {
        addDiagnostic(
          diagnostics,
          "error",
          "E_REVERT_MISSING_BACKUP",
          managedPath,
          "Backup file referenced by state is missing.",
          "core"
        );
        continue;
      }
      changed = true;
      if (!dryRun) {
        ensureParent(targetAbsolute);
        copyFileSync(backupAbsolute, targetAbsolute);
        removeIfExists(backupAbsolute);
        messages.push(`restored managed file from backup: ${managedPath}`);
      } else {
        messages.push(`would restore managed file from backup: ${managedPath}`);
      }
      continue;
    }

    if (!existsSync(targetAbsolute)) {
      continue;
    }

    const currentContent = readText(targetAbsolute);
    const currentHash = sha256(currentContent);
    if (currentHash !== stateEntry.contentHash) {
      addDiagnostic(
        diagnostics,
        "error",
        "E_REVERT_MISSING_BACKUP",
        managedPath,
        "Missing backup and current file hash no longer matches managed content hash.",
        "core"
      );
      continue;
    }

    changed = true;
    if (!dryRun) {
      removeIfExists(targetAbsolute);
      removeDirectoryIfEmpty(dirname(targetAbsolute));
      messages.push(`removed managed file with no backup: ${managedPath}`);
    } else {
      messages.push(`would remove managed file with no backup: ${managedPath}`);
    }
  }

  if (A.some(diagnostics, (diag) => diag.severity === "error")) {
    return resultFromDiagnostics("revert", dryRun, changed, diagnostics, messages, {
      managedTargetCount: A.length(state.managedPathIndex),
    });
  }

  if (!dryRun) {
    removeIfExists(resolve(repoRoot, config.manifests.state));
    removeIfExists(resolve(repoRoot, config.manifests.managed_files));
    removeDirectoryIfEmpty(dirname(resolve(repoRoot, config.manifests.state)));
    messages.push("removed managed state sidecars");
  } else {
    messages.push("would remove managed state sidecars");
  }

  return resultFromDiagnostics("revert", dryRun, changed, diagnostics, messages, {
    managedTargetCount: A.length(state.managedPathIndex),
  });
}
