/**
 * Extract function/type episodes from Effect v4 stable module source files.
 * Parses JSDoc + export declarations to generate structured episodes for Graphiti.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const srcDir = ".repos/effect-smol/packages/effect/src";
const outDir = "specs/pending/effect-v4-knowledge-graph/outputs/p3-ast-extraction";

interface ExportInfo {
  name: string;
  kind: "function" | "type" | "interface" | "class" | "const" | "namespace" | "enum";
  description: string;
  category: string;
  since: string;
  example: string;
  signature: string;
  moduleName: string;
}

interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

// Get all .ts files in src (stable modules only, not internal/)
const moduleFiles = readdirSync(srcDir)
  .filter((f) => f.endsWith(".ts") && !f.startsWith("internal"))
  .filter((f) => f !== "index.ts"); // Already handled by module extraction

const allEpisodes: GraphitiEpisode[] = [];
const stats = { modules: 0, functions: 0, types: 0, skipped: 0 };

for (const file of moduleFiles) {
  const filePath = join(srcDir, file);
  const moduleName = file.replace(".ts", "");
  const content = readFileSync(filePath, "utf-8");

  // Extract all JSDoc + export blocks
  const exports = extractExports(content, moduleName);

  if (exports.length === 0) {
    stats.skipped++;
    continue;
  }

  stats.modules++;

  for (const exp of exports) {
    const isType = ["type", "interface", "namespace", "enum"].includes(exp.kind);
    if (isType) stats.types++;
    else stats.functions++;

    const episode = formatEpisode(exp);
    allEpisodes.push(episode);
  }
}

function extractExports(content: string, moduleName: string): ExportInfo[] {
  const results: ExportInfo[] = [];

  // Match: JSDoc comment followed by export declaration
  // The JSDoc may span many lines, and the export can be various forms
  const pattern =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*\n\s*export\s+((?:declare\s+)?(?:const|function|type|interface|class|namespace|enum|abstract\s+class))\s+(\w+)/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const jsdoc = match[1];
    const kindRaw = match[2].replace("declare ", "").replace("abstract ", "").trim();
    const name = match[3];

    // Skip internal/private exports (starting with _)
    if (name.startsWith("_")) continue;

    // Skip TypeLambda, Unify types - low value for knowledge graph
    if (name.endsWith("TypeLambda") || name.endsWith("UnifyIgnore") || name.endsWith("Unify")) continue;

    // Extract JSDoc fields
    const description = extractDescription(jsdoc);
    const category = extractTag(jsdoc, "category") || "uncategorized";
    const since = extractTag(jsdoc, "since") || "unknown";
    const example = extractExample(jsdoc);

    // Extract signature (the line after the JSDoc closing)
    const sigStart = match.index + match[0].length;
    const sigEnd = content.indexOf("\n\n", sigStart);
    let signature = "";
    if (sigEnd > sigStart) {
      const sigBlock = content.substring(match.index + match[0].length - name.length, Math.min(sigEnd, sigStart + 500));
      // Clean up the signature - take first meaningful line(s)
      const sigLines = sigBlock
        .split("\n")
        .slice(0, 5)
        .map((l) => l.trim())
        .filter((l) => l);
      signature = sigLines.join(" ").substring(0, 300);
    }

    const kind = kindRaw as ExportInfo["kind"];

    results.push({
      name,
      kind,
      description,
      category,
      since,
      example,
      signature,
      moduleName,
    });
  }

  return results;
}

function extractDescription(jsdoc: string): string {
  const lines = jsdoc.split("\n").map((l) => l.replace(/^\s*\*\s?/, ""));

  const result: string[] = [];
  for (const line of lines) {
    if (line.startsWith("@")) break;
    if (line.startsWith("**Example**") || line.startsWith("```")) break;
    result.push(line);
  }

  return result
    .join(" ")
    .replace(/\s+/g, " ")
    .replace(/\{@link\s+(\w+)\}/g, "$1")
    .replace(/\{@link\s+(\w+)\s+([^}]+)\}/g, "$2")
    .trim()
    .substring(0, 500); // Cap description length
}

function extractTag(jsdoc: string, tag: string): string {
  const m = jsdoc.match(new RegExp(`@${tag}\\s+(.+)`));
  return m ? m[1].trim() : "";
}

function extractExample(jsdoc: string): string {
  const lines = jsdoc.split("\n").map((l) => l.replace(/^\s*\*\s?/, ""));

  let inExample = false;
  let inCode = false;
  const result: string[] = [];

  for (const line of lines) {
    if (line.includes("**Example**") || line.includes("@example")) {
      inExample = true;
      continue;
    }
    if (inExample && line.startsWith("```")) {
      if (inCode) {
        // End of code block
        result.push(line);
        break;
      }
      inCode = true;
      result.push(line);
      continue;
    }
    if (inCode) {
      result.push(line);
    }
  }

  return result.join("\n").substring(0, 500); // Cap example length
}

function formatEpisode(exp: ExportInfo): GraphitiEpisode {
  const isType = ["type", "interface", "namespace", "enum", "class"].includes(exp.kind);
  const category = isType ? "type" : "function";

  let body = `Title: ${exp.moduleName}.${exp.name}\n`;
  body += `Category: ${category}\n`;
  body += `Module Path: effect/${exp.moduleName}\n`;
  body += `Export Kind: ${exp.kind}\n`;
  body += `Category Tag: ${exp.category}\n\n`;

  if (exp.description) {
    body += `Description: ${exp.description}\n\n`;
  }

  if (exp.signature) {
    body += `Signature: ${exp.signature}\n\n`;
  }

  if (exp.example) {
    body += `Example:\n${exp.example}\n\n`;
  }

  body += `Since: ${exp.since}`;

  return {
    name: `Effect v4 ${isType ? "Type" : "Function"}: ${exp.moduleName}.${exp.name}`,
    episode_body: body,
    source: "text",
    source_description: `Effect v4 ${exp.moduleName} module ${category}`,
    group_id: "effect-v4",
  };
}

// Write output
writeFileSync(join(outDir, "function-episodes.json"), JSON.stringify(allEpisodes, null, 2));

// Write stats
const extractionLog = {
  timestamp: new Date().toISOString(),
  modulesProcessed: stats.modules,
  modulesSkipped: stats.skipped,
  totalEpisodes: allEpisodes.length,
  functions: stats.functions,
  types: stats.types,
  moduleBreakdown: {} as Record<string, number>,
};

// Count per module
for (const ep of allEpisodes) {
  const mod = ep.episode_body.match(/Module Path: effect\/(\w+)/)?.[1] || "unknown";
  extractionLog.moduleBreakdown[mod] = (extractionLog.moduleBreakdown[mod] || 0) + 1;
}

writeFileSync(join(outDir, "extraction-log.json"), JSON.stringify(extractionLog, null, 2));

console.log(`Extraction complete:`);
console.log(`  Modules processed: ${stats.modules}`);
console.log(`  Modules skipped: ${stats.skipped}`);
console.log(`  Functions: ${stats.functions}`);
console.log(`  Types: ${stats.types}`);
console.log(`  Total episodes: ${allEpisodes.length}`);

// Show top 10 modules by export count
const sorted = Object.entries(extractionLog.moduleBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
console.log(`\nTop 10 modules by export count:`);
for (const [mod, count] of sorted) {
  console.log(`  ${mod}: ${count}`);
}
