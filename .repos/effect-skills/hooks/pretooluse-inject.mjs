#!/usr/bin/env node
/**
 * PreToolUse hook: detect Effect patterns in file being read/edited,
 * inject relevant reference doc.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const refsDir = join(pluginRoot, "skills", "effect-ts", "references");

const PATTERNS = [
  { match: /ServiceMap\.Service|Layer\.effect|Layer\.sync|Layer\.scoped/, ref: "services-and-layers.md" },
  { match: /Schema\.Class|Schema\.TaggedClass|Schema\.Struct\(|Schema\.brand/, ref: "data-modeling.md" },
  { match: /Schema\.TaggedErrorClass|Schema\.TaggedError|Effect\.catchTag/, ref: "error-handling.md" },
  { match: /from ["']@effect\/vitest|it\.effect|it\.layer/, ref: "testing.md" },
  { match: /from ["']effect\/unstable\/http|HttpClient|HttpClientResponse/, ref: "http-clients.md" },
  { match: /from ["']effect\/unstable\/cli|Command\.make\(|Argument\.|Flag\./, ref: "cli.md" },
  { match: /Config\.redacted|Config\.schema|ConfigProvider/, ref: "config.md" },
  { match: /Scope\.make|Scope\.extend|Effect\.forkDaemon|Effect\.forkScoped/, ref: "processes.md" },
];

// Track injected refs per session via env
const seen = new Set((process.env.EFFECT_SEEN_REFS || "").split(",").filter(Boolean));

function loadRef(file) {
  try {
    return readFileSync(join(refsDir, file), "utf-8");
  } catch {
    return null;
  }
}

let input;
try {
  input = JSON.parse(readFileSync("/dev/stdin", "utf-8"));
} catch {
  process.stdout.write("{}");
  process.exit(0);
}

const toolInput = input.tool_input || {};
const filePath = toolInput.file_path || toolInput.path || toolInput.command || "";

// Only process .ts/.tsx files
if (!filePath.match(/\.tsx?$/)) {
  process.stdout.write("{}");
  process.exit(0);
}

// Try to read the file content to detect patterns
let content = "";
try {
  const fullPath = filePath.startsWith("/") ? filePath : join(input.cwd || process.cwd(), filePath);
  if (existsSync(fullPath)) {
    content = readFileSync(fullPath, "utf-8");
  }
} catch {
  // File might not exist yet (Write), that's fine
}

if (!content) {
  process.stdout.write("{}");
  process.exit(0);
}

// Find first matching pattern not yet injected
let injected = null;
for (const { match, ref } of PATTERNS) {
  if (match.test(content) && !seen.has(ref)) {
    const doc = loadRef(ref);
    if (doc) {
      seen.add(ref);
      injected = { ref, doc };
      break;
    }
  }
}

if (injected) {
  const output = {
    hookSpecificOutput: {
      additionalContext: `<effect-reference topic="${injected.ref}">\n${injected.doc}\n</effect-reference>`,
    },
    env: {
      EFFECT_SEEN_REFS: [...seen].join(","),
    },
  };
  process.stdout.write(JSON.stringify(output));
} else {
  process.stdout.write("{}");
}
