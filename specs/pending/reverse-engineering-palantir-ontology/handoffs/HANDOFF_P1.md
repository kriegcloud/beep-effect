# Handoff P1: Knowledge Graph Schema Design

## Context Budget

| Memory Type | Budget | Estimated | Status |
|-------------|--------|-----------|--------|
| Working | 2,000 | ~1,900 | OK |
| Episodic | 1,000 | ~500 | OK |
| Semantic | 500 | ~450 | OK |
| Procedural | Links | Links | OK |

## Working Memory (Current Phase)

### Phase 1 Goal
Deploy 3 parallel research agents to study KG schema design approaches, Graphiti internals, and Palantir Ontology concepts. Synthesize findings into a knowledge graph schema that maps all 9 core Palantir Ontology concepts to Graphiti-compatible entity types and relationships.

### Deliverables
1. `outputs/p1-schema-design/research-kg-best-practices.md` -- Property graph design patterns, temporal KG approaches, meta-ontology strategies
2. `outputs/p1-schema-design/research-graphiti-internals.md` -- Graphiti's native data model, node/edge/episode structure, constraints
3. `outputs/p1-schema-design/research-palantir-concepts.md` -- All named Palantir Ontology concepts, their relationships, OSDK type system
4. `outputs/p1-schema-design/kg-schema-design.md` -- Final synthesized schema with entity catalog, relationship catalog, and concept mapping

### Success Criteria
- [ ] 3 research documents produced (KG best practices, Graphiti internals, Palantir concepts)
- [ ] KG schema design document with entity and relationship catalogs
- [ ] Schema maps all 9 core Palantir concepts (Object Type, Property, Shared Property, Link Type, Action Type, Roles, Functions, Interfaces, Object Views)
- [ ] Schema is compatible with Graphiti's data model (nodes, edges, episodes)
- [ ] User has reviewed and approved the schema

### Agent Assignments

**Agent 1 -- KG Best Practices (Web Research):**
- Search for state-of-the-art property graph schema design patterns
- Research temporal knowledge graphs and how they handle time-evolving data
- Study entity type hierarchies vs flat entity lists (tradeoffs)
- Investigate relationship typing strategies for domain modeling
- Focus on "meta-ontology" approaches -- how to represent an ontology about ontologies in a KG
- Output: `outputs/p1-schema-design/research-kg-best-practices.md`

**Agent 2 -- Graphiti Internals (Source Code Analysis):**
- Study how Graphiti structures nodes, edges, and episodes
- Catalog native entity types and relationship types Graphiti supports
- Document constraints and limitations of the Graphiti schema model
- Understand how `group_id` partitioning works for data isolation
- Check Graphiti MCP server source code (GitHub or local reference)
- Output: `outputs/p1-schema-design/research-graphiti-internals.md`

**Agent 3 -- Palantir Ontology Concepts (Documentation + Code):**
- Survey Palantir's public documentation and blog posts for all named concepts
- Catalog: Object Type, Property, Shared Property, Link Type, Action Type, Roles, Functions, Interfaces, Object Views
- Map how these 9 concepts relate to each other (parent-child, composition, dependency)
- Examine the OSDK type system from `.repos/palantir/osdk-ts`
- Examine Foundry platform data model from `.repos/palantir/foundry-platform-typescript`
- Extract any public schema/type definitions that reveal internal structure
- Output: `outputs/p1-schema-design/research-palantir-concepts.md`

### Synthesis Step (After All 3 Agents Complete)

1. Read all 3 research outputs
2. Design a KG schema that maps Palantir Ontology concepts to Graphiti-compatible entity types and relationships
3. Document the schema with:
   - **Entity type catalog**: name, description, properties, examples for each entity type
   - **Relationship type catalog**: name, source entity, target entity, properties for each relationship
   - **Concept mapping table**: how each of the 9 core Palantir concepts maps to entity types in the schema
   - **`group_id` strategy**: use `palantir-ontology` to isolate from `beep-dev` development memories
4. Write to `outputs/p1-schema-design/kg-schema-design.md`
5. Present to user for review and iterate based on feedback

