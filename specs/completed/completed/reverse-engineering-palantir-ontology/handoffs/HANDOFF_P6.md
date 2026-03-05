# Handoff P6: Knowledge Graph Construction

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,600 | OK |
| Episodic | 1,000 | ~700 | OK |
| Semantic | 500 | ~400 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 6 Goal
Ingest all extracted data (enriched web content + repo analysis) into Graphiti, creating a rich, queryable knowledge graph of Palantir's Ontology system.

### Deliverables
1. `outputs/p6-graph-pipeline/ingestion-log.json` -- Success/failure per episode
2. `outputs/p6-graph-pipeline/graph-stats.json` -- Node/edge counts, entity type distribution
3. Populated Graphiti knowledge graph with `group_id: "palantir-ontology"`

### POC-Validated Approach

**Graphiti MCP `add_memory` works directly.** Validated in POC:
- 3 episodes ingested successfully via MCP tool
- Graphiti auto-extracted 10 entities and 10+ semantic relationships
- Entity types correctly categorized (Entity, Organization, Document, Topic)
- Relationship types are meaningful (REDUCES_HALLUCINATIONS, SERVES_AS_TRUSTED_DATA_SOURCE, etc.)
- Temporal tracking works (valid_at, invalid_at, expired_at fields populated)
- Episode provenance links back to source content

**No custom HTTP client needed.** Use the MCP `add_memory` tool directly.

### Ingestion Strategy

#### Data Sources

1. **Enriched web content** (`outputs/p5-rag-enrichment/enriched-web.json`):
   - For each entry, create episode with structured text body combining:
     - Summary + key insights
     - Extracted entities (formatted as natural text, not raw JSON)
     - Extracted relationships (formatted as natural text)
     - Source URL for provenance

2. **Repo analysis** (`outputs/p4b-repo-analysis/*.json`):
   - For each repo, create episode with structured text body combining:
     - Summary + architecture patterns
     - Ontology concept evidence
     - API surface descriptions
     - Type definition summaries
     - GitHub URL for provenance

#### Episode Body Format

The POC showed that **structured text narratives** produce better entity extraction than raw JSON dumps. Format each episode body as:

```
Title: [entry title]
Source: [URL]
Category: [category]

Summary: [summary text]

Key Concepts:
- [Concept 1]: [description]
- [Concept 2]: [description]
...

Relationships:
- [Source] [relationship] [Target]
- [Source] [relationship] [Target]
...

Key Insights:
- [insight 1]
- [insight 2]
...
```

#### Batch Processing

1. **Batch 1: High-quality web entries** (quality >= 4)
   - Process first, verify graph looks correct
   - Spot-check: `search_nodes` + `search_memory_facts` after batch
   - Expected: 50-100 episodes

2. **Batch 2: Medium-quality web entries** (quality 2-3)
   - Process after Batch 1 verification
   - Expected: 100-150 episodes

3. **Batch 3: Repository analysis entries**
   - Process all 18 repos
   - Expected: 18 episodes

#### Processing Constraints
- **Sequential within batches** -- Graphiti processes same group_id sequentially
- **2-5 second delays between episodes** -- avoid overwhelming Graphiti's LLM extraction
- **group_id: "palantir-ontology"** for ALL episodes (NOT "beep-dev" or "palantir-ontology-poc")

### Seed Entities (Recommended)

Before bulk ingestion, create a seed episode with the 9 core Ontology concepts to anchor entity resolution:

```
Name: "Palantir Ontology Core Concepts"
Body: "The Palantir Ontology system has 9 core concepts:
1. Object Type: Entity definitions (e.g., Customer, Transaction) - the foundation of domain modeling
2. Property: Typed attributes on Object Types defining data shape and validation
3. Shared Property: Properties reused across multiple Object Types for cross-domain consistency
4. Link Type: Typed relationships between Object Types enabling graph-based data modeling
5. Action Type: Operational mutations with validation and side effects for workflow automation
6. Roles: Permission scoping for Ontology operations controlling access and security
7. Functions: Computation layer over the Ontology for business logic abstraction
8. Interfaces: Abstract contracts that Object Types implement for polymorphism and composability
9. Object Views: Presentation/security-scoped projections of Objects for multi-tenant data access"
```

