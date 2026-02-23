#!/usr/bin/env node
/**
 * Ingest Effect v4 knowledge graph episodes into Supermemory
 * Uses a dedicated containerTag: "effect_v4_knowledge"
 *
 * Usage:
 *   node supermemory-ingest.mjs [--dry-run] [--batch modules|migrations|enrichment|patterns|docs] [--delay 500]
 */

import { readFile } from "node:fs/promises"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_URL = "https://api.supermemory.ai"
const CONTAINER_TAG = "effect_v4_knowledge"
const CREDS_PATH = resolve(
  process.env.HOME,
  ".supermemory-claude/credentials.json",
)

const ENTITY_CONTEXT = `Effect v4 TypeScript library API reference knowledge graph.

EXTRACT:
- API functions: name, module, signature, description, since version
- Migration changes: v3 pattern vs v4 pattern, reason for change, affected modules
- Corrections: incorrect patterns that LLMs hallucinate, correct v4 replacements
- Patterns: error handling, testing, module organization, platform integration
- Module overviews: exports, mental models, common tasks, gotchas

This is structured technical reference data for preventing LLM hallucination of outdated Effect v3 patterns.`

const BATCH_FILES = {
  migrations: "outputs/p2-doc-extraction/migration-episodes.json",
  enrichment: "outputs/p4-enrichment/enrichment-episodes.json",
  patterns: "outputs/p2-doc-extraction/pattern-episodes.json",
  modules: "outputs/p2-doc-extraction/module-episodes.json",
  docs: "outputs/p2-doc-extraction/doc-episodes.json",
}

async function loadCredentials() {
  const raw = await readFile(CREDS_PATH, "utf-8")
  return JSON.parse(raw)
}

async function loadEpisodes(batchName) {
  const filePath = resolve(__dirname, BATCH_FILES[batchName])
  const raw = await readFile(filePath, "utf-8")
  return JSON.parse(raw)
}

async function addMemory(apiKey, episode, index) {
  const body = {
    content: `${episode.name}\n\n${episode.episode_body}`,
    containerTag: CONTAINER_TAG,
    customId: `effect-v4-${episode.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase().slice(0, 80)}`,
    metadata: {
      source: episode.source_description || "effect-v4-knowledge-graph",
      category: episode.episode_body.match(/Category:\s*(\w+)/)?.[1] || "unknown",
      sm_source: "effect-v4-kg-ingestion",
    },
    entityContext: ENTITY_CONTEXT,
  }

  const res = await fetch(`${API_URL}/v3/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.json()
}

async function searchMemory(apiKey, query) {
  const res = await fetch(`${API_URL}/v4/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      containerTag: CONTAINER_TAG,
      searchMode: "hybrid",
      limit: 5,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }

  return res.json()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes("--dry-run")
  const searchMode = args.includes("--search")
  const batchIdx = args.indexOf("--batch")
  const delayIdx = args.indexOf("--delay")
  const delay = delayIdx >= 0 ? parseInt(args[delayIdx + 1], 10) : 300

  if (searchMode) {
    const query = args.filter((a) => !a.startsWith("--")).join(" ")
    if (!query) {
      console.log('Usage: node supermemory-ingest.mjs --search "your query"')
      return
    }
    const creds = await loadCredentials()
    const result = await searchMemory(creds.apiKey, query)
    console.log(JSON.stringify(result, null, 2))
    return
  }

  const batches =
    batchIdx >= 0
      ? [args[batchIdx + 1]]
      : ["migrations", "enrichment", "patterns", "modules", "docs"]

  const creds = await loadCredentials()
  console.log(`Container tag: ${CONTAINER_TAG}`)
  console.log(`Dry run: ${dryRun}`)
  console.log(`Delay between requests: ${delay}ms`)
  console.log(`Batches: ${batches.join(", ")}\n`)

  let totalIngested = 0
  let totalFailed = 0

  for (const batch of batches) {
    const episodes = await loadEpisodes(batch)
    console.log(`\n--- Batch: ${batch} (${episodes.length} episodes) ---`)

    for (let i = 0; i < episodes.length; i++) {
      const ep = episodes[i]
      const label = `[${batch} ${i + 1}/${episodes.length}]`

      if (dryRun) {
        console.log(`${label} DRY RUN: ${ep.name}`)
        totalIngested++
        continue
      }

      try {
        const result = await addMemory(creds.apiKey, ep, i)
        console.log(`${label} OK (${result.id}): ${ep.name}`)
        totalIngested++
      } catch (err) {
        console.error(`${label} FAIL: ${ep.name} — ${err.message}`)
        totalFailed++
      }

      if (i < episodes.length - 1 && delay > 0) {
        await sleep(delay)
      }
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Ingested: ${totalIngested}`)
  console.log(`Failed: ${totalFailed}`)
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`)
  process.exit(1)
})
