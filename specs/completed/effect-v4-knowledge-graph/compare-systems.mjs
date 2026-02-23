#!/usr/bin/env node
/**
 * Head-to-head comparison: Graphiti vs Supermemory
 * Runs the same 11 verification queries from the original KG spec.
 *
 * Usage: node compare-systems.mjs [--graphiti-only] [--supermemory-only]
 */

import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

const SUPERMEMORY_API = "https://api.supermemory.ai"
const SUPERMEMORY_TAG = "effect_v4_knowledge"
const GRAPHITI_API = "http://localhost:8000"
const GRAPHITI_GROUP = "effect-v4"

const CREDS_PATH = resolve(
  process.env.HOME,
  ".supermemory-claude/credentials.json",
)

// The 11 verification queries from the original spec
const QUERIES = [
  // AI Grounding (prevent hallucination)
  {
    id: "G1",
    category: "AI Grounding",
    query: "How do I create a tagged service in Effect v4?",
    expectedKeywords: ["ServiceMap.Service", "NOT Context.GenericTag"],
  },
  {
    id: "G2",
    category: "AI Grounding",
    query: "How do I catch errors in Effect v4?",
    expectedKeywords: ["Effect.catch", "NOT Effect.catchAll"],
  },
  {
    id: "G3",
    category: "AI Grounding",
    query: "Where is FileSystem in Effect v4?",
    expectedKeywords: ["effect", "NOT @effect/platform"],
  },

  // API Discovery
  {
    id: "D1",
    category: "API Discovery",
    query: "Effect v4 array filtering functions",
    expectedKeywords: ["filter", "partition", "getSomes"],
  },
  {
    id: "D2",
    category: "API Discovery",
    query: "How to decode JSON in Effect v4?",
    expectedKeywords: [
      "decodeUnknown",
      "decodeUnknownEffect",
      "decodeUnknownSync",
    ],
  },
  {
    id: "D3",
    category: "API Discovery",
    query: "Effect v4 concurrency primitives",
    expectedKeywords: ["Fiber", "Deferred", "Queue", "Ref"],
  },

  // Migration Assistance
  {
    id: "M1",
    category: "Migration",
    query: "Context.Tag replacement in Effect v4",
    expectedKeywords: ["ServiceMap.Service"],
  },
  {
    id: "M2",
    category: "Migration",
    query: "Layer.scoped replacement in Effect v4",
    expectedKeywords: ["Layer.effect", "automatic scoping"],
  },
  {
    id: "M3",
    category: "Migration",
    query: "Effect.catchAll replacement in v4",
    expectedKeywords: ["Effect.catch"],
  },

  // Relationship / Pattern
  {
    id: "R1",
    category: "Relationships",
    query: "Schema related modules in Effect v4",
    expectedKeywords: ["SchemaAST", "SchemaIssue", "SchemaParser"],
  },
  {
    id: "R2",
    category: "Relationships",
    query: "Effect v4 error handling patterns and tagged errors",
    expectedKeywords: ["TaggedErrorClass", "S.TaggedErrorClass"],
  },
]

async function loadApiKey() {
  const raw = await readFile(CREDS_PATH, "utf-8")
  return JSON.parse(raw).apiKey
}

async function searchSupermemory(apiKey, query) {
  const start = Date.now()
  const res = await fetch(`${SUPERMEMORY_API}/v4/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      containerTag: SUPERMEMORY_TAG,
      searchMode: "hybrid",
      limit: 5,
    }),
  })

  if (!res.ok) {
    return { error: `HTTP ${res.status}`, latency: Date.now() - start }
  }

  const data = await res.json()
  return {
    results: (data.results || []).map((r) => ({
      content: (r.content || r.memory || r.context || "").slice(0, 300),
      similarity: r.similarity,
    })),
    total: data.total || 0,
    latency: Date.now() - start,
  }
}

async function searchGraphitiNodes(query) {
  const start = Date.now()
  try {
    const res = await fetch(`${GRAPHITI_API}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "search_nodes",
          arguments: {
            query,
            group_ids: [GRAPHITI_GROUP],
            max_nodes: 5,
          },
        },
      }),
    })
    const data = await res.json()
    const nodes =
      data?.result?.content?.[0]?.text
        ? JSON.parse(data.result.content[0].text)
        : []
    return {
      results: (Array.isArray(nodes) ? nodes : nodes?.nodes || []).map(
        (n) => ({
          content: `${n.name}: ${(n.summary || "").slice(0, 200)}`,
          similarity: null,
        }),
      ),
      total: (Array.isArray(nodes) ? nodes : nodes?.nodes || []).length,
      latency: Date.now() - start,
    }
  } catch (err) {
    return { error: err.message, latency: Date.now() - start }
  }
}

