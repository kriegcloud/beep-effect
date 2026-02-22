/**
 * Build a curated dry-run subset of ~15 episodes spanning all episode types,
 * for validating Graphiti extraction quality before full ingestion.
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const BASE = "specs/pending/effect-v4-knowledge-graph/outputs";

interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

function loadJson(path: string): GraphitiEpisode[] {
  return JSON.parse(readFileSync(join(BASE, path), "utf-8"));
}

const dryRunEpisodes: GraphitiEpisode[] = [];

// 1. Seed episode
const SEED: GraphitiEpisode = {
  name: "Effect v4 Core Concepts Overview",
  episode_body: `Title: Effect v4 Core Concepts Overview
Category: concept

Effect v4 (beta) is a comprehensive TypeScript library for building type-safe, composable applications.
It provides a unified package "effect" that replaces the previous multi-package structure (@effect/platform, @effect/cli, etc.).

Core Modules:
- Effect: The central type representing effectful computations with typed errors and dependencies
- Schema: Runtime validation, encoding/decoding with type inference
- Stream: Lazy, composable streaming with backpressure
- Layer: Dependency injection through composable service layers
- ServiceMap: Service definition and management (replaces v3's Context.Tag)
- Option: Type-safe optional values (replaces null/undefined)
- Result: Type-safe error handling (replaces Either from v3)
- Fiber: Lightweight concurrency primitives
- Scope: Resource lifecycle management
- Array: Immutable functional array operations

Key v4 Changes from v3:
- Context.Tag replaced by ServiceMap.Service
- Effect.catchAll replaced by Effect.catch
- Either renamed to Result
- Schema.decode replaced by Schema.decodeUnknownEffect
- FileSystem/Path moved to main "effect" package from @effect/platform
- Types that were Effect subtypes (Ref, Deferred, Fiber) now use Yieldable trait
- Layer.scoped removed, Layer.effect handles scoping automatically`,
  source: "text",
  source_description: "Effect v4 core concepts seed",
  group_id: "effect-v4",
};
dryRunEpisodes.push(SEED);

// 2. Two rich module episodes (Array, Effect)
const modules = loadJson("p2-doc-extraction/module-episodes.json");
const arrayEp = modules.find((e) => e.name === "Effect v4 Module: Array");
const effectEp = modules.find((e) => e.name === "Effect v4 Module: Effect");
const schemaEp = modules.find((e) => e.name === "Effect v4 Module: Schema");
if (arrayEp) dryRunEpisodes.push(arrayEp);
if (effectEp) dryRunEpisodes.push(effectEp);
if (schemaEp) dryRunEpisodes.push(schemaEp);

// 3. Three migration episodes (services, error-handling, yieldable)
const migrations = loadJson("p2-doc-extraction/migration-episodes.json");
const servicesMigration = migrations.find(
  (e) => e.name.includes("Context.Tag") || e.name.includes("ServiceMap.Service")
);
const errorMigration = migrations.find((e) => e.name.includes("catchAll") || e.name.includes("catch"));
const yieldMigration = migrations.find((e) => e.name.includes("Yieldable") || e.name.includes("yield"));
if (servicesMigration) dryRunEpisodes.push(servicesMigration);
if (errorMigration) dryRunEpisodes.push(errorMigration);
if (yieldMigration) dryRunEpisodes.push(yieldMigration);

// 4. Two correction episodes (Context.GenericTag, Schema.decode)
const enrichment = loadJson("p4-enrichment/enrichment-episodes.json");
const tagCorrection = enrichment.find((e) => e.name.includes("Context.GenericTag"));
const decodeCorrection = enrichment.find((e) => e.name.includes("Schema.decode"));
const platformCorrection = enrichment.find((e) => e.name.includes("@effect/platform"));
if (tagCorrection) dryRunEpisodes.push(tagCorrection);
if (decodeCorrection) dryRunEpisodes.push(decodeCorrection);
if (platformCorrection) dryRunEpisodes.push(platformCorrection);

// 5. One pattern episode
const patterns = loadJson("p2-doc-extraction/pattern-episodes.json");
const errorPattern = patterns.find((e) => e.name.toLowerCase().includes("error"));
if (errorPattern) dryRunEpisodes.push(errorPattern);

// 6. One doc episode (Schema section)
const docs = loadJson("p2-doc-extraction/doc-episodes.json");
const schemaDoc =
  docs.find((e) => e.name.includes("Schema") && e.name.includes("Struct")) ||
  docs.find((e) => e.name.includes("Schema"));
if (schemaDoc) dryRunEpisodes.push(schemaDoc);

// 7. Two function episodes (Effect.gen, Array.map)
const functions = loadJson("p3-ast-extraction/function-episodes.json");
const genFn = functions.find((e) => e.episode_body.includes("Title: Effect.gen"));
const mapFn = functions.find((e) => e.episode_body.includes("Title: Array.map\n"));
if (genFn) dryRunEpisodes.push(genFn);
if (mapFn) dryRunEpisodes.push(mapFn);

writeFileSync(join(BASE, "dry-run-episodes.json"), JSON.stringify(dryRunEpisodes, null, 2));

console.log(`Dry run subset: ${dryRunEpisodes.length} episodes`);
for (const ep of dryRunEpisodes) {
  console.log(`  [${ep.episode_body.length} chars] ${ep.name}`);
}
