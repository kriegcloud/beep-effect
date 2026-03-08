# Design: PAO Blog Post — "Mapping the Domain of a Personal AI Agent"

**Date**: 2026-02-23
**Status**: Approved

## Overview

A blog post for mepuka.me introducing the Personal Agent Ontology (PAO) — a
formal OWL 2 ontology that maps the architectural domain of personal AI agents.
Framed as exploratory domain cartography, not academic documentation.

## Audience

Both curious technical readers (backend engineers, AI enthusiasts) and
developers actively building AI agent systems. Accessible first, substantive
second.

## Tone

Exploratory, thinking-out-loud. "I got curious about what the shared
architecture across agent implementations actually looks like, and tried to
map it formally." Similar to the existing post style on mepuka.me.

## Motivation (from the author)

In the wake of OpenClaw, Claude Code, and the proliferation of personal agent
implementations, classify the major structures and architecture of agent systems
by examining academia, open-source, and closed-source implementations. Use
formal ontology modeling techniques to make the architecture explicit.

## Structure (5 Sections, ~2,100 words)

### 1. Hook (~300 words)

- The proliferation of personal agent implementations (OpenClaw, Claude Code,
  custom builds) — everyone making similar architectural choices with different
  vocabularies.
- The idea: use formal ontology engineering to map the shared domain.
- Introduce PAO briefly: 115 classes, 9 modules, BFO-aligned, built from
  academic research + real implementations.
- Link to the pyLODE HTML documentation up front.

### 2. What Is a Personal Agent? (~400 words)

- Even the most basic question reveals hidden structure.
- Agent hierarchy: Agent → AIAgent, HumanUser, SubAgent.
- Persona, Roles, Organization — the identity layer most implementations leave
  implicit.
- BFO alignment: agents as both Objects and Generically Dependent Continuants
  (the pragmatic deviation, briefly).
- **Diagram**: Actor/identity class hierarchy (SVG).

### 3. The Conversation Stack (~500 words)

- Conversation → Session → Turn → Message → ContentBlock.
- Each layer adds structure that real systems need: session status transitions,
  tool invocation groups, content block types.
- ContextWindow and CompactionEvent — what happens when context overflows is a
  first-class architectural concern, not an afterthought.
- DialogActs and communicative functions — the pragmatics layer.
- **Diagram**: Conversation stack hierarchy (SVG).

### 4. Memory Is Not a Database (~500 words)

- Multi-tier architecture: Working, Episodic, Semantic, Procedural memory.
- Memory operations as first-class processes: Encoding, Retrieval,
  Consolidation, Forgetting, Rehearsal.
- Provenance chains via PROV-O — every memory item tracks where it came from.
- The parallel to cognitive science: agent memory has more in common with human
  memory models than with database schemas.
- SharedMemoryArtifact and write conflicts — multi-agent memory.
- **Diagram**: Memory tier architecture (SVG).

### 5. The Full Map (~400 words)

- Brief survey of remaining modules:
  - Goals, Plans & the BDI model (Belief-Desire-Intention from philosophy)
  - Governance & Safety (permission policies, audit trails, consent)
  - External Services & Integration (capability discovery, MCP alignment)
  - Error Recovery & Observability (checkpoints, retry, reliability incidents)
  - Scheduling & Automation (triggers, concurrency, execution outcomes)
- Return to the opening: what did formal modeling reveal?
  - The architecture is converging across implementations.
  - The ontology makes the shared structure explicit — a vocabulary, not a
    prescription.
- Link to: pyLODE HTML docs, GitHub repo, invite discussion.
- **Diagram**: Full module map (SVG) — all 9 modules and their relationships.

## Deliverables

1. **Blog post**: `src/content/blog/personal-agent-ontology.mdx` in the
   mepuka-website repo.
2. **pyLODE HTML documentation**: Generated from PAO, hosted as a static page
   on the site (e.g., at `/pao/` or linked externally).
3. **SVG diagrams** (4-5): Stored in `public/blog/personal-agent-ontology/`.
   - Actor/identity hierarchy
   - Conversation stack
   - Memory tier architecture
   - Full module map
4. **Tags**: `[ontology, agents, knowledge-graphs, architecture]`

## Technical Notes

- **pyLODE**: Install via `uv add --group dev pylode`, generate HTML from the
  PAO Turtle file.
- **Diagrams**: Generate SVGs from the ontology class hierarchy. Options:
  - Mermaid diagrams rendered to SVG
  - ROBOT viz or custom Python script using rdflib + graphviz
  - Hand-drawn in Mermaid for cleaner control over what's shown
- **Blog format**: Astro MDX with frontmatter
  (title, description, date, tags, draft).
- **Media path**: `/public/blog/personal-agent-ontology/` for SVGs.

## Out of Scope (for this post)

- The AI-assisted development process (POD methodology) — save for a follow-up
  post (Approach C from brainstorming).
- Deep dive into SHACL shapes, SPARQL tests, or the validation pipeline.
- Formal ontology theory (OWL 2 DL, description logics) — keep it practical.
- Comparison with specific agent frameworks' internals.
