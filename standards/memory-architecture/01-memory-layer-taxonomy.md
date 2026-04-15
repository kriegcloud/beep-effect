# Memory Layer Taxonomy

This document defines the four memory layers required by the project's agent memory architecture, maps each to its mathematical constraints from the No-Escape Theorem, and specifies the concrete architecture for each.

---

## Layer 1: Long-Term Memory (Durable Knowledge)

**What it stores:** Project goals, user principles, domain rules, architectural decisions, coding standards. Things that are true for months or years.

**Architecture:** File-based curated documents and a deterministic graph.

- Claude Code MEMORY.md / CLAUDE.md style -- always loaded, never searched semantically.
- The expert-memory ClaimRecord model for structured assertions with evidence and provenance.
- Human-authored and human-curated. The LLM does not write to this layer autonomously.

**Theorem status:** OUTSIDE -- these are exact records, not semantic retrievals. No degradation.

**What gets it right:** Claude Code's hierarchical MEMORY.md (zero infrastructure, transparent, version-controlled). OpenClaw's separation of MEMORY.md (durable) from daily notes (ephemeral).

**What gets it wrong:** Supermemory and similar tools that dump everything into an "auto-evolving knowledge graph" -- the paper proves this degrades.

**Concrete implementation:** `standards/` directory documents, `CLAUDE.md`, project-level memory files. The expert-memory-big-picture ClaimRecord system when it matures -- but artifact-to-packet first.

