# Phase 3 Orchestrator Prompt — Blog Post Enrichment

Copy-paste this prompt to start Phase 3.

## Context

Phase 2 (Web Research) is complete. We have a `master.json` with web research entries in `outputs/p2-web-research/`. Now we need to enrich the 136 curated blog posts from `resources/blog-posts-articles-and-resources.md` — these are URLs we know are valuable but lack structured metadata.

## Your Mission

Process every URL in `resources/blog-posts-articles-and-resources.md` and produce `WebResearchLink` entries for each.

### Steps

1. Parse `resources/blog-posts-articles-and-resources.md` to extract all URLs (markdown link format `[title](url)`)

2. For each URL:
   - Fetch the page content (respect rate limits — add 1-2s delay between requests)
   - Extract the page title, publication date, and main content
   - Synthesize a 2-4 sentence summary focusing on Palantir Ontology relevance
   - Categorize into one of: `ontology-core`, `data-integration`, `ai-llm`, `security`, `architecture`, `engineering-culture`, `case-study`
   - Identify which of the 9 core concepts (Object Type, Property, etc.) the post covers
   - Assign relevance tags and a quality score (1-5)
   - Create a `WebResearchLink` entry with `"source": "blog-list"`

3. Save all entries to `outputs/p3-blog-enrichment/enriched-blogs.json`

4. Merge with the P2 master:
   - Load `outputs/p2-web-research/master.json`
   - Append P3 entries
   - Deduplicate by URL (same merge strategy as P2 — keep richer metadata)
   - Write updated master to `outputs/p2-web-research/master.json` (cumulative)

5. Update `outputs/manifest.json` with P3 output references and counts

### Parallelization Strategy

If processing 136 URLs sequentially is too slow, batch them:
- Split into 4 batches of ~34 URLs each
- Process batches in parallel (4 sub-agents)
- Join results before deduplication

## Critical Constraints

- Respect rate limits — don't hammer blog.palantir.com; 1-2 second delays between fetches
- Some posts may be behind Medium's metered paywall — if content isn't accessible, still create an entry with title and URL but set `quality: 1` and note "content not accessible" in summary
- No coding standards required — use Python, curl, Node.js, whatever is fastest
- Focus summaries on Ontology-relevant content, not general blog fluff

## Success Criteria

- [ ] All 136 blog URLs processed
- [ ] `enriched-blogs.json` produced with WebResearchLink entries
- [ ] Master JSON updated with P3 entries (deduped)
- [ ] `manifest.json` updated

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P3.md`
