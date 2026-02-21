#!/usr/bin/env node
/**
 * Prepares self-contained batch files for agent extraction.
 * Each batch contains entries + their cached content, ready for an agent to process.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const SPEC = "/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/reverse-engineering-palantir-ontology";
const CACHE_DIR = join(SPEC, "outputs/p5-rag-enrichment/cache");
const BATCH_DIR = join(SPEC, "outputs/p5-rag-enrichment/batches");
const MASTER_PATH = join(SPEC, "outputs/p2-web-research/master.json");

const BATCH_SIZE = 15; // entries per batch
const MAX_CONTENT_CHARS = 4000; // truncate content per entry to fit agent context

mkdirSync(BATCH_DIR, { recursive: true });

const urlToHash = (url) => createHash("md5").update(url).digest("hex");

const master = JSON.parse(readFileSync(MASTER_PATH, "utf-8"));
const eligible = master.filter((e) => e.quality >= 2);

// Filter to entries with substantial cached content
const entries = eligible.filter((e) => {
  const p = join(CACHE_DIR, urlToHash(e.url) + ".txt");
  if (!existsSync(p)) return false;
  const content = readFileSync(p, "utf-8");
  return content.length > 200;
});

// Sort by quality descending (process best content first)
entries.sort((a, b) => b.quality - a.quality);

// Create batches
const batches = [];
for (let i = 0; i < entries.length; i += BATCH_SIZE) {
  const batch = entries.slice(i, i + BATCH_SIZE);
  batches.push(batch);
}

console.log(`Total entries: ${entries.length}`);
console.log(`Batches of ${BATCH_SIZE}: ${batches.length}`);

// Write each batch as a self-contained JSON
batches.forEach((batch, idx) => {
  const batchData = batch.map((entry) => {
    const cachePath = join(CACHE_DIR, urlToHash(entry.url) + ".txt");
    let content = readFileSync(cachePath, "utf-8");
    if (content.length > MAX_CONTENT_CHARS) {
      content = content.slice(0, MAX_CONTENT_CHARS) + "\n[...truncated]";
    }
    return {
      url: entry.url,
      title: entry.title,
      summary: entry.summary,
      category: entry.category,
      quality: entry.quality,
      tags: entry.tags,
      relatedConcepts: entry.relatedConcepts,
      content,
    };
  });

  const batchFile = join(BATCH_DIR, `batch-${String(idx).padStart(3, "0")}.json`);
  writeFileSync(batchFile, JSON.stringify(batchData, null, 2));
  console.log(
    `  batch-${String(idx).padStart(3, "0")}.json: ${batch.length} entries, qualities: ${batch.map((e) => e.quality).join(",")}`
  );
});

// Also write a sample batch (first 10 high-quality entries) for testing
const sampleData = entries.slice(0, 10).map((entry) => {
  const cachePath = join(CACHE_DIR, urlToHash(entry.url) + ".txt");
  let content = readFileSync(cachePath, "utf-8");
  if (content.length > MAX_CONTENT_CHARS) {
    content = content.slice(0, MAX_CONTENT_CHARS) + "\n[...truncated]";
  }
  return {
    url: entry.url,
    title: entry.title,
    summary: entry.summary,
    category: entry.category,
    quality: entry.quality,
    tags: entry.tags,
    relatedConcepts: entry.relatedConcepts,
    content,
  };
});
writeFileSync(join(BATCH_DIR, "sample.json"), JSON.stringify(sampleData, null, 2));
console.log(`\nSample batch (10 entries) written to sample.json`);
