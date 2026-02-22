/**
 * Ingest episodes into Graphiti via direct HTTP calls to the MCP endpoint.
 *
 * Usage: bun run ingest.ts [--batch <name>] [--limit <n>] [--delay <ms>] [--dry-run] [--skip <n>]
 *
 * Batches (in recommended order):
 *   seed        - Core Effect v4 seed episode
 *   modules     - Module-level JSDoc from index.ts (~125)
 *   migrations  - Migration guides (~50)
 *   patterns    - Pattern guide episodes
 *   docs        - Markdown documentation episodes
 *   enrichment  - API corrections, specs, blog
 *   functions   - Function/type episodes from stable modules (~4000)
 *   unstable    - Function/type episodes from unstable modules (~2600)
 *   all         - All batches in order
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const BASE_DIR = "specs/pending/effect-v4-knowledge-graph";
const OUT_DIR = join(BASE_DIR, "outputs/p5-graph-pipeline");
const MCP_URL = "http://localhost:8000/mcp";
const GROUP_ID = "effect-v4";

interface GraphitiEpisode {
  name: string;
  episode_body: string;
  source: string;
  source_description: string;
  group_id: string;
}

interface IngestionLog {
  timestamp: string;
  batch: string;
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  durationMs: number;
  errors: Array<{ index: number; name: string; error: string }>;
}

// Parse CLI args
const args = process.argv.slice(2);
const batchName = getArg("--batch") || "all";
const limit = Number.parseInt(getArg("--limit") || "0");
const delay = Number.parseInt(getArg("--delay") || "2000");
const dryRun = args.includes("--dry-run");
const skip = Number.parseInt(getArg("--skip") || "0");

function getArg(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

// Seed episode - establishes core entities
const SEED_EPISODE: GraphitiEpisode = {
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
- Chunk: Efficient immutable indexed sequences for streaming
- Channel: Bidirectional communication for complex stream operations

Key v4 Changes from v3:
- Context.Tag replaced by ServiceMap.Service
- Effect.catchAll replaced by Effect.catch
- Either renamed to Result
- Schema.decode replaced by Schema.decodeUnknownEffect
- FileSystem/Path moved to main "effect" package from @effect/platform
- Types that were Effect subtypes (Ref, Deferred, Fiber) now use Yieldable trait
- Layer.scoped removed, Layer.effect handles scoping automatically

Unstable Subsystems (effect/unstable/*):
- cli: Command-line interface framework (Command, Flag, Argument)
- http: HTTP client and server
- httpapi: Declarative HTTP API framework
- sql: Database access
- ai: LLM integration
- rpc: Remote procedure calls
- schema: Extended schema utilities
- socket: WebSocket support
- process: Child process management
- observability: OpenTelemetry integration
- cluster: Distributed computing primitives`,
  source: "text",
  source_description: "Effect v4 core concepts seed",
  group_id: GROUP_ID,
};

// Define batch sources
const BATCHES: Record<string, () => GraphitiEpisode[]> = {
  seed: () => [SEED_EPISODE],
  modules: () => loadJson("outputs/p2-doc-extraction/module-episodes.json"),
  migrations: () => loadJson("outputs/p2-doc-extraction/migration-episodes.json"),
  patterns: () => loadJson("outputs/p2-doc-extraction/pattern-episodes.json"),
  docs: () => loadJson("outputs/p2-doc-extraction/doc-episodes.json"),
  enrichment: () => loadJson("outputs/p4-enrichment/enrichment-episodes.json"),
  functions: () => loadJson("outputs/p3-ast-extraction/function-episodes.json"),
  unstable: () => loadJson("outputs/p3-ast-extraction/unstable-episodes.json"),
};

function loadJson(path: string): GraphitiEpisode[] {
  const fullPath = join(BASE_DIR, path);
  if (!existsSync(fullPath)) {
    console.warn(`  Warning: ${path} not found, skipping`);
    return [];
  }
  return JSON.parse(readFileSync(fullPath, "utf-8"));
}

// MCP call to add_memory
async function addMemory(episode: GraphitiEpisode): Promise<boolean> {
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: "add_memory",
      arguments: {
        name: episode.name,
        episode_body: episode.episode_body,
        source: episode.source,
        source_description: episode.source_description,
        group_id: episode.group_id,
      },
    },
  };

  try {
    const resp = await fetch(MCP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
    }

    const data = (await resp.json()) as any;
    if (data.error) {
      throw new Error(`MCP error: ${JSON.stringify(data.error)}`);
    }

    return true;
  } catch (e: any) {
    throw e;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ingestBatch(name: string, episodes: GraphitiEpisode[]): Promise<IngestionLog> {
  const start = Date.now();
  const log: IngestionLog = {
    timestamp: new Date().toISOString(),
    batch: name,
    total: episodes.length,
    succeeded: 0,
    failed: 0,
    skipped: skip,
    durationMs: 0,
    errors: [],
  };

  // Apply skip and limit
  let toProcess = episodes.slice(skip);
  if (limit > 0) toProcess = toProcess.slice(0, limit);

  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `Batch: ${name} (${toProcess.length} episodes${skip > 0 ? `, skipping first ${skip}` : ""}${limit > 0 ? `, limit ${limit}` : ""})`
  );
  console.log(`${"=".repeat(60)}`);

  for (let i = 0; i < toProcess.length; i++) {
    const ep = toProcess[i];
    const globalIdx = skip + i;
    const progress = `[${i + 1}/${toProcess.length}]`;

    if (dryRun) {
      console.log(`  ${progress} DRY RUN: ${ep.name} (${ep.episode_body.length} chars)`);
      log.succeeded++;
      continue;
    }

    try {
      process.stdout.write(`  ${progress} ${ep.name.substring(0, 60)}...`);
      await addMemory(ep);
      console.log(` OK`);
      log.succeeded++;
    } catch (e: any) {
      console.log(` FAIL: ${e.message.substring(0, 80)}`);
      log.failed++;
      log.errors.push({ index: globalIdx, name: ep.name, error: e.message });
    }

    // Delay between episodes
    if (i < toProcess.length - 1 && !dryRun) {
      await sleep(delay);
    }
  }

  log.durationMs = Date.now() - start;
  console.log(
    `\nBatch "${name}" complete: ${log.succeeded} OK, ${log.failed} failed in ${(log.durationMs / 1000).toFixed(1)}s`
  );

  return log;
}

async function main() {
  console.log(`Effect v4 KG Ingestion`);
  console.log(`MCP endpoint: ${MCP_URL}`);
  console.log(`Group ID: ${GROUP_ID}`);
  console.log(`Delay: ${delay}ms`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log();

  const allLogs: IngestionLog[] = [];

  if (batchName === "all") {
    const order = ["seed", "modules", "migrations", "patterns", "docs", "enrichment", "functions", "unstable"];
    for (const name of order) {
      const episodes = BATCHES[name]();
      if (episodes.length > 0) {
        const log = await ingestBatch(name, episodes);
        allLogs.push(log);
      }
    }
  } else if (BATCHES[batchName]) {
    const episodes = BATCHES[batchName]();
    const log = await ingestBatch(batchName, episodes);
    allLogs.push(log);
  } else {
    console.error(`Unknown batch: ${batchName}. Available: ${Object.keys(BATCHES).join(", ")}, all`);
    process.exit(1);
  }

  // Write ingestion log
  const logPath = join(OUT_DIR, "ingestion-log.json");
  const existing = existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf-8")) : [];
  const updated = [...existing, ...allLogs];
  writeFileSync(logPath, JSON.stringify(updated, null, 2));

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log(`${"=".repeat(60)}`);
  let totalOk = 0,
    totalFail = 0,
    totalMs = 0;
  for (const log of allLogs) {
    console.log(
      `  ${log.batch}: ${log.succeeded}/${log.total} (${log.failed} failed) in ${(log.durationMs / 1000).toFixed(1)}s`
    );
    totalOk += log.succeeded;
    totalFail += log.failed;
    totalMs += log.durationMs;
  }
  console.log(`  TOTAL: ${totalOk} OK, ${totalFail} failed in ${(totalMs / 1000).toFixed(1)}s`);

  // Write graph stats
  writeFileSync(
    join(OUT_DIR, "graph-stats.json"),
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalIngested: totalOk,
        totalFailed: totalFail,
        totalDurationMs: totalMs,
        batchResults: allLogs.map((l) => ({
          batch: l.batch,
          ingested: l.succeeded,
          failed: l.failed,
          durationMs: l.durationMs,
        })),
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
