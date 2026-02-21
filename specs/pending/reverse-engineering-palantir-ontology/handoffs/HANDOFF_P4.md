# Handoff P4: Docs Scraping + Repository Analysis (Parallel)

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,500 | ~2,400 | OK |
| Episodic | 1,000 | ~700 | OK |
| Semantic | 500 | ~450 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 4 Goal
Two parallel workstreams:
- **P4a: Docs Scraper** -- Crawl palantir.com/docs using the sitemap, extract Ontology-relevant documentation pages, produce WebResearchLink entries
- **P4b: Repository Analysis** -- Analyze 18 cloned Palantir repositories for Ontology concepts, type definitions, and architectural patterns

### Deliverables

**P4a (Docs Scraper):**
1. `outputs/p4a-docs-scraper/docs-entries.json` -- WebResearchLink entries for all relevant docs pages
2. `outputs/p4a-docs-scraper/scrape-log.json` -- Success/failure per URL
3. Updated `outputs/p2-web-research/master.json` -- Merged with docs entries

**P4b (Repository Analysis):**
1. `outputs/p4b-repo-analysis/{repo-name}.json` -- RepoAnalysisResult per repository
2. `outputs/p4b-repo-analysis/summary.json` -- Aggregate summary across all repos

### P4a: Docs Scraper

#### POC-Validated Approach

**Docs pages are HTTP-accessible.** Validated in POC:
- `curl` and `WebFetch` both return 200 with full content
- Pages are server-side rendered (real HTML, not client-side JS)
- Sitemap at `https://www.palantir.com/docs/sitemap.xml` has ~5,000 pages
- No Chrome automation needed -- simple HTTP fetching works

#### Implementation

1. **Fetch sitemap** from `https://www.palantir.com/docs/sitemap.xml`
2. **Filter URLs** to Ontology-relevant paths. Priority patterns:
   - `/docs/foundry/ontology/` -- Direct Ontology docs
   - `/docs/foundry/osdk/` -- OSDK documentation
   - `/docs/foundry/functions/` -- Functions/queries
   - `/docs/foundry/actions/` -- Action Types
   - `/docs/foundry/security/` -- Security and access controls
   - `/docs/foundry/data-integration/` -- Data pipeline docs
   - `/docs/foundry/aip/` -- AI Platform docs
3. **Fetch each filtered page** via WebFetch or curl
4. **Classify and summarize** -- produce WebResearchLink entries with `source: "docs-scraper"`
5. **Merge into master.json** with deduplication

Expected: ~200-500 relevant pages out of 5,000 total

### P4b: Repository Analysis

#### POC-Validated Approach

**Local repo analysis works well.** Validated on osdk-ts in POC:
- Explored directory structure, found type definitions, mapped Ontology concepts
- Produced comprehensive RepoAnalysisResult with 8 concept mappings, 8 API surface entries, 8 architecture patterns

#### Repository Priority Tiers

**Tier 1 (Analyze First -- Highest Value):**

| Repo | GitHub URL | Focus |
|------|-----------|-------|
| osdk-ts | https://github.com/palantir/osdk-ts | TypeScript OSDK -- canonical Ontology type system |
| foundry-platform-typescript | https://github.com/palantir/foundry-platform-typescript | Foundry API bindings |
| ontology-starter-react-app | https://github.com/palantir/ontology-starter-react-app | OSDK usage patterns |
| defense-sdk-examples | https://github.com/palantir/defense-sdk-examples | Defense Ontology, JADC2 SDK |
| palantir-mcp | https://github.com/palantir/palantir-mcp | MCP integration with Ontology |
| aip-community-registry | https://github.com/palantir/aip-community-registry | AIP community tools and patterns |

**Tier 2 (Analyze Second -- Supporting Context):**

| Repo | GitHub URL | Focus |
|------|-----------|-------|
| conjure | https://github.com/palantir/conjure | HTTP/JSON API framework |
| conjure-typescript-runtime | https://github.com/palantir/conjure-typescript-runtime | Wire protocol |
| typescript-service-generator | https://github.com/palantir/conjure-typescript | Service code gen |
| osdk-ts-monorepo-template | https://github.com/palantir/osdk-ts-monorepo-template | OSDK project template |
| foundry-platform-java | https://github.com/palantir/foundry-platform-java | Java Foundry bindings |
| palantir-python-sdk | https://github.com/palantir/palantir-python-sdk | Python SDK |

**Tier 3 (Analyze If Time -- Infrastructure):**

| Repo | GitHub URL | Focus |
|------|-----------|-------|
| blueprint | https://github.com/palantir/blueprint | UI components |
| gradle-baseline | https://github.com/palantir/gradle-baseline | Build tooling |
| policy-bot | https://github.com/palantir/policy-bot | Code review automation |
| osdk-ts-e2e.generated.catchall | https://github.com/palantir/osdk-ts-e2e.generated.catchall | E2E test fixtures |
| foundry-frontend-config-example | https://github.com/palantir/foundry-frontend-config-example | Frontend config |
| open-source-scorecard | https://github.com/palantir/open-source-scorecard | OSS metrics |

