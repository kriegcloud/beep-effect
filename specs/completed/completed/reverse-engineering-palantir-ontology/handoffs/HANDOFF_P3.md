# Handoff P3: Blog Post Enrichment

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,500 | OK |
| Episodic | 1,000 | ~600 | OK |
| Semantic | 500 | ~400 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 3 Goal
Process the 136 curated blog post URLs from `resources/blog-posts-articles-and-resources.md`, fetch their content via Chrome browser automation, and produce structured `WebResearchLink` entries. Merge results into the master catalog from P2.

### Deliverables
1. `outputs/p3-blog-enrichment/blog-entries.json` -- All blog post WebResearchLink entries
2. `outputs/p3-blog-enrichment/fetch-log.json` -- Success/failure log for each URL
3. Updated `outputs/p2-web-research/master.json` -- Merged with new blog entries (deduped)

### POC-Validated Approach

**Blog access requires Chrome browser automation.** This was validated in the POC:
- `curl` returns 403 regardless of User-Agent (Medium CDN blocks non-browsers)
- `WebFetch` also returns 403
- Chrome browser automation (`navigate` + `get_page_text`) works perfectly
- Estimated throughput: 5-10 seconds per post

**This means:**
- Use `claude-in-chrome` MCP tools: `navigate` to URL, then `get_page_text` to extract content
- Process sequentially (one Chrome tab at a time is simplest and most reliable)
- For 136 posts: ~15-25 minutes total
- No need for complex parallel fetching infrastructure

### Processing Pipeline (Per URL)

1. `navigate` to URL
2. `get_page_text` to extract article content
3. Assess quality (1-5) based on content relevance to Palantir Ontology
4. Determine category: ontology-core, data-integration, ai-llm, security, or architecture
5. Write summary (2-4 sentences)
6. Identify relevant parts, tags, related concepts
7. Produce WebResearchLink entry

### Success Criteria
- [ ] All 136 URLs attempted
- [ ] Fetch success rate >= 85% (some posts may be deleted/moved)
- [ ] Each successful fetch produces a valid WebResearchLink entry
- [ ] blog-entries.json produced with all entries
- [ ] fetch-log.json produced with status per URL
- [ ] master.json updated with merged blog entries

### Key Constraints
- **Chrome browser automation only** -- HTTP fetching will not work for blog.palantir.com
- Source field: `"blog-list"` (not "web-search") to distinguish from P2 entries
- Skip duplicate URLs already in master.json from P2
- If a post returns 404 or is inaccessible, log it and move on (quality: 1)
- No coding standards -- pragmatic content extraction only
- Don't over-analyze each post -- quick assessment is sufficient (deeper extraction happens in P5)

### Implementation Order
1. Read `resources/blog-posts-articles-and-resources.md` to get URL list
2. Read `outputs/p2-web-research/master.json` to check for existing URLs
3. For each new URL: navigate, extract, classify, produce entry
4. Save blog-entries.json
5. Merge into master.json with deduplication
6. Save fetch-log.json

## Episodic Memory (Previous Context)

### P2 Outcomes
- master.json produced with 100-250 web research entries from 5 categories
- Deduplication strategy established (URL-based with merge)
- Quality scoring calibrated across categories

### POC Findings (Critical for P3)
- **Blog posts require Chrome automation** -- confirmed via POC testing of 3 posts
- Successfully fetched ~12,000 words per article via `get_page_text`
- Content quality is excellent -- rich technical articles with concrete examples
- Medium's article structure is clean text after extraction (no complex parsing needed)
- Some URLs from Chrome session extraction had garbled suffixes -- the curated list should be clean

## Semantic Memory (Project Constants)

### Blog Post Source File
`resources/blog-posts-articles-and-resources.md` -- 136 entries in markdown link format:
```
- [Title | Palantir Blog](https://blog.palantir.com/slug-hash)
```

### Category Assignment Guide

| Category | Indicator Keywords in Title/Content |
|----------|-------------------------------------|
| ontology-core | Ontology, Object Type, data model, OSDK, Foundry data |
| data-integration | pipeline, data sync, connector, ETL, data flow, integration |
| ai-llm | AIP, AI, LLM, hallucination, agent, machine learning, NLP |
| security | access control, PBAC, purpose, role, governance, audit, marking |
| architecture | platform, infrastructure, scaling, design, engineering, system |

### Output Paths

| Output | Path (relative to spec root) |
|--------|------------------------------|
| Blog entries | `outputs/p3-blog-enrichment/blog-entries.json` |
| Fetch log | `outputs/p3-blog-enrichment/fetch-log.json` |
| Updated master | `outputs/p2-web-research/master.json` |

## Procedural Memory (Reference Links)

- [Spec README](../README.md) -- Master spec with WebResearchLink schema
- [Blog Posts List](../resources/blog-posts-articles-and-resources.md) -- Source URLs
- [POC Report](../outputs/poc/poc-report.md) -- Validated approach for blog fetching
- [P3 Orchestrator Prompt](./P3_ORCHESTRATOR_PROMPT.md) -- Launch instructions

## Known Issues & Gotchas

1. **Chrome automation is the only viable approach** -- Don't waste time trying curl, wget, or HTTP libraries. They all get 403 from Medium.
2. **Some URLs may be dead** -- Blog posts can be deleted or moved. Log failures and move on.
3. **Not all blog posts are relevant** -- Some Palantir blog posts cover hiring, culture, or unrelated tech. Assign `quality: 2` for tangentially relevant content, `quality: 1` for irrelevant.
4. **Don't deep-extract yet** -- P3 produces catalog entries. Deep RAG extraction with entities/relationships happens in P5.
5. **Medium rate limiting** -- If Chrome automation starts getting blocked, add delays between requests (2-5 seconds). Monitor for CAPTCHA/blocks.
6. **Merge carefully** -- Some blog URLs may already exist in master.json from P2 web research. Use URL-based dedup with merge strategy.
