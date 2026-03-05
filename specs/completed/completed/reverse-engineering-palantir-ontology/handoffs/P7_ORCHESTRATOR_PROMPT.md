# Phase 7 Orchestrator Prompt — Verification

Copy-paste this prompt to start Phase 7.

## Context

Phase 6 (KG Construction) is complete. The Graphiti knowledge graph is populated with data from all previous phases. Now we verify that the graph is comprehensive, accurate, and useful for the future reverse-engineering effort.

## Your Mission

Systematically verify the knowledge graph and produce a verification report.

### Verification Steps

1. **Concept Coverage Check:**
   For each of the 9 core Palantir concepts, run `search_nodes` and `search_memory_facts`:
   - Object Type
   - Property / Shared Property
   - Link Type
   - Action Type
   - Roles
   - Functions
   - Interfaces
   - Object Views

   Record: number of nodes found, number of facts (relationships), quality of results

2. **Relationship Quality Check:**
   Query for known relationships between concepts:
   - "How do Object Types relate to Properties?"
   - "How does the Ontology reduce AI hallucination?"
   - "How are Roles used for access control?"
   - "How does OSDK expose the Ontology to applications?"
   - "What is the relationship between Foundry and the Ontology?"

   Assess whether the graph returns meaningful, accurate answers

3. **Data Source Coverage:**
   Verify that all data sources were ingested:
   - Check episode count matches expected entries from manifest.json
   - Verify entries from all phases are represented (web-search, blog-list, docs-scraper, repo-analysis)

4. **Graph Statistics:**
   - Total nodes
   - Total facts/edges
   - Entity type distribution
   - Most connected nodes (hub entities)
   - Orphan nodes (no relationships)

5. **Sample Deep Queries:**
   Run 5-10 complex queries that a future reverse-engineering agent would need:
   - "What components make up the Palantir Ontology data model?"
   - "How does the Ontology enforce security at the data layer?"
   - "What is the architecture of the OSDK TypeScript client?"
   - "How does AIP use the Ontology for grounding LLM responses?"
   - "What patterns does Palantir use for data pipeline integration?"

6. **Produce Verification Report:**
   Write `outputs/p7-verification/report.md` with:
   - Executive summary (pass/fail for each area)
   - Concept coverage table (concept → node count → fact count → assessment)
   - Relationship quality assessment (query → result quality → notes)
   - Graph statistics
   - Identified gaps (concepts or relationships that are underrepresented)
   - Recommendations for future enrichment

## Critical Constraints

- Use `group_id: "palantir-ontology"` for all queries
- Do NOT modify the graph during verification — read-only queries only
- Be honest about gaps — it's better to identify them now than discover them during reverse-engineering
- No coding standards required

## Success Criteria

- [ ] All 9 core concepts have at least 5 nodes each in the graph
- [ ] Relationship queries return meaningful results for at least 8 of 9 concepts
- [ ] Episode count matches expected ingestion count (within 5% tolerance)
- [ ] Graph statistics documented
- [ ] Verification report produced at `outputs/p7-verification/report.md`
- [ ] Gaps identified with recommendations for future enrichment
- [ ] Manifest updated with final P7 outputs

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P7.md`
