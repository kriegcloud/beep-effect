/**
 * Enrich module episodes that lack descriptions by reading the module-level
 * JSDoc from each module's own .ts file, and aggregating exports by @category.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import * as O from "effect/Option";
import * as Str from "effect/String";


const SRC_DIR = ".repos/effect-v4/packages/effect/src";
const EPISODES_PATH = "specs/pending/effect-v4-knowledge-graph/outputs/p2-doc-extraction/module-episodes.json";
const FUNCTIONS_PATH = "specs/pending/effect-v4-knowledge-graph/outputs/p3-ast-extraction/function-episodes.json";

interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

// Load existing episodes
const moduleEpisodes: GraphitiEpisode[] = JSON.parse(readFileSync(EPISODES_PATH, "utf-8"));
const functionEpisodes: GraphitiEpisode[] = JSON.parse(readFileSync(FUNCTIONS_PATH, "utf-8"));

// Build function index by module
const functionsByModule = new Map<string, Array<{ name: string; category: string; kind: string; desc: string }>>();
for (const ep of functionEpisodes) {
  const modMatch = O.getOrNull(O.fromNullishOr(Str.match(/Module Path: effect\/(\w+)/)(ep.episode_body)));
  if (!modMatch) continue;
  const mod = modMatch[1];
  const nameMatch = O.getOrNull(O.fromNullishOr(Str.match(/Title: \w+\.(\w+)/)(ep.episode_body)));
  const catMatch = O.getOrNull(O.fromNullishOr(Str.match(/Category Tag: (.+)/)(ep.episode_body)));
  const kindMatch = O.getOrNull(O.fromNullishOr(Str.match(/Export Kind: (.+)/)(ep.episode_body)));
  const descMatch = O.getOrNull(O.fromNullishOr(Str.match(/Description: (.+)/)(ep.episode_body)));

  if (!functionsByModule.has(mod)) functionsByModule.set(mod, []);
  functionsByModule.get(mod)!.push({
    name: nameMatch?.[1] || "unknown",
    category: Str.trim(catMatch?.[1] ?? "") || "uncategorized",
    kind: Str.trim(kindMatch?.[1] ?? "") || "unknown",
    desc: Str.substring(0, 80)(Str.trim(descMatch?.[1] ?? "")) || "",
  });
}

let enriched = 0;
let alreadyRich = 0;

for (const ep of moduleEpisodes) {
  const modMatch = O.getOrNull(O.fromNullishOr(Str.match(/Module Path: effect\/(\w+)/)(ep.episode_body)));
  if (!modMatch) continue;
  const moduleName = modMatch[1];

  // Check if already rich (has Mental Model or Description with content)
  const hasContent =
    ep.episode_body.includes("Mental Model:") ||
    (ep.episode_body.includes("Description:") &&
      Str.trim(Str.split("Description:")(ep.episode_body)[1] ?? "").length > 20);

  if (hasContent) {
    // Already rich - just add export summary if missing
    if (!ep.episode_body.includes("Key Exports by Category:")) {
      const summary = buildExportSummary(moduleName);
      if (summary) {
        ep.episode_body = Str.replace(/\nSince:/, `\n${summary}\nSince:`)(ep.episode_body);
      }
    }
    alreadyRich++;
    continue;
  }

  // Read the module file to get the module-level JSDoc
  const filePath = join(SRC_DIR, `${moduleName}.ts`);
  if (!existsSync(filePath)) continue;

  const content = readFileSync(filePath, "utf-8");

  // Extract module-level JSDoc (first JSDoc block in the file, before any import/export)
  const moduleJsdocMatch = O.getOrNull(O.fromNullishOr(Str.match(/^\/\*\*([\s\S]*?)\*\//m)(content)));
  if (!moduleJsdocMatch) continue;

  const jsdoc = moduleJsdocMatch[1];
  const description = extractModuleDescription(jsdoc);
  const exportSummary = buildExportSummary(moduleName);

  if (!description && !exportSummary) continue;

  // Rebuild the episode body
  let body = `Title: ${moduleName} Module\nCategory: module\nModule Path: effect/${moduleName}\n\n`;

  if (description) {
    body += `Description: ${description}\n\n`;
  }

  // Extract mental model, common tasks, gotchas from module JSDoc if present
  const mentalModel = extractSection(jsdoc, "Mental model");
  const commonTasks = extractSection(jsdoc, "Common tasks");
  const gotchas = extractSection(jsdoc, "Gotchas");
  const quickstart = extractSection(jsdoc, "Quickstart");

  if (mentalModel) body += `Mental Model:\n${mentalModel}\n\n`;
  if (commonTasks) body += `Common Tasks:\n${commonTasks}\n\n`;
  if (gotchas) body += `Gotchas:\n${gotchas}\n\n`;
  if (quickstart) body += `Quickstart:\n${quickstart}\n\n`;

  if (exportSummary) body += `${exportSummary}\n\n`;

  // Extract since
  const sinceMatch = O.getOrNull(O.fromNullishOr(Str.match(/@since\s+([\d.]+)/)(jsdoc)));
  body += `Since: ${sinceMatch ? sinceMatch[1] : "unknown"}`;

  ep.episode_body = body;
  enriched++;
}

function extractModuleDescription(jsdoc: string): string {
  const lines = Str.split("\n")(jsdoc).map((l) => Str.replace(/^\s*\*\s?/, "")(l));
  const result: string[] = [];
  for (const line of lines) {
    if (line.startsWith("**") || line.startsWith("@") || line.startsWith("## ")) break;
    result.push(line);
  }
  return Str.substring(0, 600)(Str.trim(Str.replace(/\{@link\s+(\w+)\s+([^}]+)\}/g, "$2")(Str.replace(/\{@link\s+(\w+)\}/g, "$1")(Str.replace(/\s+/g, " ")(result
    .join(" "))))));
}

function extractSection(jsdoc: string, heading: string): string {
  const lines = Str.split("\n")(jsdoc).map((l) => Str.replace(/^\s*\*\s?/, "")(l));
  let inSection = false;
  const result: string[] = [];
  for (const line of lines) {
    if (line.includes(`**${heading}**`) || line.startsWith(`## ${heading}`)) {
      inSection = true;
      continue;
    }
    if (inSection && (line.startsWith("**") || line.startsWith("@") || line.startsWith("## "))) break;
    if (inSection) result.push(line);
  }
  return Str.substring(0, 1000)(Str.trim(Str.replace(/\{@link\s+(\w+)\s+([^}]+)\}/g, "$2")(Str.replace(/\{@link\s+(\w+)\}/g, "$1")(result
    .join("\n")))));
}

function buildExportSummary(moduleName: string): string {
  const exports = functionsByModule.get(moduleName);
  if (!exports || exports.length === 0) return "";

  // Group by category
  const byCategory = new Map<string, string[]>();
  for (const exp of exports) {
    if (!byCategory.has(exp.category)) byCategory.set(exp.category, []);
    byCategory.get(exp.category)!.push(exp.name);
  }

  let summary = `Key Exports by Category (${exports.length} total):\n`;
  for (const [cat, names] of byCategory.entries()) {
    const displayed = names.slice(0, 8).join(", ");
    const more = names.length > 8 ? `, ... (${names.length} total)` : "";
    summary += `- ${cat}: ${displayed}${more}\n`;
  }

  return Str.trim(summary);
}

// Write enriched episodes
writeFileSync(EPISODES_PATH, JSON.stringify(moduleEpisodes, null, 2));

console.log(`Module enrichment complete:`);
console.log(`  Already rich: ${alreadyRich}`);
console.log(`  Enriched: ${enriched}`);
console.log(`  Total: ${moduleEpisodes.length}`);

// Verify - count episodes that are still short
const stillShort = moduleEpisodes.filter((ep) => ep.episode_body.length < 150).length;
console.log(`  Still short (<150 chars): ${stillShort}`);
