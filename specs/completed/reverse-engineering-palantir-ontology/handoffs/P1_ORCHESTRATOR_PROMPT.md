# Phase 1 Orchestrator Prompt — Knowledge Graph Schema Design

Copy-paste this prompt to start Phase 1.

## Context

Phase 0 (Scaffolding) is complete. The spec structure, data schemas (WebResearchLink + RepoAnalysisResult), and architecture decisions are documented in `specs/pending/reverse-engineering-palantir-ontology/README.md`. We have 136 curated blog links, 18 cloned Palantir repos, and a running Graphiti + FalkorDB instance.

Before collecting data (P2-P5), we need to design the knowledge graph schema — the entity types, relationship types, and properties that will structure everything we extract.

## Your Mission

Use Claude's team mode to deploy 3 parallel research agents, then synthesize their findings into a schema design.

### Research Agents (parallel)

**Agent 1 — KG Best Practices:**
Search the web for state-of-the-art approaches to building knowledge graphs for technical domain modeling. Focus on:
- Property graph schema design patterns
- Temporal knowledge graphs (how Graphiti handles time)
- Entity type hierarchies vs flat entity lists
- Relationship typing strategies
- How to represent "meta-ontology" concepts (an ontology about ontologies)

Output: `outputs/p1-schema-design/research-kg-best-practices.md`

**Agent 2 — Graphiti Internals:**
Study Graphiti's data model by reading:
- The Graphiti MCP server source code (local reference or GitHub)
- How Graphiti structures nodes, edges, and episodes
- What entity types and relationship types Graphiti supports natively
- Constraints and limitations of the Graphiti schema model
- How `group_id` partitioning works

Output: `outputs/p1-schema-design/research-graphiti-internals.md`

**Agent 3 — Palantir Ontology Concepts:**
Survey Palantir's public documentation and blog posts to catalog:
- All named Ontology concepts (Object Type, Property, Shared Property, Link Type, Action Type, Roles, Functions, Interfaces, Object Views)
- How these concepts relate to each other
- The OSDK type system (from `.repos/palantir/osdk-ts`)
- Foundry platform data model (from `.repos/palantir/foundry-platform-typescript`)
- Any public schema/type definitions that reveal internal structure

Output: `outputs/p1-schema-design/research-palantir-concepts.md`

### Synthesis (after research completes)

1. Read all 3 research outputs
2. Design a KG schema that maps Palantir Ontology concepts to Graphiti-compatible entity types and relationships
3. Document the schema with:
   - Entity type catalog (name, description, properties, examples)
   - Relationship type catalog (name, source entity, target entity, properties)
   - How each of the 9 core concepts maps to the schema
   - Graphiti `group_id` strategy
4. Write the schema design to `outputs/p1-schema-design/kg-schema-design.md`

### Review

Present the schema design to the user for review. Iterate based on feedback. The schema should be:
- Comprehensive enough to capture all Palantir Ontology concepts
- Compatible with Graphiti's data model
- Extensible for future concepts we haven't discovered yet

## Critical Constraints

- Study Graphiti's ACTUAL data model, not assumptions — check source code
- Use `group_id: "palantir-ontology"` to separate from `beep-dev` development memories
- No coding standards required — use whatever format is clearest for the research docs
- The schema design is the MOST IMPORTANT output of this phase — it shapes everything downstream

## Success Criteria

- [ ] 3 research documents produced (KG best practices, Graphiti internals, Palantir concepts)
- [ ] KG schema design document with entity and relationship catalogs
- [ ] Schema maps all 9 core Palantir concepts
- [ ] Schema is compatible with Graphiti's data model
- [ ] User has reviewed and approved the schema

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P1.md`
