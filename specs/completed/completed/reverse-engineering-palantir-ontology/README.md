# Reverse Engineering the Palantir Ontology

> Compile comprehensive resources from web research, documentation, blog posts, and open-source repositories, then extract structured knowledge into a Graphiti knowledge graph — enabling a future spec to reconstruct a domain-agnostic "Palantir Light" Ontology system.

## Quick Navigation

- [Quick Start](./QUICK_START.md) - 5-minute triage
- [Blog Posts & Resources](./resources/blog-posts-articles-and-resources.md) - Curated Palantir blog links
- [Reflection Log](./REFLECTION_LOG.md) - Cumulative learnings

## Purpose

**Problem:** Palantir has built one of the most sophisticated data-modeling and application frameworks in the world, used by the US military, intelligence agencies, and Fortune 500 companies. Their Ontology system — encompassing Object types, Properties, Link types, Action types, Roles, Functions, Interfaces, and Object views — enables secure, robust applications with reduced AI hallucination, fine-grained access control, and domain-agnostic entity extraction. However, this system is proprietary and undocumented at an architectural level.

**Solution:** Systematically harvest knowledge from Palantir's extensive public resources (190+ blog posts, open-source repos, documentation, SDKs) and structure it into a queryable knowledge graph. This graph becomes the foundation for a subsequent reverse-engineering and reconstruction effort.

**Why it matters:** With a comprehensive, structured knowledge base, we can design a "Palantir Light" — a smaller-scale, domain-agnostic Ontology system suitable for wealth management firms, law firms, and other enterprises that need secure, data-model-driven applications without Palantir's scale or cost.

## Core Concepts Under Study

| Concept | Description | Why It Matters |
|---------|-------------|----------------|
| **Object Type** | Entity definitions in the Ontology (e.g., Customer, Transaction) | Foundation of domain modeling |
| **Property** | Typed attributes on Object Types | Data shape and validation |
| **Shared Property** | Properties reused across Object Types | Cross-domain consistency |
| **Link Type** | Typed relationships between Object Types | Graph-based data modeling |
| **Action Type** | Operational mutations with validation and side effects | Workflow automation |
| **Roles** | Permission scoping for Ontology operations | Access control and security |
| **Functions** | Computation layer over the Ontology | Business logic abstraction |
| **Interfaces** | Abstract contracts that Object Types implement | Polymorphism and composability |
| **Object Views** | Presentation/security-scoped projections of Objects | Multi-tenant data access |

## Data Schemas

### WebResearchLink (Phases 2-5a)

All web-sourced research data follows this schema:

```ts
type WebResearchLink = {
  url: string                    // Source URL
  title: string                  // Page title
  summary: string                // Synthesized summary (2-4 sentences)
  category: string               // Research category (see Phase 2 agent assignments)
  relevantParts: Array<string>   // Why this source is relevant to our goals
  tags: Array<string>            // Keywords for search/filtering
  source: "web-search" | "blog-list" | "docs-scraper"
  contentType: "article" | "documentation" | "video" | "code-example" | "api-reference" | "tutorial" | "whitepaper"
  datePublished?: string         // ISO date when source was published
  relatedConcepts: Array<string> // Palantir concepts covered (from Core Concepts table)
  quality: number                // 1-5 relevance/depth score (agent-assessed)
}
```

### RepoAnalysisResult (Phase 4b)

Code repository analysis uses a richer, repo-specific format:

```ts
type RepoAnalysisResult = {
  repo: string                   // Repository name (e.g., "osdk-ts")
  repoUrl: string                // Full GitHub URL
  summary: string                // What this repo does and why it matters
  ontologyConcepts: Array<{
    concept: string              // Palantir concept name
    evidence: string             // How this concept manifests in the code
    files: Array<string>         // Key files where this concept appears
  }>
  apiSurface: Array<{
    name: string                 // API/type/function name
    type: string                 // "class" | "interface" | "function" | "type" | "enum" | "constant"
    description: string          // What it does
  }>
  architecturePatterns: Array<string>  // Architectural patterns observed
  typeDefinitions: Array<{
    name: string                 // Type name
    definition: string           // Simplified type definition
    purpose: string              // Why this type exists
  }>
  dependencies: Array<string>    // Key dependencies
  tags: Array<string>            // Keywords
}
```

## Output Directory Structure

