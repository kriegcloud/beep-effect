# Phase 5 Orchestrator Prompt — RAG Enrichment

Copy-paste this prompt to start Phase 5.

## Context

Phases 2-4 are complete. We have:
- `outputs/p2-web-research/master.json` — cumulative web research + blog enrichment + docs scraper entries (WebResearchLink format)
- `outputs/p4b-repo-analysis/*.json` — per-repo analysis (RepoAnalysisResult format)
- `outputs/p1-schema-design/kg-schema-design.md` — approved KG schema

Now we run a RAG (Retrieval-Augmented Generation) pipeline to extract deeper knowledge from the web content. This is where we move from "catalog of URLs" to "extracted knowledge ready for graph ingestion."

## Your Mission

Design and implement a RAG pipeline that processes all web content entries and extracts structured knowledge aligned with our KG schema.

### Pipeline Design

1. **Read the KG schema** (`outputs/p1-schema-design/kg-schema-design.md`) to understand what entity types and relationships we need to extract

2. **For each WebResearchLink entry in master.json with quality >= 2:**
   - Fetch the full page content (if not already cached from P3)
   - Extract and clean the main content (strip nav, ads, footer)
   - Run through LLM with a structured extraction prompt that asks:
     - What Palantir Ontology concepts does this content describe?
     - What relationships between concepts are mentioned?
     - What specific technical details, patterns, or constraints are documented?
     - What examples or case studies are provided?
   - Produce an enriched entry with:
     - All original WebResearchLink fields (preserved)
     - `extractedEntities`: Array of entities matching KG schema entity types
     - `extractedRelationships`: Array of relationships matching KG schema relationship types
     - `keyInsights`: Array of concise, factual statements extracted from the content
     - `technicalDetails`: Array of specific implementation details, constraints, or patterns

3. **Save enriched output to `outputs/p5-rag-enrichment/enriched-web.json`**

4. **Update `outputs/manifest.json`**

### Implementation Options

Choose whichever approach is most effective:

- **Option A: Script + LLM API** — Python/Node.js script that fetches pages and calls Claude/GPT API with structured prompts
- **Option B: Claude Agents SDK** — If the claude-agents-sdk plugin is available, use it for orchestrated multi-step extraction with better tool handling
- **Option C: Claude Code team mode** — Batch URLs across multiple agents, each processing a subset

### Extraction Prompt Template

For each page, the LLM should receive:

```
You are extracting structured knowledge about Palantir's Ontology system from this content.

KG Schema Entity Types: [list from P1 schema]
KG Schema Relationship Types: [list from P1 schema]

Content: [cleaned page content]

Extract:
1. Entities: Named concepts, types, or components that match our entity types
2. Relationships: How entities connect (e.g., "ObjectType has_property PropertyType")
3. Key Insights: Factual statements about how the system works
4. Technical Details: Implementation specifics, constraints, patterns

Return as JSON.
```

### Quality Control

- Skip entries with `quality: 1` (inaccessible content)
- If a page returns 404 or is paywalled, log it and move on
- Run a sample of 10 entries first, review output quality, then batch the rest
- If extraction quality is low, iterate on the prompt before full batch

## Critical Constraints

- Cache fetched page content locally to avoid re-fetching in future phases
- Respect rate limits for both web fetching and LLM API calls
- This phase may be the most expensive (LLM API costs) — monitor usage
- No coding standards required — use whatever gets clean extractions fastest
- Keep the RAG output SEPARATE from the master.json — P6 will merge them during graph construction

## Success Criteria

- [ ] RAG pipeline designed and implemented
- [ ] Sample of 10 entries tested and quality verified
- [ ] All qualifying web content entries processed
- [ ] `enriched-web.json` produced with extracted entities, relationships, and insights
- [ ] Manifest updated with P5 outputs
- [ ] Page content cached locally for future use

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P5.md`
