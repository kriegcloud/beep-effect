# Phase 2 Orchestrator Prompt — Web Research (Team Mode)

Copy-paste this prompt to start Phase 2.

## Context

Phase 1 (KG Schema Design) is complete. We have a reviewed and approved knowledge graph schema in `outputs/p1-schema-design/kg-schema-design.md`. Now we need to gather raw web research data.

## Your Mission

Use Claude's team mode to deploy 5 parallel web research agents. Each agent focuses on a specific category of Palantir knowledge, searching the web comprehensively and producing structured JSON output.

### Agent Assignments

**Agent 1 — Ontology Core:**
Research Palantir's Ontology primitives: Object Types, Properties, Shared Properties, Link Types, Action Types, Object Views. How are these defined? How do they compose? What patterns does Palantir recommend?

**Agent 2 — Data Integration & Foundry:**
Research Palantir Foundry architecture, data pipelines, data connection, OSDK, data modeling patterns, dataset versioning, and how the Ontology bridges raw data to applications.

**Agent 3 — AI/LLM & AIP:**
Research Palantir AIP (AI Platform), RAG/OAG patterns, hallucination reduction via Ontology, semantic search, AI agents on Ontology, and how the Ontology provides grounding for LLMs.

**Agent 4 — Security & Access Control:**
Research Palantir's security model: Roles, purpose-based access controls, marking-based security, data protection, audit trails, zero trust architecture, and how the Ontology enforces access policies.

**Agent 5 — Architecture & SDKs:**
Research Palantir's technical architecture: Conjure API framework, TypeScript/React SDKs, compute modules, deployment patterns, Workshop, and how developers build applications on the Ontology.

### Per-Agent Instructions

Each agent must:

1. Search the web broadly for their category — Palantir's blog, documentation, conference talks, third-party analyses, case studies
2. For each valuable source found, create a `WebResearchLink` entry:
   ```json
   {
     "url": "https://...",
     "title": "Page Title",
     "summary": "2-4 sentence synthesized summary",
     "category": "ontology-core | data-integration | ai-llm | security | architecture",
     "relevantParts": ["Why this is relevant #1", "Why this is relevant #2"],
     "tags": ["keyword1", "keyword2"],
     "source": "web-search",
     "contentType": "article | documentation | video | ...",
     "datePublished": "2024-01-15",
     "relatedConcepts": ["Object Type", "Link Type"],
     "quality": 4
   }
   ```
3. Aim for 20-50 high-quality entries per agent
4. Save output to `outputs/p2-web-research/agent-{N}-{category}.json`

### Join & Deduplicate

After all 5 agents complete:

1. Load all 5 JSON files
2. Deduplicate by URL — when duplicates exist, keep the entry with:
   - More tags
   - Longer summary
   - Higher quality score
   - More relatedConcepts
3. Sort by category, then by quality (descending)
4. Write joined output to `outputs/p2-web-research/master.json`
5. Update `outputs/manifest.json` with entry counts and file paths

## Critical Constraints

- Search broadly — don't limit to blog.palantir.com; include Medium, YouTube transcripts, conference proceedings, third-party reviews
- Quality over quantity — a well-summarized entry with accurate tags is worth more than 10 shallow entries
- No coding standards required — use whatever scripting approach is fastest
- Each agent should independently verify URLs are accessible before including them

## Success Criteria

- [ ] 5 agent output JSONs in `outputs/p2-web-research/`
- [ ] Each agent found 20+ entries
- [ ] All entries conform to WebResearchLink schema
- [ ] `master.json` produced with deduplication applied
- [ ] `manifest.json` updated with P2 output references

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P2.md`
