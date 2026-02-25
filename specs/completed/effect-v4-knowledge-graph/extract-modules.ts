/**
 * Extract module-level episodes from Effect v4's index.ts
 * Parses JSDoc comments for each module re-export and generates structured episodes.
 */
import { readFileSync, writeFileSync } from "fs";
import * as O from "effect/Option";
import * as Str from "effect/String";


const indexPath = ".repos/effect-smol/packages/effect/src/index.ts";
const content = readFileSync(indexPath, "utf-8");

interface ModuleEpisode {
  name: string;
  title: string;
  category: "module";
  modulePath: string;
  description: string;
  mentalModel: string;
  commonTasks: string;
  gotchas: string;
  quickstart: string;
  seeAlso: string;
  since: string;
  exportType: "namespace" | "named";
}

const episodes: ModuleEpisode[] = [];

// Match JSDoc + export patterns
// Two patterns:
// 1. /** ... */ export * as ModuleName from "./ModuleName.ts"
// 2. /** ... */ export { named1, named2 } from "./ModuleName.ts"
const modulePattern = /\/\*\*([\s\S]*?)\*\/\s*\n\s*export\s+\*\s+as\s+(\w+)\s+from\s+"\.\/([^"]+)\.ts"/g;

let match: RegExpExecArray | null;
while ((match = modulePattern.exec(content)) !== null) {
  const jsdoc = match[1];
  const moduleName = match[2];
  const filePath = match[3];

  // Extract sections from JSDoc
  const description = extractSection(jsdoc, null); // text before first ## heading
  const mentalModel = extractSection(jsdoc, "Mental model");
  const commonTasks = extractSection(jsdoc, "Common tasks");
  const gotchas = extractSection(jsdoc, "Gotchas");
  const quickstart = extractSection(jsdoc, "Quickstart");
  const seeAlso = extractSeeAlso(jsdoc);
  const since = extractSince(jsdoc);

  episodes.push({
    name: moduleName,
    title: `${moduleName} Module`,
    category: "module",
    modulePath: `effect/${moduleName}`,
    description: cleanJsdoc(description),
    mentalModel: cleanJsdoc(mentalModel),
    commonTasks: cleanJsdoc(commonTasks),
    gotchas: cleanJsdoc(gotchas),
    quickstart: cleanJsdoc(quickstart),
    seeAlso: cleanJsdoc(seeAlso),
    since,
    exportType: "namespace",
  });
}

// Also capture the top-level named exports (pipe, flow, etc.)
const namedExportPattern =
  /\/\*\*\s*\n\s*\*\s*@since\s+[\d.]+\s*\n\s*\*\/\s*\n\s*export\s*\{([^}]+)\}\s*from\s+"\.\/([^"]+)\.ts"/g;
while ((match = namedExportPattern.exec(content)) !== null) {
  const names = Str.split(",")(match[1])
    .map((n) => {
      // Extract just the name, ignoring JSDoc within the block
      const cleaned = Str.trim(Str.replace(/\/\*\*[\s\S]*?\*\//g, "")(n));
      return cleaned;
    })
    .filter((n) => n.length > 0);

  // These are typically from Function.ts - already captured by namespace exports if they exist
}

function extractSection(jsdoc: string, heading: string | null): string {
  const lines = Str.split("\n")(jsdoc).map((l) => Str.replace(/^\s*\*\s?/, "")(l));

  if (heading === null) {
    // Extract text before first ## heading or @see/@since
    const result: string[] = [];
    for (const line of lines) {
      if (line.startsWith("## ") || line.startsWith("@see") || line.startsWith("@since")) break;
      result.push(line);
    }
    return Str.trim(result.join("\n"));
  }

  let inSection = false;
  const result: string[] = [];
  for (const line of lines) {
    if (line.startsWith(`## ${heading}`)) {
      inSection = true;
      continue;
    }
    if (inSection && line.startsWith("## ")) break;
    if (inSection && (line.startsWith("@see") || line.startsWith("@since"))) break;
    if (inSection) result.push(line);
  }
  return Str.trim(result.join("\n"));
}

function extractSeeAlso(jsdoc: string): string {
  const lines = Str.split("\n")(jsdoc).map((l) => Str.replace(/^\s*\*\s?/, "")(l));
  return lines
    .filter((l) => l.startsWith("@see"))
    .map((l) => Str.replace("@see ", "")(l))
    .join("\n");
}

function extractSince(jsdoc: string): string {
  const m = O.getOrNull(O.fromNullishOr(Str.match(/@since\s+([\d.]+)/)(jsdoc)));
  return m ? m[1] : "unknown";
}

function cleanJsdoc(text: string): string {
  return Str.trim(Str.replace(/\{@link\s+(\w+)\s+(\w+)\}/g, "$2")(Str.replace(/\{@link\s+(\w+)\}/g, "$1")(text)));
}

// Generate episode narratives for Graphiti ingestion
interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

const graphitiEpisodes: GraphitiEpisode[] = episodes.map((ep) => {
  let body = `Title: ${ep.title}\nCategory: module\nModule Path: ${ep.modulePath}\n\n`;

  if (ep.description) {
    body += `Description: ${ep.description}\n\n`;
  }

  if (ep.mentalModel) {
    body += `Mental Model:\n${ep.mentalModel}\n\n`;
  }

  if (ep.commonTasks) {
    body += `Common Tasks:\n${ep.commonTasks}\n\n`;
  }

  if (ep.gotchas) {
    body += `Gotchas:\n${ep.gotchas}\n\n`;
  }

  if (ep.quickstart) {
    body += `Quickstart:\n${ep.quickstart}\n\n`;
  }

  if (ep.seeAlso) {
    body += `See Also:\n${ep.seeAlso}\n\n`;
  }

  body += `Since: ${ep.since}`;

  return {
    name: `Effect v4 Module: ${ep.name}`,
    episode_body: body,
    source: "text",
    source_description: "Effect v4 module documentation from index.ts",
    group_id: "effect-v4",
  };
});

writeFileSync(
  "specs/pending/effect-v4-knowledge-graph/outputs/p2-doc-extraction/module-episodes.json",
  JSON.stringify(graphitiEpisodes, null, 2)
);

console.log(`Extracted ${graphitiEpisodes.length} module episodes`);
// Show first few module names
console.log(
  "Modules:",
  episodes
    .slice(0, 10)
    .map((e) => e.name)
    .join(", "),
  "..."
);
