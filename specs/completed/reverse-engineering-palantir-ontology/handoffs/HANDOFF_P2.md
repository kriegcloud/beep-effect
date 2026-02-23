# Handoff P2: Parallel Web Research

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,800 | OK |
| Episodic | 1,000 | ~600 | OK |
| Semantic | 500 | ~450 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 2 Goal
Deploy 5 parallel research agents to discover and catalog all publicly available web content about Palantir's Ontology system. Each agent covers a thematic category and produces structured `WebResearchLink` entries. Results are deduplicated and merged into a master catalog.

### Deliverables
1. `outputs/p2-web-research/ontology-core.json` -- Foundational Ontology concepts, Object Types, data modeling
2. `outputs/p2-web-research/data-integration.json` -- Foundry pipelines, data sync, connectors, ETL
3. `outputs/p2-web-research/ai-llm.json` -- AIP, OAG, LLM grounding, hallucination reduction, agent patterns
4. `outputs/p2-web-research/security.json` -- PBAC, roles, access controls, marking, auditing
5. `outputs/p2-web-research/architecture.json` -- Platform architecture, OSDK design, infrastructure
6. `outputs/p2-web-research/master.json` -- Deduplicated union of all agent outputs

### Success Criteria
- [ ] Each agent produces 20-50 WebResearchLink entries
- [ ] All 5 category JSONs produced and valid
- [ ] master.json produced with deduplicated entries (URL-based dedup, merge strategy for duplicates)
- [ ] Each entry has quality score 1-5
- [ ] Total entries: 100-250 across all categories

### Agent Assignments

**Agent 1 -- Ontology Core:**
- Search: "Palantir Ontology data model", "Palantir Object Types", "Foundry Ontology concepts", "OSDK object modeling"
- Focus: Object Type definitions, Properties, Shared Properties, Link Types, type system design
- Target: 20-50 entries

**Agent 2 -- Data Integration:**
- Search: "Palantir Foundry data pipeline", "Palantir data sync", "Foundry connectors", "Palantir ETL"
- Focus: How data flows into and through the Ontology, pipeline architecture, data sources
- Target: 20-50 entries

**Agent 3 -- AI & LLM:**
- Search: "Palantir AIP", "Ontology Augmented Generation", "Palantir LLM grounding", "Palantir AI agents"
- Focus: How AIP uses the Ontology, OAG patterns, hallucination reduction, agent architectures
- Target: 20-50 entries

**Agent 4 -- Security:**
- Search: "Palantir access controls", "Foundry PBAC", "Palantir purpose-based access", "Palantir data governance"
- Focus: PBAC, Roles, marking, audit logging, purpose limitation, security at the data layer
- Target: 20-50 entries

**Agent 5 -- Architecture:**
- Search: "Palantir platform architecture", "OSDK design", "Foundry architecture", "Palantir infrastructure"
- Focus: System architecture, OSDK internals, Foundry platform design, deployment patterns
- Target: 20-50 entries

### WebResearchLink Schema

Each entry must conform to:
```typescript
type WebResearchLink = {
  url: string;           // Canonical URL
  title: string;         // Page title
  summary: string;       // 2-4 sentence summary of content
  category: string;      // "ontology-core" | "data-integration" | "ai-llm" | "security" | "architecture"
  relevantParts: Array<string>;  // What specifically is useful
  tags: Array<string>;   // Keyword tags
  source: "web-search";  // Always "web-search" for this phase
  contentType: "article" | "documentation" | "video" | "code-example" | "api-reference" | "tutorial" | "whitepaper";
  datePublished?: string; // ISO date if available
  relatedConcepts: Array<string>;  // Which of the 9 core concepts this relates to
  quality: number;        // 1-5 (1=inaccessible, 2=minimal, 3=moderate, 4=good, 5=excellent)
}
```

### Deduplication Strategy
- Key: URL (normalized -- strip trailing slashes, query params, fragments)
- On collision: Merge `relevantParts`, `tags`, `relatedConcepts` arrays; keep highest quality score; keep longest summary
- Run dedup after merging all 5 category files

### Key Constraints
- Use web search tools to find content -- do NOT try to fetch/read the actual pages (that's Phase 3/5)
- Quality score is based on URL/title/snippet assessment, not full content reading
- Include YouTube videos, conference talks, and whitepapers -- not just blog posts
- No coding standards required -- focus on catalog completeness
- Each agent works independently -- no inter-agent coordination needed

### Implementation Order
1. Launch 5 research agents in parallel
2. Each agent outputs its category JSON
3. After all 5 complete, merge into master.json with deduplication
4. Report total counts and category distribution

## Episodic Memory (Previous Context)

### P1 Outcomes
- KG schema design approved with entity type catalog and relationship types
- Schema maps all 9 core Palantir concepts to Graphiti-compatible types
- Entity type hierarchy and relationship naming conventions established
- `group_id: "palantir-ontology"` confirmed as data partition

### POC Findings (Key for P2)
- Web search works normally for discovering Palantir content
- Many blog.palantir.com URLs are Medium-hosted (will need Chrome automation in P3, but NOT in P2)
- palantir.com/docs pages are fully accessible via HTTP
- Quality assessment from title/snippet alone is viable for initial cataloging

## Semantic Memory (Project Constants)

### 9 Core Palantir Ontology Concepts

| # | Concept | Search Keywords |
|---|---------|----------------|
| 1 | Object Type | "object type", "entity definition", "data model" |
| 2 | Property | "property", "attribute", "field", "schema" |
| 3 | Shared Property | "shared property", "reusable property" |
| 4 | Link Type | "link type", "relationship", "edge type" |
| 5 | Action Type | "action type", "mutation", "workflow action" |
| 6 | Roles | "role", "permission", "access control" |
| 7 | Functions | "function", "query", "computation", "derived" |
| 8 | Interfaces | "interface", "contract", "polymorphism" |
| 9 | Object Views | "object view", "projection", "view" |

### Output Paths

| Output | Path (relative to spec root) |
|--------|------------------------------|
| Ontology Core results | `outputs/p2-web-research/ontology-core.json` |
| Data Integration results | `outputs/p2-web-research/data-integration.json` |
| AI & LLM results | `outputs/p2-web-research/ai-llm.json` |
| Security results | `outputs/p2-web-research/security.json` |
| Architecture results | `outputs/p2-web-research/architecture.json` |
| Merged master | `outputs/p2-web-research/master.json` |

## Procedural Memory (Reference Links)

- [Spec README](../README.md) -- Master spec with schemas and phase breakdown
- [P1 KG Schema Design](../outputs/p1-schema-design/kg-schema-design.md) -- Entity and relationship catalogs to guide search
- [P2 Orchestrator Prompt](./P2_ORCHESTRATOR_PROMPT.md) -- Launch instructions

## Known Issues & Gotchas

1. **Don't fetch pages** -- P2 is catalog-only. Agents discover and classify URLs. Content fetching happens in P3/P5.
2. **Medium blog posts may have misleading titles** -- Some blog.palantir.com titles are generic. Use the URL slug + snippet for quality assessment.
3. **Palantir docs restructure** -- Documentation URLs may have changed. Flag any 404 candidates with `quality: 1`.
4. **Overlap between categories is expected** -- An article about "OSDK security" fits both security and architecture. Assign to primary category; dedup handles the rest.
5. **YouTube/video content** -- Include but mark as `contentType: "video"`. These can't be RAG-extracted in P5 but are valuable references.
