# Phase 4 Orchestrator Prompt — Docs Scraper + Repo Analysis (Parallel)

Copy-paste this prompt to start Phase 4.

## Context

Phases 2-3 (Web Research + Blog Enrichment) are complete. We have a growing `master.json` with web research entries. Now we tackle two independent data sources in parallel:
- **P4a:** Systematically scrape `palantir.com/docs` for documentation links
- **P4b:** Analyze all 18 Palantir open-source repos for Ontology patterns

## Your Mission

Launch two parallel workstreams. They have zero dependencies on each other.

---

### P4a: Docs Scraper

Build and run a web scraper that walks `https://www.palantir.com/docs` collecting all documentation page URLs.

1. **Research the docs site structure:**
   - Visit `https://www.palantir.com/docs` and map the navigation/sitemap
   - Identify URL patterns (e.g., `/docs/foundry/`, `/docs/apollo/`)
   - Check for `robots.txt` and `sitemap.xml`

2. **Implement the scraper:**
   - Start at the docs root and crawl all links matching `/docs/**`
   - Deduplicate URLs, strip query params and fragments
   - For each page, extract: URL, page title, breadcrumb path, any meta description
   - Respect rate limits (1-2s between requests)

3. **Produce output:**
   - Save raw link list to `outputs/p4a-docs-scraper/docs-links.json`
   - Pre-fill `WebResearchLink` properties where possible:
     - `source: "docs-scraper"`
     - `contentType: "documentation"`
     - `category` based on URL path (e.g., `/docs/foundry/` → `data-integration`)
     - `title` from page `<title>` or `<h1>`
     - `summary` from meta description or first paragraph
     - Leave `quality`, `relatedConcepts`, `tags` for P5 RAG to fill
   - Save scraper source code to `outputs/p4a-docs-scraper/scraper.{py|ts|js}`

4. **Merge with master JSON and update manifest**

---

### P4b: Repo Analysis (18 agents)

Deploy one agent per Palantir repo in `.repos/palantir/`. Each agent produces a `RepoAnalysisResult` JSON.

**Per-Agent Instructions:**

1. Read the repo's README, package.json/build files, and directory structure
2. Identify the repo's primary purpose and how it relates to Palantir's Ontology
3. Search for Ontology-related concepts in the source code:
   - Type definitions for Object Types, Properties, Links, Actions
   - API endpoints or SDK methods that manipulate Ontology entities
   - Access control patterns, role definitions
   - Schema definitions, validation logic
4. Catalog the public API surface (exported types, classes, functions)
5. Note architectural patterns (code generation, plugin systems, middleware, etc.)
6. Produce a `RepoAnalysisResult` JSON

**Agent assignments:**

| Agent | Repo | Priority |
|-------|------|----------|
| 1 | `osdk-ts` | High |
| 2 | `foundry-platform-typescript` | High |
| 3 | `ontology-starter-react-app` | High |
| 4 | `defense-sdk-examples` | High |
| 5 | `palantir-mcp` | High |
| 6 | `aip-community-registry` | High |
| 7 | `conjure` | Medium |
| 8 | `conjure-typescript` | Medium |
| 9 | `conjure-typescript-runtime` | Medium |
| 10 | `conjure-typescript-example` | Medium |
| 11 | `terraform-provider-palantir-foundry` | Medium |
| 12 | `typescript-compute-module` | Medium |
| 13 | `pack` | Medium |
| 14 | `blueprint` | Lower |
| 15 | `workshop-iframe-custom-widget` | Lower |
| 16 | `hadoop-crypto` | Lower |
| 17 | `metric-schema` | Lower |

**Note:** If running 17 agents in parallel is impractical, batch by priority:
- Batch 1: High priority repos (agents 1-6)
- Batch 2: Medium priority repos (agents 7-13)
- Batch 3: Lower priority repos (agents 14-17)

Save outputs to `outputs/p4b-repo-analysis/{repo-name}.json`

---

## Critical Constraints

- P4a and P4b are INDEPENDENT — launch both workstreams simultaneously
- Repos are LOCAL git subtrees (`.repos/palantir/`) — no network access needed for P4b
- Docs scraper must respect `robots.txt` — if scraping is blocked, fall back to sitemap.xml or manual navigation
- No coding standards required — use whatever tools and languages are most effective
- Lower-priority repos may produce thin results — that's fine, capture what's there

## Success Criteria

- [ ] Docs scraper has crawled palantir.com/docs and produced link JSON
- [ ] Scraper source code saved in outputs
- [ ] All 18 repos analyzed (or as many as contain relevant content)
- [ ] Per-repo RepoAnalysisResult JSONs saved
- [ ] Master JSON updated with P4a entries
- [ ] Manifest updated with all P4 outputs

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P4.md`
