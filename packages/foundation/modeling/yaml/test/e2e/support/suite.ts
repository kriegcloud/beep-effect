// @effect-diagnostics nodeBuiltinImport:skip-file
/**
 * Test data loader for the official yaml-test-suite.
 *
 * Reads raw fixture files from the vendored corpus at
 * `__test__/fixtures/yaml-test-suite/` (pinned to data-2022-01-17 — see
 * VENDORED.md there).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** Root directory of the yaml-test-suite data checkout. */
const SUITE_DIR = resolve(import.meta.dirname, "../../fixtures/yaml-test-suite");

/** A single yaml-test-suite test case. */
export interface TestCase {
  /** Expected parse event stream from `test.event`. */
  events: string;
  /** 4-character test ID (e.g., "229Q"). */
  id: string;
  /** True if the `error` file is present (YAML should be rejected). */
  isError: boolean;
  /** True if `in.json` contains multiple top-level JSON values (multi-document stream). */
  isMultiDocument: boolean;
  /** Parsed expected JSON output (if `in.json` exists). */
  json?: unknown;
  /** Human-readable test name from the `===` file. */
  name: string;
  /** Expected re-serialized YAML (if `out.yaml` exists). */
  outYaml?: string | undefined;
  /** Raw YAML input from `in.yaml`. */
  yaml: string;
}

/** Result of parsing a JSON fixture file. */
interface ParsedJson {
  /** True if the file contained multiple top-level JSON values. */
  isMultiDocument: boolean;
  /** The parsed value: single value for single-doc, array for multi-doc. */
  value: unknown;
}

/** Mutable scanner state for a composite (object/array) JSON value. */
interface CompositeScan {
  depth: number;
  inString: boolean;
  isEscaped: boolean;
}

const isWhitespace = (src: string, i: number): boolean => /\s/.test(src.charAt(i));

function skipWhitespace(src: string, i: number): number {
  let j = i;
  while (j < src.length && isWhitespace(src, j)) j++;
  return j;
}

/** Advance the scanner over one character inside a JSON string. */
function stepInString(state: CompositeScan, c: string | undefined): void {
  if (state.isEscaped) state.isEscaped = false;
  else if (c === "\\") state.isEscaped = true;
  else if (c === '"') state.inString = false;
}

/** Advance the scanner over one character outside strings; true when the value closes. */
function stepOutsideString(state: CompositeScan, c: string | undefined): boolean {
  if (c === '"') {
    state.inString = true;
    return false;
  }
  if (c === "{" || c === "[") {
    state.depth++;
    return false;
  }
  if (c !== "}" && c !== "]") return false;
  state.depth--;
  return state.depth === 0;
}

/** End index (exclusive) of the object/array starting at `start`, or -1 when unterminated. */
function compositeEnd(src: string, start: number): number {
  const state: CompositeScan = { depth: 0, inString: false, isEscaped: false };
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (state.inString) stepInString(state, c);
    else if (stepOutsideString(state, c)) return i + 1;
  }
  return -1;
}

/** End index (exclusive) of the quoted string starting at `start`. */
function quotedEnd(src: string, start: number): number {
  let i = start + 1;
  while (i < src.length) {
    if (src[i] === "\\" && i + 1 < src.length) {
      i += 2;
    } else if (src[i] === '"') {
      return i + 1;
    } else {
      i++;
    }
  }
  return i;
}

/** End index (exclusive) of an unquoted token: number, true, false, null. */
function bareEnd(src: string, start: number): number {
  let i = start;
  while (i < src.length && !isWhitespace(src, i)) i++;
  return i;
}

/** End index (exclusive) of the JSON value starting at `start`, or -1 when unterminated. */
function valueEnd(src: string, start: number): number {
  const ch = src[start];
  if (ch === "{" || ch === "[") return compositeEnd(src, start);
  if (ch === '"') return quotedEnd(src, start);
  return bareEnd(src, start);
}

/**
 * Parse a JSON file that may contain multiple top-level JSON values
 * (one per YAML document in multi-document streams).
 * Returns a single value if there's only one, or an array of values for multi-doc.
 */
function parseMultiJson(text: string): ParsedJson {
  const values: unknown[] = [];
  const src = text.trim();
  let i = skipWhitespace(src, 0);

  while (i < src.length) {
    const end = valueEnd(src, i);
    if (end === -1) break;
    values.push(JSON.parse(src.slice(i, end)));
    i = skipWhitespace(src, end);
  }

  const isMultiDocument = values.length > 1;
  return {
    value: isMultiDocument ? values : values[0],
    isMultiDocument,
  };
}

/**
 * Load a single test case from a directory that contains `in.yaml`, `===`, etc.
 */
function loadFromDir(dir: string, id: string): TestCase | null {
  const inYamlPath = join(dir, "in.yaml");
  if (!existsSync(inYamlPath)) return null;

  const yaml = readFileSync(inYamlPath, "utf-8");
  const name = existsSync(join(dir, "===")) ? readFileSync(join(dir, "==="), "utf-8").trim() : id;
  const events = existsSync(join(dir, "test.event")) ? readFileSync(join(dir, "test.event"), "utf-8") : "";
  const isError = existsSync(join(dir, "error"));

  let json: unknown;
  let isMultiDocument = false;
  const jsonPath = join(dir, "in.json");
  if (existsSync(jsonPath)) {
    const parsed = parseMultiJson(readFileSync(jsonPath, "utf-8"));
    json = parsed.value;
    isMultiDocument = parsed.isMultiDocument;
  }

  let outYaml: string | undefined;
  const outPath = join(dir, "out.yaml");
  if (existsSync(outPath)) {
    outYaml = readFileSync(outPath, "utf-8");
  }

  return { id, name, yaml, events, json, outYaml, isError, isMultiDocument };
}

/**
 * Load the case(s) under one top-level suite entry: the entry itself when it is a
 * flat test, otherwise each numbered subdirectory (multi-case test).
 */
function loadEntry(name: string): TestCase[] {
  const dir = join(SUITE_DIR, name);
  const flat = loadFromDir(dir, name);
  if (flat !== null) return [flat];

  return readdirSync(dir, { withFileTypes: true })
    .filter((sub) => sub.isDirectory())
    .flatMap((sub) => {
      const subCase = loadFromDir(join(dir, sub.name), `${name}/${sub.name}`);
      return subCase === null ? [] : [subCase];
    });
}

/**
 * Load all test cases from the yaml-test-suite data directory.
 *
 * Handles both flat test directories (e.g., `229Q/in.yaml`) and
 * multi-case directories with numbered subdirectories (e.g., `3RLN/00/`, `3RLN/01/`).
 */
export function loadAllTestCases(): TestCase[] {
  if (!existsSync(SUITE_DIR)) {
    throw new Error(`yaml-test-suite not found at ${SUITE_DIR}.`);
  }

  const cases = readdirSync(SUITE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => loadEntry(entry.name));

  return cases.sort((a, b) => a.id.localeCompare(b.id));
}
