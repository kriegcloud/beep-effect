#!/usr/bin/env node

/**
 * Merges all batch extraction results into enriched-web.json.
 * Also joins extraction data back onto the original master.json entries
 * and produces extraction-log.json with statistics.
 */

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SPEC = "/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/reverse-engineering-palantir-ontology";
const BATCH_DIR = join(SPEC, "outputs/p5-rag-enrichment/batches");
const MASTER_PATH = join(SPEC, "outputs/p2-web-research/master.json");
const CACHE_DIR = join(SPEC, "outputs/p5-rag-enrichment/cache");
const OUTPUT_DIR = join(SPEC, "outputs/p5-rag-enrichment");

const urlToHash = (url) => createHash("md5").update(url).digest("hex");

// 1. Load master.json for original entry data
const master = JSON.parse(readFileSync(MASTER_PATH, "utf-8"));
const masterByUrl = new Map();
master.forEach((e) => masterByUrl.set(e.url, e));

// 2. Find and load all batch result files
const resultFiles = readdirSync(BATCH_DIR)
  .filter((f) => f.match(/^batch-\d+-results\.json$/))
  .sort();

console.log(`Found ${resultFiles.length} batch result files`);

// Also include sample results if they exist
if (existsSync(join(BATCH_DIR, "sample-results.json"))) {
  console.log("(sample-results.json found but skipping — entries are duplicated in batch results)");
}

// 3. Merge all extraction results
const allExtractions = new Map(); // url -> extraction data
let totalEntities = 0;
let totalRelationships = 0;
let totalInsights = 0;

for (const file of resultFiles) {
  const results = JSON.parse(readFileSync(join(BATCH_DIR, file), "utf-8"));
  console.log(`  ${file}: ${results.length} entries`);
  for (const r of results) {
    if (!r.url) continue;
    allExtractions.set(r.url, {
      extractedEntities: r.extractedEntities || [],
      extractedRelationships: r.extractedRelationships || [],
      keyInsights: r.keyInsights || [],
    });
    totalEntities += (r.extractedEntities || []).length;
    totalRelationships += (r.extractedRelationships || []).length;
    totalInsights += (r.keyInsights || []).length;
  }
}

console.log(`\nTotal extractions: ${allExtractions.size} entries`);
console.log(`Total entities: ${totalEntities}`);
console.log(`Total relationships: ${totalRelationships}`);
console.log(`Total insights: ${totalInsights}`);

// 4. Build enriched-web.json — merge original entries with extractions
const eligible = master.filter((e) => e.quality >= 2);
const enrichedEntries = [];
const extractionLog = [];

for (const entry of eligible) {
  const extraction = allExtractions.get(entry.url);
  const cachePath = join(CACHE_DIR, `${urlToHash(entry.url)}.txt`);
  const hasCachedContent = existsSync(cachePath);
  const contentLength = hasCachedContent ? readFileSync(cachePath, "utf-8").length : 0;

  if (extraction) {
    // Merge original entry with extraction data
    enrichedEntries.push({
      ...entry,
      extractedEntities: extraction.extractedEntities,
      extractedRelationships: extraction.extractedRelationships,
      keyInsights: extraction.keyInsights,
    });
    extractionLog.push({
      url: entry.url,
      status: "extracted",
      entityCount: extraction.extractedEntities.length,
      relationshipCount: extraction.extractedRelationships.length,
      insightCount: extraction.keyInsights.length,
      contentLength,
    });
  } else if (contentLength <= 200) {
    // Skipped — no/tiny content
    extractionLog.push({
      url: entry.url,
      status: "skipped_no_content",
      entityCount: 0,
      relationshipCount: 0,
      insightCount: 0,
      contentLength,
    });
  } else {
    // Had content but no extraction (missing batch result)
    extractionLog.push({
      url: entry.url,
      status: "missing_extraction",
      entityCount: 0,
      relationshipCount: 0,
      insightCount: 0,
      contentLength,
    });
  }
}

// 5. Compute statistics
const entityTypes = {};
const relationshipTypes = {};
enrichedEntries.forEach((e) => {
  (e.extractedEntities || []).forEach((ent) => {
    entityTypes[ent.type] = (entityTypes[ent.type] || 0) + 1;
  });
  (e.extractedRelationships || []).forEach((rel) => {
    relationshipTypes[rel.relationship] = (relationshipTypes[rel.relationship] || 0) + 1;
  });
});

const stats = {
  totalEligible: eligible.length,
  totalExtracted: extractionLog.filter((l) => l.status === "extracted").length,
  totalSkipped: extractionLog.filter((l) => l.status === "skipped_no_content").length,
  totalMissing: extractionLog.filter((l) => l.status === "missing_extraction").length,
  totalEntities,
  totalRelationships,
  totalInsights,
  avgEntitiesPerEntry:
    Math.round((totalEntities / Math.max(1, extractionLog.filter((l) => l.status === "extracted").length)) * 10) / 10,
  avgRelationshipsPerEntry:
    Math.round((totalRelationships / Math.max(1, extractionLog.filter((l) => l.status === "extracted").length)) * 10) /
    10,
  avgInsightsPerEntry:
    Math.round((totalInsights / Math.max(1, extractionLog.filter((l) => l.status === "extracted").length)) * 10) / 10,
  entityTypeDistribution: entityTypes,
  relationshipTypeDistribution: relationshipTypes,
};

console.log("\n=== Statistics ===");
console.log(JSON.stringify(stats, null, 2));

// 6. Write outputs
writeFileSync(join(OUTPUT_DIR, "enriched-web.json"), JSON.stringify(enrichedEntries, null, 2));
console.log(`\nWrote enriched-web.json (${enrichedEntries.length} entries)`);

writeFileSync(join(OUTPUT_DIR, "extraction-log.json"), JSON.stringify({ stats, entries: extractionLog }, null, 2));
console.log(`Wrote extraction-log.json`);