```
outputs/
  p1-schema-design/              # KG schema research and design docs
  p2-web-research/               # Per-agent JSONs + joined/deduped master
  p3-blog-enrichment/            # Blog post enrichment JSONs
  p4a-docs-scraper/              # Docs scraper code + output JSONs
  p4b-repo-analysis/             # Per-repo analysis JSONs
  p5-rag-enrichment/             # RAG-enriched content JSONs
  p6-graph-pipeline/             # Graph construction scripts + logs
  p7-verification/               # Verification report
  manifest.json                  # Unified index referencing all sources
```

## Success Criteria

- [ ] Knowledge graph schema designed, reviewed, and documented
- [ ] 5 parallel web research agents produce categorized WebResearchLink data
- [ ] 136 curated blog posts enriched with metadata
- [ ] palantir.com/docs systematically scraped and cataloged
- [ ] All 18 Palantir open-source repos analyzed with RepoAnalysisResult
- [ ] RAG pipeline extracts deep knowledge from web content
- [ ] Graphiti knowledge graph populated with all extracted data
- [ ] Graph queries return meaningful results for all 9 core concepts
- [ ] Verification report confirms coverage and relationship quality

## Architecture Decision Records

| ID | Decision | Rationale |
|----|----------|-----------|
| AD-001 | Graphiti + FalkorDB for knowledge graph | Already deployed and operational (shared-memories spec); temporal knowledge graph with relationship tracking and deduplication |
| AD-002 | Separate schemas for web vs repo data | Repos contain code artifacts requiring richer structural analysis; web content is narrative/descriptive |
| AD-003 | URL-based deduplication with merge strategy | Multiple agents may find same URLs; keep entry with richer metadata (more tags, longer summary) |
| AD-004 | Parallel execution of P4a (docs) + P4b (repos) | Independent data sources with no cross-dependencies; saves wall-clock time |
| AD-005 | KG schema designed upfront (P1) before data collection | Knowing target schema informs what to extract; avoids retrofitting data to schema |
| AD-006 | No repository coding standards enforced | All code is archival/disposable; agents should use whatever tools and patterns are most effective |
| AD-007 | Research-first approach to KG schema design | Deploy research agents to study state-of-the-art KG approaches before committing to a schema |
| AD-008 | Unified manifest.json indexes all phase outputs | Single entry point for P6 graph construction; tracks provenance across phases |

## Phase Breakdown

| Phase | Focus | Outputs | Agent(s) | Sessions |
|-------|-------|---------|----------|----------|
| P0 | Scaffolding | Spec structure, README, schemas | doc-writer | 1 |
| P1 | KG Schema Design | Schema research, entity/relationship design | 3 research agents + 1 synthesis | 1-2 |
| P2 | Web Research | 5 category-focused WebResearchLink JSONs + master | 5 web-research agents | 1 |
| P3 | Blog Enrichment | Enriched blog post metadata JSON | 1-2 enrichment agents | 1 |
| P4 | Docs Scraper + Repo Analysis | Docs links JSON + 18 repo analysis JSONs | 1 scraper + 18 repo agents | 1-2 |
| P5 | RAG Enrichment | Deep-extracted content JSON | 1 pipeline agent | 1 |
| P6 | KG Construction | Graph construction script + ingestion logs | 1 builder agent | 1 |
| P7 | Verification | Verification report, query tests | 1 verification agent | 1 |

## Phase Exit Criteria

| Phase | Done When |
|-------|-----------|
| P0 | Spec structure exists, README complete, schemas defined |
| P1 | KG schema designed, research synthesized, user has reviewed and approved schema |
| P2 | All 5 agents complete, JSONs joined + deduped into master, manifest updated |
| P3 | All 136 blog URLs processed, enriched JSON joined to manifest |
| P4 | Docs scraper has crawled palantir.com/docs; all 18 repos analyzed; outputs in manifest |
| P5 | RAG pipeline has processed all web content; enriched JSON produced |
| P6 | Graphiti graph populated with all data; construction logs clean |
| P7 | Verification report confirms coverage of all 9 core concepts with meaningful relationships |

## Complexity Assessment