**Consolidation strategy:** Manual curation with periodic LLM-assisted "health checks" (Karpathy's linting idea is sound here -- use LLMs to find inconsistencies in curated knowledge, but humans approve changes).

---

## Layer 2: Short-Term / Session Memory (Ephemeral Context)

**What it stores:** What the user worked on today, recent conversation context, in-progress decisions, current task state.

**Architecture:** Episodic log with temporal windowing and aggressive consolidation.

- Graphiti's bi-temporal model has the right shape: facts with validity windows, auto-invalidation.
- BUT: must implement interference management -- this layer WILL degrade if left unmanaged.

**Theorem status:** INSIDE for semantic retrieval, but manageable through:

- Aggressive temporal pruning (old sessions drop off).
- Competitor density management (don't let the graph grow unbounded).
- Compression via clustering (the paper's best Pareto point: ~2,500 clusters).

**What gets it right:** OpenClaw Dreaming's 3-phase consolidation -- light (ingest + deduplicate), deep (weighted scoring + promote to durable), REM (pattern extraction, never writes to permanent). Only the deep phase touches permanent memory.

**What gets it wrong:** Naive Graphiti usage where everything is stored forever and the graph grows without bounds. This is exactly what the user experienced -- degradation at scale.

**Concrete implementation:** Graphiti is acceptable HERE (not for long-term) IF:

1. Temporal windows are enforced (sessions older than N days are pruned or compressed).
2. A consolidation pipeline promotes high-signal facts to Layer 1 (durable).
3. Competitor density is monitored.
4. The graph is periodically compressed (clustering).

**Consolidation strategy:** Automated with human-in-the-loop for promotion to Layer 1. OpenClaw's six-signal weighted scoring is a good starting model: relevance (0.30), frequency (0.24), query diversity (0.15), recency (0.15), consolidation (0.10), conceptual richness (0.06).

---

## Layer 3: Procedural Memory (How To Do Things)

**What it stores:** How to use APIs, how to call functions, what parameters are required, what errors can occur, code patterns and their usage.

**Architecture:** Deterministic code graph and grounded retrieval.

- AST-derived knowledge via ts-morph (Layer 1 certainty = 1.0).
- JSDoc as structured semantic surface (deterministic metadata, not raw text).
- Type-checker derived relationships (Layer 2 certainty = 0.85-0.95).
- 15+ query classes: describeSymbol, symbolParams, symbolReturns, symbolThrows, listFileExports, listFileImports, listFileImporters, listSymbolImporters, listFileDependencies, listFileDependents, keywordSearch, etc.

**Theorem status:** OUTSIDE -- these are symbolic lookups against deterministic data. They do not degrade.

**This is the project's competitive edge.** While every other agent memory system operates inside the theorem class and degrades at scale, procedural memory via deterministic code intelligence is mathematically immune. "How do I use this API?" is answerable from AST + JSDoc + type signatures without any semantic search.

**What gets it right:** Greptile's codebase graph approach (function relationships, dependencies, patterns). The repo-codegraph-jsdoc research's three-tier certainty model.

**What gets it wrong:** Any approach that embeds code into vectors and searches semantically. The paper proves this will degrade. Code has deterministic structure -- use it.

**Concrete implementation:** repo-memory v0. This is substantially built -- Tauri desktop app, Effect runtime, ts-morph indexing, deterministic retrieval with citations, 15 query classes, durable workflows. P0 gaps are "finish and harden."

**Consolidation strategy:** Not needed -- deterministic data doesn't degrade. Re-index when code changes.

---

## Layer 4: Relational / Conceptual Memory (How Things Connect)

**What it stores:** Relationships between concepts, cross-domain connections, architectural patterns, how subsystems interact, why decisions were made in relation to each other.

**Architecture:** Managed semantic graph with provenance verification.

- TrustGraph/BeepGraph territory -- this is where semantic knowledge lives.
- Provenance tracing is CRITICAL because it provides the "external symbolic verifier" escape route.
- Trust scoring gives a quality signal for managing interference.

**Theorem status:** INSIDE -- this will degrade. The engineering question is not "how to prevent degradation" but "how to manage where we sit on the interference-fidelity frontier."

**Key constraints from the paper:**

- Compression is the most practical lever (clustering).
- False recall is more fundamental than forgetting -- must be treated as first-class failure mode.
- Hybrid retrieval (semantic + keyword + exact) can navigate the frontier even though no single component escapes.
- Reasoning overlays convert graceful degradation into brittle phase transitions -- don't add LLM reasoning on top of semantic retrieval without monitoring competitor density.

**What gets it right:** TrustGraph's multi-store architecture (graph + vector + row + object stores) with provenance tracing. Graphiti's bi-temporal fact tracking with auto-invalidation. FalkorDB's raw performance for graph+vector hybrid queries.

**Concrete implementation:** BeepGraph (Effect-native TrustGraph rewrite). Foundation is done (schema, messaging, service infrastructure, pipelines). Remaining work: port the provenance and verification layers -- NOT all 15 services. Port what enables verification and trust scoring.

**Consolidation strategy:** Automated compression with provenance-based verification. Facts without traceable provenance should decay faster. Trust scores should weight consolidation decisions.

---

## How the Layers Compose

```
+---------------------------------------------------+
|  Layer 1: Long-Term (Durable)                     |
|  Curated assertions, project standards            |
|  OUTSIDE theorem -- never degrades                |
+---------------------------------------------------+
|  Layer 3: Procedural (Code Intelligence)          |
|  AST, types, JSDoc -- deterministic lookups       |
|  OUTSIDE theorem -- never degrades                |
+---------------------------------------------------+
|  Layer 4: Relational (Conceptual Connections)     |
|  Semantic graph with provenance verification      |
|  INSIDE theorem -- managed degradation            |
+---------------------------------------------------+
|  Layer 2: Short-Term (Session/Ephemeral)          |
|  Episodic log with temporal windowing             |
|  INSIDE theorem -- aggressive consolidation       |
+---------------------------------------------------+

Promotion flow: Layer 2 --> (consolidation) --> Layer 1 or Layer 4
Verification flow: Layer 4 --> (provenance check) --> Layer 3 or Layer 1
Query routing: Route to the highest-certainty layer that can answer
```

### Query Routing Principle

Always route queries to the highest-certainty layer that can answer them. "What does this function return?" goes to Layer 3 (deterministic). "What has the user been working on?" goes to Layer 2 (session). "How do these subsystems relate?" goes to Layer 4 (semantic, verified against Layer 3). "What are the project's architectural principles?" goes to Layer 1 (curated).

The worst failure mode is routing a query to a lower-certainty layer when a higher-certainty layer could answer it. This is where most agent memory systems fail -- they route everything through semantic search when deterministic lookups would be both faster and immune to degradation.
