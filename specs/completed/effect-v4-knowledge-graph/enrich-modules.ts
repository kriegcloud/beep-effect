/**
 * Enrich module episodes that lack descriptions by reading the module-level
 * JSDoc from each module's own .ts file, and aggregating exports by @category.
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SRC_DIR = ".repos/effect-smol/packages/effect/src";
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
  const modMatch = ep.episode_body.match(/Module Path: effect\/(\w+)/);
  if (!modMatch) continue;
  const mod = modMatch[1];
  const nameMatch = ep.episode_body.match(/Title: \w+\.(\w+)/);
  const catMatch = ep.episode_body.match(/Category Tag: (.+)/);
  const kindMatch = ep.episode_body.match(/Export Kind: (.+)/);
  const descMatch = ep.episode_body.match(/Description: (.+)/);

  if (!functionsByModule.has(mod)) functionsByModule.set(mod, []);
  functionsByModule.get(mod)!.push({
    name: nameMatch?.[1] || "unknown",
    category: catMatch?.[1]?.trim() || "uncategorized",
    kind: kindMatch?.[1]?.trim() || "unknown",
    desc: descMatch?.[1]?.trim().substring(0, 80) || "",
  });
}

let enriched = 0;
let alreadyRich = 0;

for (const ep of moduleEpisodes) {
  const modMatch = ep.episode_body.match(/Module Path: effect\/(\w+)/);
  if (!modMatch) continue;
  const moduleName = modMatch[1];

  // Check if already rich (has Mental Model or Description with content)
  const hasContent =
    ep.episode_body.includes("Mental Model:") ||
    (ep.episode_body.includes("Description:") && ep.episode_body.split("Description:")[1]?.trim().length > 20);

  if (hasContent) {
    // Already rich - just add export summary if missing
    if (!ep.episode_body.includes("Key Exports by Category:")) {
      const summary = buildExportSummary(moduleName);
      if (summary) {
        ep.episode_body = ep.episode_body.replace(/\nSince:/, `\n${summary}\nSince:`);
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
  const moduleJsdocMatch = content.match(/^\/\*\*([\s\S]*?)\*\//m);
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
  const sinceMatch = jsdoc.match(/@since\s+([\d.]+)/);
  body += `Since: ${sinceMatch ? sinceMatch[1] : "unknown"}`;

  ep.episode_body = body;
  enriched++;
}

function extractModuleDescription(jsdoc: string): string {
  const lines = jsdoc.split("\n").map((l) => l.replace(/^\s*\*\s?/, ""));
  const result: string[] = [];
  for (const line of lines) {
    if (line.startsWith("**") || line.startsWith("@") || line.startsWith("## ")) break;
    result.push(line);
  }
  return result
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\{@link\s+(\w+)\}/g, "$1")
    .replace(/\{@link\s+(\w+)\s+([^}]+)\}/g, "$2")
    .trim()
    .substring(0, 600);
}

function extractSection(jsdoc: string, heading: string): string {
  const lines = jsdoc.split("\n").map((l) => l.replace(/^\s*\*\s?/, ""));
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
  return result
    .join("\n")
    .replace(/\{@link\s+(\w+)\}/g, "$1")
    .replace(/\{@link\s+(\w+)\s+([^}]+)\}/g, "$2")
    .trim()
    .substring(0, 1000);
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

  return summary.trim();
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