### Blocking Issues
- Graphiti's internal schema model may impose constraints not documented in public README -- Agent 2 must check source code
- Palantir's Ontology concepts may have undocumented sub-concepts that only surface in OSDK code -- Agent 3 must check type definitions

### Key Constraints
- Study Graphiti's ACTUAL data model, not assumptions -- check source code
- Use `group_id: "palantir-ontology"` to separate from `beep-dev` development memories
- No coding standards required -- use whatever format is clearest for the research docs
- The schema design is the MOST IMPORTANT output of this phase -- it shapes all downstream data collection
- Schema must be extensible for future concepts we haven't discovered yet

### Implementation Order
1. Launch 3 research agents in parallel (KG best practices, Graphiti internals, Palantir concepts)
2. Wait for all 3 agents to complete
3. Read all 3 research documents
4. Synthesize into unified KG schema design
5. Write schema design document
6. Present to user for review
7. Iterate based on feedback until approved

## Episodic Memory (Previous Context)

### P0 Outcomes
- Spec structure scaffolded: README.md, QUICK_START.md, data schemas, output directory plan
- Two data schemas defined: `WebResearchLink` (for web/blog/docs data) and `RepoAnalysisResult` (for code repository analysis)
- 8 Architecture Decision Records documented (AD-001 through AD-008)
- AD-005 specifically mandates: "KG schema designed upfront (P1) before data collection" -- knowing target schema informs what to extract
- AD-007 mandates: "Research-first approach to KG schema design" -- study state-of-the-art before committing
- 136 curated blog links collected in `resources/blog-posts-articles-and-resources.md`
- 18 Palantir repos cloned as git subtrees in `.repos/palantir/`
- Graphiti + FalkorDB infrastructure already operational (from shared-memories spec)

### Key Decisions Already Made
- AD-001: Graphiti + FalkorDB for knowledge graph (already deployed and operational)
- AD-002: Separate schemas for web vs repo data (repos need richer structural analysis)
- AD-005: KG schema designed upfront before data collection
- AD-006: No repository coding standards enforced (all code is archival/disposable)
- AD-007: Research-first approach to KG schema design

## Semantic Memory (Project Constants)

### 9 Core Palantir Ontology Concepts

| # | Concept | Description | Why It Matters |
|---|---------|-------------|----------------|
| 1 | **Object Type** | Entity definitions in the Ontology (e.g., Customer, Transaction) | Foundation of domain modeling |
| 2 | **Property** | Typed attributes on Object Types | Data shape and validation |
| 3 | **Shared Property** | Properties reused across Object Types | Cross-domain consistency |
| 4 | **Link Type** | Typed relationships between Object Types | Graph-based data modeling |
| 5 | **Action Type** | Operational mutations with validation and side effects | Workflow automation |
| 6 | **Roles** | Permission scoping for Ontology operations | Access control and security |
| 7 | **Functions** | Computation layer over the Ontology | Business logic abstraction |
| 8 | **Interfaces** | Abstract contracts that Object Types implement | Polymorphism and composability |
| 9 | **Object Views** | Presentation/security-scoped projections of Objects | Multi-tenant data access |

### Graphiti Connection Details

| Setting | Value |
|---------|-------|
| Graphiti MCP endpoint | `http://localhost:8000/mcp` |
| FalkorDB UI | `http://localhost:3001` |
| Health check | `http://localhost:8000/health` |
| `group_id` for this spec | `palantir-ontology` |
| `group_id` for dev memories | `beep-dev` (DO NOT use) |
| Systemd service | `graphiti-mcp` |
| Data persistence | `~/graphiti-mcp/data/` |

### Output Paths

| Output | Path (relative to spec root) |
|--------|------------------------------|
| KG best practices research | `outputs/p1-schema-design/research-kg-best-practices.md` |
| Graphiti internals research | `outputs/p1-schema-design/research-graphiti-internals.md` |
| Palantir concepts research | `outputs/p1-schema-design/research-palantir-concepts.md` |
| Final schema design | `outputs/p1-schema-design/kg-schema-design.md` |
| Spec root | `specs/pending/reverse-engineering-palantir-ontology/` |

### Palantir Repository Locations (for Agent 3)