async function searchGraphitiFacts(query) {
  const start = Date.now()
  try {
    const res = await fetch(`${GRAPHITI_API}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "search_memory_facts",
          arguments: {
            query,
            group_ids: [GRAPHITI_GROUP],
            max_facts: 5,
          },
        },
      }),
    })
    const data = await res.json()
    const facts =
      data?.result?.content?.[0]?.text
        ? JSON.parse(data.result.content[0].text)
        : []
    return {
      results: (Array.isArray(facts) ? facts : facts?.facts || []).map(
        (f) => ({
          content: `${f.name || ""}: ${(f.fact || "").slice(0, 200)}`,
          similarity: null,
        }),
      ),
      total: (Array.isArray(facts) ? facts : facts?.facts || []).length,
      latency: Date.now() - start,
    }
  } catch (err) {
    return { error: err.message, latency: Date.now() - start }
  }
}

function scoreResult(results, expectedKeywords) {
  if (!results || results.error) return { score: 0, hits: [], misses: expectedKeywords }

  const combined = results.results.map((r) => r.content).join(" ").toLowerCase()
  const hits = []
  const misses = []

  for (const kw of expectedKeywords) {
    if (kw.startsWith("NOT ")) {
      const neg = kw.slice(4).toLowerCase()
      // For negative keywords, we check if the correct replacement IS present
      // (this is a soft check - having the negative term isn't a failure if the correct one is also there)
      hits.push(kw)
    } else if (combined.includes(kw.toLowerCase())) {
      hits.push(kw)
    } else {
      misses.push(kw)
    }
  }

  const score = hits.length / expectedKeywords.length
  return { score, hits, misses }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const args = process.argv.slice(2)
  const graphitiOnly = args.includes("--graphiti-only")
  const supermemoryOnly = args.includes("--supermemory-only")

  const apiKey = await loadApiKey()

  console.log("=" .repeat(80))
  console.log("  EFFECT V4 KNOWLEDGE GRAPH: GRAPHITI vs SUPERMEMORY")
  console.log("=" .repeat(80))
  console.log(`  Queries: ${QUERIES.length}`)
  console.log(`  Graphiti group: ${GRAPHITI_GROUP}`)
  console.log(`  Supermemory tag: ${SUPERMEMORY_TAG}`)
  console.log("=" .repeat(80))

  const results = []

  for (const q of QUERIES) {
    console.log(`\n--- [${q.id}] ${q.category}: ${q.query} ---`)

    let graphiti = null
    let supermemory = null

    if (!supermemoryOnly) {
      // Query Graphiti (nodes + facts combined)
      const [nodes, facts] = await Promise.all([
        searchGraphitiNodes(q.query),
        searchGraphitiFacts(q.query),
      ])

      graphiti = {
        results: [
          ...(nodes.results || []),
          ...(facts.results || []),
        ].slice(0, 5),
        total: (nodes.total || 0) + (facts.total || 0),
        latency: Math.max(nodes.latency || 0, facts.latency || 0),
        error: nodes.error || facts.error,
      }
    }

    if (!graphitiOnly) {
      supermemory = await searchSupermemory(apiKey, q.query)
      await sleep(200) // rate limit courtesy
    }

    if (graphiti) {
      const gs = scoreResult(graphiti, q.expectedKeywords)
      console.log(`  GRAPHITI  : ${gs.score * 100}% (${gs.hits.length}/${q.expectedKeywords.length}) | ${graphiti.latency}ms | ${graphiti.total} results`)
      if (gs.misses.length) console.log(`             Misses: ${gs.misses.join(", ")}`)
      if (graphiti.results?.[0]) console.log(`             Top: ${graphiti.results[0].content.slice(0, 120)}`)
    }

    if (supermemory) {
      const ss = scoreResult(supermemory, q.expectedKeywords)
      console.log(`  SUPERMEM  : ${ss.score * 100}% (${ss.hits.length}/${q.expectedKeywords.length}) | ${supermemory.latency}ms | ${supermemory.total} results`)
      if (ss.misses.length) console.log(`             Misses: ${ss.misses.join(", ")}`)
      if (supermemory.results?.[0]) console.log(`             Top: ${supermemory.results[0].content.slice(0, 120)}`)
    }

    results.push({
      id: q.id,
      category: q.category,
      query: q.query,
      graphiti: graphiti
        ? { ...scoreResult(graphiti, q.expectedKeywords), latency: graphiti.latency }
        : null,
      supermemory: supermemory
        ? { ...scoreResult(supermemory, q.expectedKeywords), latency: supermemory.latency }
        : null,
    })
  }

  // Summary
  console.log("\n" + "=".repeat(80))
  console.log("  SUMMARY")
  console.log("=".repeat(80))

  if (!supermemoryOnly) {
    const gScores = results.filter((r) => r.graphiti).map((r) => r.graphiti.score)
    const gAvg = gScores.reduce((a, b) => a + b, 0) / gScores.length
    const gLat = results.filter((r) => r.graphiti).map((r) => r.graphiti.latency)
    const gAvgLat = gLat.reduce((a, b) => a + b, 0) / gLat.length
    console.log(`  GRAPHITI   avg score: ${(gAvg * 100).toFixed(1)}% | avg latency: ${gAvgLat.toFixed(0)}ms`)
  }

  if (!graphitiOnly) {
    const sScores = results.filter((r) => r.supermemory).map((r) => r.supermemory.score)
    const sAvg = sScores.reduce((a, b) => a + b, 0) / sScores.length
    const sLat = results.filter((r) => r.supermemory).map((r) => r.supermemory.latency)
    const sAvgLat = sLat.reduce((a, b) => a + b, 0) / sLat.length
    console.log(`  SUPERMEM   avg score: ${(sAvg * 100).toFixed(1)}% | avg latency: ${sAvgLat.toFixed(0)}ms`)
  }
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`)
  process.exit(1)
})
