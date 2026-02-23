#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_BASE_URL = "https://api.getzep.com/api/v2";
const OUTPUT_BASE = "specs/completed/effect-v4-knowledge-graph/outputs";
const REPORT_DIR = join(OUTPUT_BASE, "p5-graph-pipeline");
const REPORT_PATH = join(REPORT_DIR, "zep-ingestion-log.json");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeFull = args.includes("--include-full");
const includeUnstable = args.includes("--include-unstable");
const delayMs = Number.parseInt(getArg("--delay") ?? "0", 10);
const limit = Number.parseInt(getArg("--limit") ?? "0", 10);
const skip = Number.parseInt(getArg("--skip") ?? "0", 10);
const onlyBatch = getArg("--batch");
const graphId = getArg("--graph-id") ?? process.env.GRAPH_ID ?? "effect-v4";
const baseUrl = stripTrailingSlash(getArg("--base-url") ?? process.env.ZEP_BASE_URL ?? DEFAULT_BASE_URL);
const apiKey = process.env.ZEP_API_KEY;

function getArg(name) {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : undefined;
}

function stripTrailingSlash(value) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function loadSeedEpisode() {
  const path = join(OUTPUT_BASE, "dry-run-episodes.json");
  const records = readJson(path);
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error(`Seed file has no episodes: ${path}`);
  }
  return [records[0]];
}

function loadEpisodes(path) {
  if (!existsSync(path)) {
    return [];
  }
  const records = readJson(path);
  if (!Array.isArray(records)) {
    throw new Error(`Expected array in ${path}`);
  }
  return records;
}

const BATCH_LOADERS = {
  seed: () => loadSeedEpisode(),
  modules: () => loadEpisodes(join(OUTPUT_BASE, "p2-doc-extraction/module-episodes.json")),
  migrations: () => loadEpisodes(join(OUTPUT_BASE, "p2-doc-extraction/migration-episodes.json")),
  patterns: () => loadEpisodes(join(OUTPUT_BASE, "p2-doc-extraction/pattern-episodes.json")),
  docs: () => loadEpisodes(join(OUTPUT_BASE, "p2-doc-extraction/doc-episodes.json")),
  enrichment: () => loadEpisodes(join(OUTPUT_BASE, "p4-enrichment/enrichment-episodes.json")),
  functions_top20: () => loadEpisodes(join(OUTPUT_BASE, "p3-ast-extraction/function-episodes-top20.json")),
  functions_full: () => loadEpisodes(join(OUTPUT_BASE, "p3-ast-extraction/function-episodes.json")),
  unstable: () => loadEpisodes(join(OUTPUT_BASE, "p3-ast-extraction/unstable-episodes.json")),
};

function selectedOrder() {
  if (onlyBatch) {
    if (!(onlyBatch in BATCH_LOADERS)) {
      throw new Error(`Unknown batch "${onlyBatch}". Available: ${Object.keys(BATCH_LOADERS).join(", ")}`);
    }
    return [onlyBatch];
  }

  const base = ["seed", "modules", "migrations", "patterns", "docs", "enrichment", "functions_top20"];
  if (includeFull) {
    base.push("functions_full");
  }
  if (includeUnstable) {
    base.push("unstable");
  }
  return base;
}

function toRequestBody(episode) {
  return {
    data: episode.episode_body,
    type: "text",
    graph_id: graphId,
    source_description: `${episode.name} | ${episode.source_description ?? "unknown"}`,
  };
}

async function ensureGraphExists() {
  const getResponse = await fetch(`${baseUrl}/graph/${encodeURIComponent(graphId)}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (getResponse.status === 404) {
    const createResponse = await fetch(`${baseUrl}/graph/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        graph_id: graphId,
        name: graphId,
        description: "Effect v4 graph imported from local knowledge graph artifacts",
      }),
    });
    if (!createResponse.ok) {
      const text = await createResponse.text();
      throw new Error(`Failed to create graph ${graphId}: HTTP ${createResponse.status} ${text}`);
    }
    console.log(`Created graph "${graphId}"`);
    return;
  }

  if (!getResponse.ok) {
    const text = await getResponse.text();
    throw new Error(`Failed to fetch graph ${graphId}: HTTP ${getResponse.status} ${text}`);
  }

  console.log(`Using existing graph "${graphId}"`);
}