| Repo | Local Path | Relevance |
|------|------------|-----------|
| `osdk-ts` | `.repos/palantir/osdk-ts` | High -- TypeScript OSDK, primary client for Ontology |
| `foundry-platform-typescript` | `.repos/palantir/foundry-platform-typescript` | High -- TypeScript bindings for Foundry APIs |
| `ontology-starter-react-app` | `.repos/palantir/ontology-starter-react-app` | High -- Skeleton app showing OSDK usage |
| `defense-sdk-examples` | `.repos/palantir/defense-sdk-examples` | High -- JADC2 SDK, Defense Ontology |
| `palantir-mcp` | `.repos/palantir/palantir-mcp` | High -- MCP integration |
| `conjure` | `.repos/palantir/conjure` | Medium -- HTTP/JSON API framework |

## Procedural Memory (Reference Links)

### Primary References
- [Spec README](../README.md) -- Master spec with full context, schemas, and phase breakdown
- [Blog Posts & Resources](../resources/blog-posts-articles-and-resources.md) -- 136 curated Palantir blog links (Agent 3 may sample these)
- [Graphiti MCP Server README](https://github.com/getzep/graphiti/blob/main/mcp_server/README.md) -- Official Graphiti docs
- [Graphiti Source Code](https://github.com/getzep/graphiti) -- For Agent 2 to study internal data model
- [FalkorDB Documentation](https://docs.falkordb.com/) -- Graph DB that backs Graphiti

### Palantir Public Resources (for Agent 1 and Agent 3)
- [Palantir Blog](https://blog.palantir.com) -- Primary blog
- [Palantir Documentation](https://www.palantir.com/docs/) -- Official documentation
- [Palantir OSDK GitHub](https://github.com/palantir/osdk-ts) -- TypeScript Ontology SDK
- [Palantir Foundry Platform TS](https://github.com/palantir/foundry-platform-typescript) -- Platform API bindings

### Related Specs
- [shared-memories spec](../../completed/shared-memories/README.md) -- Provides the Graphiti + FalkorDB infrastructure this spec builds on

## Verification Steps

```bash
# 1. Verify output directory exists
ls -la specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/

# 2. Verify all 3 research documents were produced
test -f specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/research-kg-best-practices.md && echo "OK" || echo "MISSING"
test -f specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/research-graphiti-internals.md && echo "OK" || echo "MISSING"
test -f specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/research-palantir-concepts.md && echo "OK" || echo "MISSING"

# 3. Verify final schema design exists
test -f specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/kg-schema-design.md && echo "OK" || echo "MISSING"

# 4. Verify schema covers all 9 concepts
grep -c "Object Type\|Property\|Shared Property\|Link Type\|Action Type\|Roles\|Functions\|Interfaces\|Object Views" \
  specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/kg-schema-design.md

# 5. Verify Graphiti is operational
curl -sf http://localhost:8000/health && echo "Graphiti OK" || echo "Graphiti DOWN"

# 6. Verify group_id strategy is documented
grep -c "palantir-ontology" specs/pending/reverse-engineering-palantir-ontology/outputs/p1-schema-design/kg-schema-design.md
```

## Known Issues & Gotchas

1. **Graphiti's schema model is implicit** -- Graphiti uses LLM-driven entity extraction, so "schema" is more about guiding extraction than hard constraints. The schema design should focus on entity type names, relationship names, and property lists that guide downstream extraction prompts.
2. **Meta-ontology is conceptually recursive** -- We're building an ontology about Palantir's Ontology system. Be clear about which level of abstraction each entity type lives at (our KG entities vs Palantir's domain entities).
3. **Palantir repos may have sparse type documentation** -- Many TypeScript type definitions in osdk-ts are auto-generated. Focus on the hand-written types and interfaces for concept extraction.
4. **Don't confuse Palantir "Object Types" with Graphiti "entity types"** -- Palantir Object Types are domain entities (Customer, Transaction). In our KG, "ObjectType" is itself an entity type representing the Palantir concept.
5. **`group_id: "palantir-ontology"` MUST be used** -- Do NOT write to `beep-dev` group, which contains development memories from other specs.
6. **User review is required before P1 is complete** -- The schema design must be presented to and approved by the user before moving to P2.
