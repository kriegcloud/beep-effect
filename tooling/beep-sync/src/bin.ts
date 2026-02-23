#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  collectYamlFiles,
  formatDiagnostics,
  generateMcpForTool,
  readYamlDocument,
  normalizeCanonicalEnvelope,
  validateCanonicalFile
} from "./index.js";

type ParsedArgs = {
  command: string;
  positionals: string[];
  options: Record<string, string | boolean>;
};

const KNOWN_COMMANDS = new Set([
  "validate",
  "apply",
  "check",
  "doctor",
  "generate",
  "normalize",
  "revert"
]);

function parseArgv(argv: string[]): ParsedArgs {
  const [command = "", ...rest] = argv;
  const options: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i];

    if (!token.startsWith("-")) {
      positionals.push(token);
      continue;
    }

    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = rest[i + 1];
      const isValue = !!next && !next.startsWith("-");
      options[key] = isValue ? next : true;
      if (isValue) i++;
      continue;
    }

    const key = token.slice(1);
    options[key] = true;
  }

  return { command, positionals, options };
}

function getStringOption(parsed: ParsedArgs, key: string): string | undefined {
  const value = parsed.options[key];
  return typeof value === "string" ? value : undefined;
}

function requirePathExists(pathValue: string | undefined, flagName: string): void {
  if (!pathValue) return;

  const absolute = resolve(pathValue);
  if (!existsSync(absolute)) {
    console.error(`[beep-sync scaffold] Missing path for --${flagName}: ${pathValue}`);
    process.exit(2);
  }
}

function printUsage(): void {
  console.log(`beep-sync (scaffold mode)

Commands:
  validate | apply | check | doctor | generate | normalize | revert

Notes:
  - This is a scaffold CLI, not final runtime behavior.
  - It validates input/fixture path existence and emits deterministic placeholder output.
`);
}

function isPoc01Path(pathValue: string): boolean {
  const normalized = resolve(pathValue).replaceAll("\\", "/");
  return normalized.includes("/fixtures/poc-01/");
}

function handlePoc01Validation(paths: string[], expectFail: boolean): never {
  const files = paths.flatMap((pathValue) => collectYamlFiles(pathValue));

  if (files.length === 0) {
    console.error("[beep-sync poc-01] No YAML files found for validation.");
    process.exit(2);
  }

  const byFile = files.map((file) => {
    const { diagnostics } = validateCanonicalFile(file);
    return { file, diagnostics };
  });

  const failing = byFile.filter((entry) => entry.diagnostics.length > 0);

  if (failing.length === 0) {
    if (expectFail) {
      console.error("[beep-sync poc-01] --expect-fail was set, but fixtures passed.");
      process.exit(1);
    }
    console.log(`[beep-sync poc-01] validation passed for ${files.length} file(s).`);
    process.exit(0);
  }

  for (const entry of failing) {
    console.error(`\n[file] ${entry.file}`);
    console.error(formatDiagnostics(entry.diagnostics));
  }

  if (expectFail) {
    console.log(
      `[beep-sync poc-01] expected failure satisfied (${failing.length} file(s) reported diagnostics).`
    );
    process.exit(0);
  }

  console.error(`[beep-sync poc-01] validation failed for ${failing.length} file(s).`);
  process.exit(1);
}

function handlePoc01Normalize(inputPath: string): never {
  const { diagnostics, data } = validateCanonicalFile(inputPath);
  if (diagnostics.length > 0) {
    console.error("[beep-sync poc-01] normalize blocked by validation errors:");
    console.error(formatDiagnostics(diagnostics));
    process.exit(1);
  }

  const normalized = normalizeCanonicalEnvelope(data);
  process.stdout.write(`${JSON.stringify(normalized, null, 2)}\n`);
  process.exit(0);
}

function isPoc02Path(pathValue: string): boolean {
  const normalized = resolve(pathValue).replaceAll("\\", "/");
  return normalized.includes("/fixtures/poc-02/");
}

function handlePoc02Generate(tool: string, fixturePath: string, strict: boolean): never {
  if (tool !== "codex" && tool !== "cursor" && tool !== "windsurf") {
    console.error(`[beep-sync poc-02] Unsupported tool for POC-02: ${tool}`);
    process.exit(1);
  }

  let fixtureData: unknown;
  try {
    fixtureData = readYamlDocument(fixturePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[beep-sync poc-02] Failed to parse fixture: ${message}`);
    process.exit(1);
  }

  const result = generateMcpForTool(tool, fixtureData);
  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.error(`[warning] ${warning}`);
    }
  }

  if (strict && result.warnings.length > 0) {
    console.error(`[beep-sync poc-02] strict mode blocked generation (${result.warnings.length} warning(s)).`);
    process.exit(1);
  }

  process.stdout.write(result.output);
  process.exit(0);
}

function run(): void {
  const parsed = parseArgv(process.argv.slice(2));
  const command = parsed.command;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  if (!KNOWN_COMMANDS.has(command)) {
    console.error(`[beep-sync scaffold] Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }

  const fixture = getStringOption(parsed, "fixture");
  const fixtures = getStringOption(parsed, "fixtures");
  const input = getStringOption(parsed, "input");
  const tool = getStringOption(parsed, "tool");

  requirePathExists(fixture, "fixture");
  requirePathExists(fixtures, "fixtures");
  requirePathExists(input, "input");

  if (command === "validate") {
    const paths = [fixture, fixtures].filter((value): value is string => typeof value === "string");
    if (paths.length > 0 && paths.every((pathValue) => isPoc01Path(pathValue))) {
      handlePoc01Validation(paths, Boolean(parsed.options["expect-fail"]));
    }
  }

  if (command === "normalize" && input) {
    handlePoc01Normalize(input);
  }

  if (command === "generate" && fixture && tool && isPoc02Path(fixture)) {
    handlePoc02Generate(tool, fixture, Boolean(parsed.options.strict));
  }

  const payload = {
    mode: "scaffold",
    command,
    strict: Boolean(parsed.options.strict),
    dryRun: Boolean(parsed.options["dry-run"]),
    tool: tool ?? null,
    fixture: fixture ? resolve(fixture) : null,
    fixtures: fixtures ? resolve(fixtures) : null,
    input: input ? resolve(input) : null,
    note: "Replace scaffold behavior with implementation in P1-P3"
  };

  if (parsed.options["expect-fail"]) {
    console.log("[beep-sync scaffold] --expect-fail acknowledged (simulated). Real failure semantics pending implementation.");
  }

  console.log(`[beep-sync scaffold] ${command} completed.`);
  console.log(JSON.stringify(payload, null, 2));
}

run();