function authHeaders() {
  return {
    Authorization: `Api-Key ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addEpisode(episode) {
  const response = await fetch(`${baseUrl}/graph`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(toRequestBody(episode)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function runBatch(batchName, episodes) {
  const batchStart = Date.now();
  const log = {
    timestamp: new Date().toISOString(),
    graphId,
    batch: batchName,
    totalLoaded: episodes.length,
    totalProcessed: 0,
    succeeded: 0,
    failed: 0,
    skipped: skip,
    durationMs: 0,
    errors: [],
  };

  let work = episodes.slice(skip);
  if (limit > 0) {
    work = work.slice(0, limit);
  }
  log.totalProcessed = work.length;

  console.log(`\n${"=".repeat(72)}`);
  console.log(`Batch ${batchName}: ${work.length} episodes (${episodes.length} loaded)`);
  console.log(`${"=".repeat(72)}`);

  for (let i = 0; i < work.length; i++) {
    const episode = work[i];
    const label = `[${i + 1}/${work.length}]`;

    if (dryRun) {
      console.log(`${label} DRY-RUN ${episode.name}`);
      log.succeeded += 1;
      continue;
    }

    try {
      process.stdout.write(`${label} ${episode.name.slice(0, 80)}...`);
      await addEpisode(episode);
      process.stdout.write(" OK\n");
      log.succeeded += 1;
    } catch (error) {
      process.stdout.write(" FAIL\n");
      const message = error instanceof Error ? error.message : String(error);
      console.error(`    ${message.slice(0, 400)}`);
      log.failed += 1;
      log.errors.push({
        index: skip + i,
        name: episode.name,
        error: message,
      });
    }

    if (delayMs > 0 && i < work.length - 1) {
      await sleep(delayMs);
    }
  }

  log.durationMs = Date.now() - batchStart;
  console.log(
    `Batch ${batchName} done: ${log.succeeded} OK, ${log.failed} failed in ${(log.durationMs / 1000).toFixed(1)}s`
  );
  return log;
}

function appendReport(logs) {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const current = existsSync(REPORT_PATH) ? readJson(REPORT_PATH) : [];
  const next = Array.isArray(current) ? [...current, ...logs] : logs;
  writeFileSync(REPORT_PATH, JSON.stringify(next, null, 2));
}

function printUsage() {
  console.log(`
Usage:
  bun run scripts/zep-ingest-effect-v4.mjs [options]

Options:
  --dry-run             Do not call Zep, just print planned ingestion
  --batch <name>        Run one batch only
  --limit <n>           Limit episodes processed per selected batch
  --skip <n>            Skip the first n episodes per selected batch
  --delay <ms>          Delay between episode requests (default 0)
  --graph-id <id>       Override graph id (defaults to GRAPH_ID or effect-v4)
  --base-url <url>      Override Zep API base URL
  --include-full        Include full stable function batch (4052 episodes)
  --include-unstable    Include unstable function batch (2643 episodes)
`);
}

async function main() {
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  if (!dryRun && !apiKey) {
    throw new Error("ZEP_API_KEY is required unless --dry-run is enabled");
  }

  const order = selectedOrder();
  const allLogs = [];

  console.log("Zep graph ingestion from local Effect v4 artifacts");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Graph ID: ${graphId}`);
  console.log(`Mode: ${dryRun ? "DRY-RUN" : "LIVE"}`);
  console.log(`Batches: ${order.join(", ")}`);

  if (!dryRun) {
    await ensureGraphExists();
  }

  for (const batchName of order) {
    const loader = BATCH_LOADERS[batchName];
    const episodes = loader();
    if (episodes.length === 0) {
      console.log(`Skipping ${batchName}: no episodes`);
      continue;
    }
    const log = await runBatch(batchName, episodes);
    allLogs.push(log);
  }

  appendReport(allLogs);

  const totalSucceeded = allLogs.reduce((sum, log) => sum + log.succeeded, 0);
  const totalFailed = allLogs.reduce((sum, log) => sum + log.failed, 0);
  const totalProcessed = allLogs.reduce((sum, log) => sum + log.totalProcessed, 0);
  const totalDurationMs = allLogs.reduce((sum, log) => sum + log.durationMs, 0);

  console.log(`\n${"=".repeat(72)}`);
  console.log("Summary");
  console.log(`${"=".repeat(72)}`);
  console.log(`Processed: ${totalProcessed}`);
  console.log(`Succeeded: ${totalSucceeded}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`Duration: ${(totalDurationMs / 1000).toFixed(1)}s`);
  console.log(`Report: ${REPORT_PATH}`);

  if (totalFailed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: ${message}`);
  process.exit(1);
});
