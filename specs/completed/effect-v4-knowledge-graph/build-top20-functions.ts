/**
 * Build a filtered function episodes file containing only the top 20 most
 * important modules. This balances coverage vs ingestion cost.
 */
import { readFileSync, writeFileSync } from "fs";
import * as O from "effect/Option";
import * as Str from "effect/String";


const BASE = "specs/pending/effect-v4-knowledge-graph/outputs";

interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

// Top 20 modules by importance for the Effect v4 knowledge graph
const TOP_20_MODULES = new Set([
  "Effect",
  "Schema",
  "Stream",
  "Array",
  "Option",
  "Layer",
  "ServiceMap",
  "Result",
  "Fiber",
  "Scope",
  "Ref",
  "Cause",
  "Channel",
  "Chunk",
  "Config",
  "DateTime",
  "Deferred",
  "HashMap",
  "Queue",
  "Schedule",
]);

const allFunctions: GraphitiEpisode[] = JSON.parse(
  readFileSync(`${BASE}/p3-ast-extraction/function-episodes.json`, "utf-8")
);

const filtered = allFunctions.filter((ep) => {
  const modMatch = O.getOrNull(O.fromNullishOr(Str.match(/Module Path: effect\/(\w+)/)(ep.episode_body)));
  return modMatch && TOP_20_MODULES.has(modMatch[1]);
});

writeFileSync(`${BASE}/p3-ast-extraction/function-episodes-top20.json`, JSON.stringify(filtered, null, 2));

// Count per module
const byModule = new Map<string, number>();
for (const ep of filtered) {
  const mod = O.getOrNull(O.fromNullishOr(Str.match(/Module Path: effect\/(\w+)/)(ep.episode_body)))?.[1] || "unknown";
  byModule.set(mod, (byModule.get(mod) || 0) + 1);
}

console.log(`Top 20 module function subset: ${filtered.length} episodes (from ${allFunctions.length} total)`);
for (const [mod, count] of [...byModule.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${mod}: ${count}`);
}
