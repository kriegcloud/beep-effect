# Handoff P5: RAG Enrichment

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,800 | OK |
| Episodic | 1,000 | ~700 | OK |
| Semantic | 500 | ~450 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 5 Goal
Run a RAG (Retrieval-Augmented Generation) pipeline over all high-quality web content entries to extract structured knowledge: entities, relationships, and insights aligned with the KG schema from P1. This transforms the catalog of URLs into extracted knowledge ready for graph ingestion.

### Deliverables
1. `outputs/p5-rag-enrichment/enriched-web.json` -- All WebResearchLink entries enriched with extractedEntities, extractedRelationships, keyInsights
2. `outputs/p5-rag-enrichment/extraction-log.json` -- Success/failure/skip log per entry

### POC-Validated Approach

**RAG extraction works excellently.** Validated in POC with 3 blog posts:
- Each post produced 5-9 entities, 4-8 relationships, 5-6 key insights
- Entity types naturally map to KG schema categories (PalantirConcept, InterfaceType, Pattern, SecurityConcept, Product)
- Relationship types are semantically meaningful (integrates, exposes, builds_on, reduces, queries)
- Cross-article entity overlap enables graph linking (Object Type, Ontology, Functions appear in multiple articles)

### Processing Pipeline

For each WebResearchLink entry in master.json where `quality >= 2`:

1. **Fetch content:**
   - Blog posts (source: "blog-list"): Use Chrome browser automation (`navigate` + `get_page_text`)
   - Docs pages (source: "docs-scraper"): Use WebFetch or curl (HTTP works)
   - Web search results (source: "web-search"): Try WebFetch first, fall back to Chrome if 403

2. **Extract with structured prompt:**
   Supply the KG schema entity/relationship catalogs and page content to LLM, requesting:
   - `extractedEntities`: Named concepts matching KG entity types
   - `extractedRelationships`: Connections between entities matching KG relationship types
   - `keyInsights`: Factual statements about how the Ontology system works

3. **Produce enriched entry:**
   Preserve all original WebResearchLink fields + add enrichment fields

### Extraction Prompt Template

```
You are extracting structured knowledge about Palantir's Ontology system.

KG Entity Types: [from P1 schema -- e.g., PalantirConcept, Product, Pattern, SecurityConcept, InterfaceType]
KG Relationship Types: [from P1 schema -- e.g., integrates, exposes, component_of, reduces, interface_to]

Core Ontology Concepts to look for:
- Object Type, Property, Shared Property, Link Type, Action Type, Roles, Functions, Interfaces, Object Views
- Plus: Ontology, OSDK, AIP, Foundry, OAG, PBAC

Content from: [URL]
---
[page content]
---

Extract:
1. extractedEntities: Array of { type, name, description } -- named concepts matching entity types
2. extractedRelationships: Array of { source, relationship, target } -- connections between entities
3. keyInsights: Array of strings -- factual statements about how the system works

Return as JSON.
```

### Batch Strategy

Process in quality tiers:
1. **Batch 1:** quality >= 4 entries -- highest value, verify extraction quality
2. **Batch 2:** quality 3 entries -- moderate value
3. **Batch 3:** quality 2 entries -- lower value, may skip if budget is tight

After Batch 1, review a sample of 5-10 extractions. If quality is low, iterate on the prompt before continuing.

### Success Criteria
- [ ] All quality >= 3 entries processed (quality 2 optional)
- [ ] enriched-web.json produced with extractedEntities, extractedRelationships, keyInsights
- [ ] extraction-log.json produced with status per entry
- [ ] Sample of 10 extractions reviewed for quality
- [ ] Entity types and relationship types align with P1 KG schema

### Key Constraints
- **Blog posts need Chrome automation** -- see P3 findings
- **Docs pages use HTTP** -- no Chrome needed
- **Cache fetched content** -- save raw page text to avoid re-fetching if pipeline needs rerun
- **Budget-conscious** -- LLM extraction costs ~$0.02-0.05 per page. For 200 pages: ~$5-10.
- **Keep enriched output separate** -- enriched-web.json is a NEW file, not modifying master.json
- **No coding standards** -- pragmatic extraction only

## Episodic Memory (Previous Context)

### P4 Outcomes
- Docs scraper produced 100+ WebResearchLink entries from palantir.com/docs
- Repository analysis completed for 18 repos with RepoAnalysisResult JSONs
- master.json is the cumulative catalog of all web content entries (P2 + P3 + P4a)

### POC Findings (Critical for P5)
- **Extraction quality is high** -- 3 test blog posts each produced 5-9 entities, 4-8 relationships, 5-6 insights
- **Entity types map naturally to KG schema** -- PalantirConcept, InterfaceType, Pattern, SecurityConcept, Product
- **Relationship types are semantic** -- integrates, exposes, builds_on, reduces, queries, component_of
- **Cross-article entity overlap** -- Object Type, Ontology, Functions appear across multiple articles, enabling graph linking
- **Structured episode body format** -- rich text narratives produce better Graphiti entity extraction than raw dumps
- See `outputs/poc/rag-extraction-test.json` for example extraction output

## Semantic Memory (Project Constants)

### Content Access Methods

| Source | Method | Notes |
|--------|--------|-------|
| blog.palantir.com | Chrome automation | Medium blocks HTTP |
| palantir.com/docs | HTTP (WebFetch/curl) | Server-rendered |
| Other web pages | Try HTTP first, Chrome fallback | Varies by site |

### Enrichment Fields Added

```typescript
// Added to each WebResearchLink entry:
extractedEntities: Array<{
  type: string;        // KG entity type from P1 schema
  name: string;        // Entity name
  description: string; // What this entity is
}>;
extractedRelationships: Array<{
  source: string;      // Source entity name
  relationship: string; // Relationship type from P1 schema
  target: string;       // Target entity name
}>;
keyInsights: Array<string>; // Factual statements
```

### Output Paths

| Output | Path (relative to spec root) |
|--------|------------------------------|
| Enriched entries | `outputs/p5-rag-enrichment/enriched-web.json` |
| Extraction log | `outputs/p5-rag-enrichment/extraction-log.json` |
| Content cache | `outputs/p5-rag-enrichment/cache/` (optional) |

## Procedural Memory (Reference Links)

- [Spec README](../README.md) -- Master spec with schemas
- [P1 KG Schema](../outputs/p1-schema-design/kg-schema-design.md) -- Entity and relationship catalogs for extraction prompts
- [POC RAG Test](../outputs/poc/rag-extraction-test.json) -- Example extraction output from 3 blog posts
- [POC Report](../outputs/poc/poc-report.md) -- Validated extraction approach
- [P5 Orchestrator Prompt](./P5_ORCHESTRATOR_PROMPT.md) -- Launch instructions

## Known Issues & Gotchas

1. **Blog posts need Chrome, docs need HTTP** -- Use the right tool for each source type.
2. **LLM extraction isn't free** -- Budget ~$0.02-0.05 per page. Process high-quality entries first.
3. **Entity naming consistency** -- The same concept may be named differently across articles ("Object Types" vs "ObjectType" vs "object type"). Normalize to KG schema names.
4. **Some pages are long** -- palantir.com/docs pages can be very long. If content exceeds LLM context, truncate to the most relevant sections.
5. **Don't over-extract** -- Aim for 5-15 entities and 3-10 relationships per page. More is noise, less is sparse.
6. **Keep enriched-web.json separate** -- P6 merges enriched data during graph construction. Don't modify master.json.