#### RepoAnalysisResult Schema

```typescript
type RepoAnalysisResult = {
  repo: string;           // Repository name
  repoUrl: string;        // GitHub URL (NOT local path)
  summary: string;        // 3-5 sentence overview
  ontologyConcepts: Array<{
    concept: string;      // Which of the 9 core concepts
    evidence: string;     // What was found
    files: Array<string>; // GitHub URLs to relevant files
  }>;
  apiSurface: Array<{
    name: string;         // Function/class/interface name
    type: string;         // "function" | "interface" | "class" | "type" | "CLI"
    description: string;  // What it does
  }>;
  architecturePatterns: Array<string>;  // Design patterns observed
  typeDefinitions: Array<{
    name: string;         // Type/interface name
    definition: string;   // Abbreviated signature
    purpose: string;      // What it represents
  }>;
  dependencies: Array<string>;  // Key dependencies
  tags: Array<string>;          // Keyword tags
}
```

**IMPORTANT:** All file paths in `ontologyConcepts[].files` must be GitHub URLs (e.g., `https://github.com/palantir/osdk-ts/blob/main/packages/api/src/...`), NOT local `.repos/` paths. The local repos will be deleted after this spec completes.

### Implementation Order
1. Launch P4a (docs scraper) and P4b (repo analysis) in parallel
2. P4a: Fetch sitemap, filter, scrape relevant docs, produce entries
3. P4b: Analyze repos in tier order (Tier 1 first, then 2, then 3 if time)
4. P4a: Merge docs entries into master.json
5. P4b: Produce per-repo JSONs and summary.json

### Success Criteria

**P4a:**
- [ ] Sitemap fetched and filtered
- [ ] 100+ Ontology-relevant docs pages identified and processed
- [ ] docs-entries.json produced with valid WebResearchLink entries
- [ ] master.json updated with docs entries

**P4b:**
- [ ] All Tier 1 repos analyzed (6 repos)
- [ ] All Tier 2 repos analyzed (6 repos)
- [ ] Per-repo JSON files produced
- [ ] summary.json produced
- [ ] All file references use GitHub URLs (no local paths)

## Episodic Memory (Previous Context)

### P3 Outcomes
- 136 blog posts processed via Chrome browser automation
- blog-entries.json merged into master.json
- Category distribution and quality scores documented
- Blog fetch success rate and failure log available

### POC Findings (Critical for P4)
- **Docs pages work with HTTP** -- No Chrome automation needed. curl and WebFetch both return 200.
- **Sitemap has ~5,000 pages** -- Must filter aggressively to Ontology-relevant paths
- **Server-side rendered** -- Full HTML content in initial response, no JS execution needed
- **Repo analysis produces rich results** -- POC on osdk-ts found 5 core concept type definitions, 8 API surface entries, 28 wire property types, comprehensive architecture patterns

## Semantic Memory (Project Constants)

### Sitemap URL
`https://www.palantir.com/docs/sitemap.xml`

### Repository Locations

All repos are cloned locally at `.repos/palantir/{repo-name}` but all output references must use GitHub URLs: `https://github.com/palantir/{repo-name}`

### Output Paths

| Output | Path (relative to spec root) |
|--------|------------------------------|
| Docs entries | `outputs/p4a-docs-scraper/docs-entries.json` |
| Docs scrape log | `outputs/p4a-docs-scraper/scrape-log.json` |
| Per-repo analysis | `outputs/p4b-repo-analysis/{repo-name}.json` |
| Repo summary | `outputs/p4b-repo-analysis/summary.json` |
| Updated master | `outputs/p2-web-research/master.json` |

## Procedural Memory (Reference Links)

- [Spec README](../README.md) -- Master spec with both schemas
- [POC Report](../outputs/poc/poc-report.md) -- Validated docs fetching and repo analysis approaches
- [POC Repo Analysis](../outputs/poc/repo-analysis-osdk-ts.json) -- Example RepoAnalysisResult output
- [P4 Orchestrator Prompt](./P4_ORCHESTRATOR_PROMPT.md) -- Launch instructions

## Known Issues & Gotchas

1. **Docs sitemap is large** -- 5,000 pages. Filter FIRST, then fetch. Don't attempt to scrape all 5,000.
2. **Docs URL structure may change** -- Palantir occasionally restructures docs. Handle 301/404 gracefully.
3. **Repo analysis depth varies** -- Some repos (osdk-ts) are massive monorepos; others are tiny examples. Adjust analysis depth accordingly.
4. **GitHub URLs, not local paths** -- This is critical. Local repos will be deleted. ALL file references in RepoAnalysisResult must use `https://github.com/palantir/...` format.
5. **P4a and P4b are independent** -- They can run fully in parallel with no coordination.
6. **Some repos may be empty/minimal** -- A few repos (open-source-scorecard, policy-bot) may not contain Ontology-relevant content. Produce a minimal RepoAnalysisResult and note low relevance.
