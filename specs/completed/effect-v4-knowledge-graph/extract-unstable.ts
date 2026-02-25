/**
 * Extract function/type episodes from Effect v4 unstable module source files.
 * Covers CLI, HTTP, AI, SQL, and other unstable submodules.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";
import * as O from "effect/Option";
import * as Str from "effect/String";


const unstableDir = ".repos/effect-smol/packages/effect/src/unstable";
const outDir = "specs/pending/effect-v4-knowledge-graph/outputs/p3-ast-extraction";

interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

const allEpisodes: GraphitiEpisode[] = [];
const stats = { modules: 0, functions: 0, types: 0, skipped: 0, files: 0 };

// Get all subdirectories in unstable/
const subdirs = readdirSync(unstableDir).filter((f) => {
  const fullPath = join(unstableDir, f);
  return statSync(fullPath).isDirectory();
});

// Also get direct .ts files in unstable/
const directFiles = readdirSync(unstableDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");

// Process direct files
for (const file of directFiles) {
  processFile(join(unstableDir, file), `unstable/${Str.replace(".ts", "")(file)}`);
}

// Process subdirectories
for (const subdir of subdirs) {
  const dirPath = join(unstableDir, subdir);
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".ts") && f !== "index.ts");

  for (const file of files) {
    processFile(join(dirPath, file), `unstable/${subdir}/${Str.replace(".ts", "")(file)}`);
  }
}

function processFile(filePath: string, modulePrefix: string) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf-8");
  const moduleName = modulePrefix;

  // Match: JSDoc comment followed by export declaration
  const pattern =
    /\/\*\*\s*([\s\S]*?)\s*\*\/\s*\n\s*export\s+((?:declare\s+)?(?:const|function|type|interface|class|namespace|enum|abstract\s+class))\s+(\w+)/g;

  let match: RegExpExecArray | null;
  let count = 0;

  while ((match = pattern.exec(content)) !== null) {
    const jsdoc = match[1];
    const kindRaw = Str.trim(Str.replace("abstract ", "")(Str.replace("declare ", "")(match[2])));
    const name = match[3];

    if (name.startsWith("_")) continue;
    if (name.endsWith("TypeLambda") || name.endsWith("UnifyIgnore")) continue;

    const description = extractDescription(jsdoc);
    const category = extractTag(jsdoc, "category") || "uncategorized";
    const since = extractTag(jsdoc, "since") || "unknown";
    const example = extractExample(jsdoc);

    const isType = ["type", "interface", "namespace", "enum", "class"].includes(kindRaw);
    if (isType) stats.types++;
    else stats.functions++;

    let body = `Title: ${moduleName}.${name}\n`;
    body += `Category: ${isType ? "type" : "function"}\n`;
    body += `Module Path: effect/${moduleName}\n`;
    body += `Export Kind: ${kindRaw}\n`;
    body += `Category Tag: ${category}\n`;
    body += `Stability: unstable\n\n`;

    if (description) body += `Description: ${description}\n\n`;
    if (example) body += `Example:\n${example}\n\n`;
    body += `Since: ${since}`;

    allEpisodes.push({
      name: `Effect v4 ${isType ? "Type" : "Function"}: ${moduleName}.${name}`,
      episode_body: body,
      source: "text",
      source_description: `Effect v4 unstable ${moduleName} module`,
      group_id: "effect-v4",
    });

    count++;
  }

  if (count > 0) {
    stats.modules++;
    stats.files++;
  }
}

function extractDescription(jsdoc: string): string {
  const lines = Str.split("\n")(jsdoc).map((l) => Str.replace(/^\s*\*\s?/, "")(l));
  const result: string[] = [];
  for (const line of lines) {
    if (line.startsWith("@")) break;
    if (line.startsWith("**Example**") || line.startsWith("```")) break;
    result.push(line);
  }
  return Str.substring(0, 500)(Str.trim(Str.replace(/\{@link\s+(\w+)\s+([^}]+)\}/g, "$2")(Str.replace(/\{@link\s+(\w+)\}/g, "$1")(Str.replace(/\s+/g, " ")(result
    .join(" "))))));
}

function extractTag(jsdoc: string, tag: string): string {
  const m = O.getOrNull(O.fromNullishOr(Str.match(new RegExp(`@${tag}\\s+(.+)`))(jsdoc)));
  return m ? Str.trim(m[1]) : "";
}

function extractExample(jsdoc: string): string {
  const lines = Str.split("\n")(jsdoc).map((l) => Str.replace(/^\s*\*\s?/, "")(l));
  let inExample = false,
    inCode = false;
  const result: string[] = [];
  for (const line of lines) {
    if (line.includes("**Example**") || line.includes("@example")) {
      inExample = true;
      continue;
    }
    if (inExample && line.startsWith("```")) {
      if (inCode) {
        result.push(line);
        break;
      }
      inCode = true;
      result.push(line);
      continue;
    }
    if (inCode) result.push(line);
  }
  return Str.substring(0, 500)(result.join("\n"));
}

// Write output
writeFileSync(join(outDir, "unstable-episodes.json"), JSON.stringify(allEpisodes, null, 2));

console.log(`Unstable extraction complete:`);
console.log(`  Files processed: ${stats.files}`);
console.log(`  Functions: ${stats.functions}`);
console.log(`  Types: ${stats.types}`);
console.log(`  Total episodes: ${allEpisodes.length}`);
console.log(`  Subdirectories: ${subdirs.join(", ")}`);