### Success Criteria
- [ ] Seed episode ingested with 9 core concepts
- [ ] All high-quality web entries ingested (Batch 1)
- [ ] All medium-quality web entries ingested (Batch 2)
- [ ] All repo analysis entries ingested (Batch 3)
- [ ] `search_nodes` returns results for all 9 core concepts
- [ ] `search_memory_facts` returns meaningful relationships
- [ ] ingestion-log.json saved with success/failure counts
- [ ] graph-stats.json saved with counts

### Key Constraints
- **group_id: "palantir-ontology"** -- NOT "beep-dev" or POC group
- **Sequential processing** with 2-5 second delays
- **Clear previous data if needed** -- if re-running, use `clear_graph(group_ids=["palantir-ontology"])` first
- **LLM cost** -- Graphiti calls LLM per episode (~$0.05-0.50 each). For 200 episodes: ~$10-100.
- **No coding standards** -- pragmatic ingestion only

## Episodic Memory (Previous Context)

### P5 Outcomes
- enriched-web.json produced with entities, relationships, insights for all qualifying entries
- Extraction quality verified on sample of 10 entries
- Entity and relationship types aligned with P1 KG schema

### POC Findings (Critical for P6)
- **MCP `add_memory` tool works directly** -- no custom HTTP client needed
- **Structured text narratives produce best entity extraction** -- not raw JSON
- **Sequential processing required** -- same group_id processes sequentially in Graphiti
- **2-5 second delays recommended** -- prevents LLM overwhelm
- **10 entities extracted from 3 episodes** -- good extraction ratio
- **10+ semantic relationships auto-created** -- meaningful types like REDUCES_HALLUCINATIONS
- **Temporal metadata tracked** -- valid_at, invalid_at, expired_at per fact

## Semantic Memory (Project Constants)

### Graphiti MCP Tools

| Tool | Purpose |
|------|---------|
| `add_memory` | Create episodes (main ingestion tool) |
| `search_nodes` | Query entities in the graph |
| `search_memory_facts` | Query relationships/facts |
| `get_episodes` | List ingested episodes |
| `clear_graph` | Delete all data for a group_id |

### add_memory Parameters

```
name: string         -- Episode title
episode_body: string -- Rich text narrative (not raw JSON)
group_id: string     -- "palantir-ontology"
source: string       -- "text" for web content, "json" for repo analysis
source_description: string -- Category + URL
```

### Output Paths

| Output | Path (relative to spec root) |
|--------|------------------------------|
| Ingestion log | `outputs/p6-graph-pipeline/ingestion-log.json` |
| Graph stats | `outputs/p6-graph-pipeline/graph-stats.json` |

## Procedural Memory (Reference Links)

- [Spec README](../README.md) -- Master spec
- [POC Report](../outputs/poc/poc-report.md) -- Validated Graphiti ingestion approach
- [P1 KG Schema](../outputs/p1-schema-design/kg-schema-design.md) -- Entity/relationship catalogs
- [P5 Enriched Data](../outputs/p5-rag-enrichment/enriched-web.json) -- Source data for ingestion
- [P4b Repo Analysis](../outputs/p4b-repo-analysis/) -- Repo data for ingestion
- [P6 Orchestrator Prompt](./P6_ORCHESTRATOR_PROMPT.md) -- Launch instructions

## Known Issues & Gotchas

1. **Use MCP tool directly** -- Don't build a custom HTTP client. The `add_memory` MCP tool handles everything.
2. **Narrative format, not JSON** -- Graphiti's entity extraction works best on structured text, not raw JSON blobs.
3. **Seed entities first** -- Ingesting the 9 core concepts as a seed episode improves entity resolution for subsequent episodes.
4. **Budget tracking** -- Monitor LLM costs during Batch 1. If costs are higher than expected, reduce Batch 2 scope.
5. **Don't mix group_ids** -- `palantir-ontology` only. Never write to `beep-dev`.
6. **Clear before re-run** -- If you need to re-run ingestion, clear the graph first to avoid duplicates.