```
Phases:       8  x2 = 16
Agents:      30+ x3 = 90  (5 web + 18 repo + 3 schema + research + pipeline + builder + verifier)
CrossPkg:     0  x0.5= 0
ExtDeps:      3  x3 =  9  (Graphiti, web scraping, LLM for RAG)
Uncertainty:  3  x5 = 15  (docs site structure, RAG quality, graph schema fitness)
Research:     3  x2 =  6  (KG schema, web research, blog enrichment)
                     ----
Total:             136  -> High complexity
```

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| palantir.com/docs blocks automated scraping | Medium | Medium | Respect robots.txt; use browser automation if needed; fall back to manual curation |
| Blog posts behind Medium paywall | Low | Low | Most Palantir blogs are freely accessible; archive.org as fallback |
| RAG extraction quality varies by content type | Medium | High | Multiple extraction strategies; human review of sample outputs |
| KG schema doesn't fit Graphiti's data model | High | Low | P1 research specifically studies Graphiti internals; iterative schema refinement |
| 18 parallel repo agents cause rate limiting | Low | Low | Repos are local git subtrees, no API calls needed |
| Graph becomes too large for useful queries | Medium | Low | Scope entity types; use Graphiti's group_id for partitioning |
| Web research agents find low-quality sources | Medium | Medium | Quality scoring (1-5) in schema; filter low-quality in P6 ingestion |

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Graphiti + FalkorDB (Docker) | Infrastructure | Operational (shared-memories spec) |
| 18 Palantir repos in `.repos/palantir/` | Local | Cloned as git subtrees |
| Blog post list in `resources/` | Local | Curated (136 links) |
| LLM API access (for RAG enrichment) | External | Available |
| Web access (for research + scraping) | External | Available |

## Palantir Repository Inventory

### High Relevance (Core Ontology/SDK)

| Repo | Purpose |
|------|---------|
| `osdk-ts` | TypeScript Ontology SDK — primary client for interacting with Ontology |
| `foundry-platform-typescript` | TypeScript bindings for Foundry platform APIs |
| `ontology-starter-react-app` | Skeleton React app demonstrating OSDK usage |
| `defense-sdk-examples` | JADC2 SDK examples (Defense Ontology + Gotham integration) |
| `palantir-mcp` | Model Context Protocol integration |
| `aip-community-registry` | Community SDKs, frameworks, workflows built on AIP |

### Medium Relevance (API/Infrastructure)

| Repo | Purpose |
|------|---------|
| `conjure` | HTTP/JSON API toolchain (code generation framework) |
| `conjure-typescript` | TypeScript code generator for Conjure APIs |
| `conjure-typescript-runtime` | Runtime support for generated Conjure code |
| `conjure-typescript-example` | Example frontend using Conjure |
| `terraform-provider-palantir-foundry` | Terraform IaC for Foundry resources |
| `typescript-compute-module` | Computation module framework |
| `pack` | Platform Application Capabilities Kit (ALPHA) |

### Lower Relevance (Utilities/UI)

| Repo | Purpose |
|------|---------|
| `blueprint` | React UI component design system |
| `workshop-iframe-custom-widget` | Workshop iframe communication plugin |
| `hadoop-crypto` | Hadoop encryption utilities |
| `metric-schema` | Schema definitions for metrics |

## Implementation Freedom

> **AD-006: No repository coding standards enforced.** All code produced in this spec is archival — it exists to accomplish the research and extraction goals, not to become part of the production codebase. Agents have full freedom to use whatever languages, tools, patterns, and approaches are most effective. No Effect patterns, Schema annotations, or TypeScript conventions required. Use Python, shell scripts, Node.js, or whatever gets the job done fastest and most reliably.

## Key Files

| File | Purpose |
|------|---------|
| `specs/.../README.md` | This file — master spec |
| `specs/.../QUICK_START.md` | 5-minute orientation |
| `specs/.../resources/blog-posts-articles-and-resources.md` | Curated blog link list |
| `specs/.../resources/images/` | Reference architecture diagrams |
| `specs/.../outputs/manifest.json` | Unified index of all phase outputs |
| `.repos/palantir/` | 18 cloned Palantir open-source repositories |

## Related Specs

- **[shared-memories](../../completed/shared-memories/README.md)** — Provides the Graphiti + FalkorDB infrastructure this spec builds on. The knowledge graph produced here will be stored in the same Graphiti instance, potentially using a dedicated `group_id` (e.g., `palantir-ontology`) to separate it from development memories in `beep-dev`.
- **[semantic-codebase-search](../../completed/semantic-codebase-search/README.md)** — Provides MCP-based codebase search. May be useful for agents analyzing the cloned Palantir repos in Phase 4b.
