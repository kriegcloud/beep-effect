# Spec Formalization Bootstrap Prompt

> Preserved exploratory bootstrap artifact. This prompt created the formal spec package and is now superseded by `HANDOFF_P0.md` through `HANDOFF_P4.md` plus the corresponding orchestrator prompts.

> Superseded by the completed spec package artifacts in this directory and the root [README.md](../README.md). Retained as exploratory provenance for how this folder transitioned from shape discovery into a completed spec package.

## Usage

Historical provenance only. Do not use this prompt for current phase execution.

If you need to reconstruct the original formalization step, reuse the `text` block below.

This prompt is for creating the formal spec package for `@beep/semantic-web` from the exploratory material already captured in this repo.

## Copy/Paste Prompt

```text
Work from the repository root of the current workspace.

Your task is to turn the exploratory semantic-web folder that ultimately became `specs/completed/semantic-web` into the formal spec package for `@beep/semantic-web`.

This task is for spec authoring, not implementation.

You are not starting from a blank slate. The exploratory semantic-web folder already contains:

- local evidence
- subtree-backed research references
- Effect v4 module decisions
- provenance posture decisions
- semantic metadata pattern decisions
- foundation defaults that should be preserved unless stronger local evidence directly contradicts them

You must follow this repo contract:

1. Query Graphiti memory first if available, using the `beep_dev` group.
2. Read nearby specs, handoff prompts, and output artifacts before drafting the new spec.
3. Reuse existing spec structure and repo terminology where possible.
4. If the spec touches Effect work, treat `.repos/effect-v4` as the source of truth for API claims.
5. Distinguish clearly between source-grounded facts, assumptions, and proposed design.
6. Use `bun` for repo commands.
7. Do not write production package code. This prompt only covers the formal spec artifact set.
8. Do not reopen already-settled defaults unless stronger local evidence directly forces a change. If you override a settled default, cite the conflicting local evidence explicitly.
9. Keep scope inside `specs/completed/semantic-web` unless a nearby reference document must be read for evidence.
10. Do not discard exploratory artifacts silently. If you replace, merge, or supersede them, make the rationale explicit in the resulting docs.

Spec request:

- Spec title: `@beep/semantic-web`
- Spec slug or directory name: `semantic-web`
- Target location: `specs/completed/semantic-web`
- Objective: `Create a decision-complete formal spec package for a schema-first semantic-web foundation package that will own reusable semantic-web values, adapters, service contracts, and metadata patterns in this monorepo.`
- Success criteria: `The exploratory semantic-web folder is turned into a formal spec package with a normative README, quick start, design docs, implementation plans, handoff prompts, and outputs that clearly define the initial package topology, boundaries, phased work, and verification expectations for @beep/semantic-web.`
- Non-goals:
  - `Do not implement @beep/semantic-web.`
  - `Do not write production package code.`
  - `Do not treat JSON Schema as a substitute for SHACL or OWL semantics.`
  - `Do not use Effect Graph as the primary RDF semantic model.`
  - `Do not invent a metadata-heavy pattern for every trivial helper schema.`
- Required local references:
  - `specs/completed/semantic-web/README.md`
  - `specs/completed/semantic-web/QUICK_START.md`
  - `specs/completed/semantic-web/research/2026-03-08-initial-exploration.md`
  - `specs/completed/semantic-web/research/2026-03-08-effect-v4-module-selection.md`
  - `specs/pending/expert-memory-big-picture/research/Assessment of W3C PROV-O for Provenance in an Expert-Memory System.md`
  - `specs/completed/semantic-web/design/semantic-schema-metadata.md`
  - `specs/completed/semantic-web/design/foundation-decisions.md`
  - `packages/common/semantic-web/src/iri.ts`
  - `packages/common/schema/src/internal/ProvO/ProvO.ts`
  - `packages/common/semantic-web/README.md`
  - `packages/common/semantic-web/src/index.ts`
  - `.repos/beep-effect/packages/common/semantic-web/README.md`
  - `.repos/beep-effect/packages/common/semantic-web/src/uri/uri.ts`
  - `.repos/effect-v4/packages/effect/src/Schema.ts`
  - `.repos/semantic-web/jsonld.js`
  - `.repos/semantic-web/jsonld-context-parser.js`
  - `.repos/semantic-web/jsonld-streaming-parser.js`
  - `.repos/semantic-web/jsonld-streaming-serializer.js`
  - `.repos/semantic-web/rdf-canonize`
  - `.repos/semantic-web/traqula`
  - `.repos/semantic-web/comunica`
  - `.repos/semantic-web/shacl-engine`
- Existing specs or prompts to mirror:
  - `specs/pending/ip-law-knowledge-graph/README.md`
  - `specs/pending/ip-law-knowledge-graph/QUICK_START.md`
  - `specs/pending/ip-law-knowledge-graph/AGENT_PROMPTS.md`
  - `specs/pending/ip-law-knowledge-graph/REFLECTION_LOG.md`
  - `specs/pending/ip-law-knowledge-graph/handoffs/*`
  - `specs/pending/expert-memory-big-picture/*`
- Required sections:
  - `README.md`
  - `QUICK_START.md`
  - `AGENT_PROMPTS.md`
  - `REFLECTION_LOG.md`
  - `design/*`
  - `plans/*`
  - `handoffs/*`
  - `outputs/manifest.json`
- Required phases, workstreams, or handoffs:
  - `P0 Package Topology and Boundaries`
  - `P1 Core Schema and Value Design`
  - `P2 Adapter and Representation Design`
  - `P3 Service Contract and Metadata Design`
  - `P4 Implementation Plan and Verification Strategy`
  - `Create HANDOFF_P0-P4.md and P0-P4_ORCHESTRATOR_PROMPT.md`
- Locked defaults you should preserve:
  - `JSON-LD is first-class in the initial package surface.`
  - `@beep/semantic-web should be the canonical semantic-web foundation package.`
  - `The package posture is foundation plus adapters, not semantic-web maximalism.`
  - `IRI and ProvO are seed assets, not the whole package design.`
  - `Ontology builder DSL work stays experimental unless stronger local evidence justifies promotion.`
  - `Schema.toEquivalence(...) is the default equality surface for schema-modeled domain values.`
  - `Graph is projection-only and must not be used as the primary RDF semantic model.`
  - `Hash and Equal must not be treated as RDF semantic identity.`
  - `JsonPatch and JsonPointer are JSON-LD document-layer tools only.`
  - `generic XML encoding is not RDF/XML`
  - `Treat PROV-O as the interoperable provenance backbone, not as the whole expert-memory provenance solution.`
  - `Pair provenance design with explicit evidence anchoring and bounded provenance projections.`
  - `Do not force all lifecycle time semantics into plain PROV activity time fields.`
  - `Keep IRI and URI as separate first-class public concepts in v1, with IRI as the semantic default.`
  - `Use a minimal stable PROV profile in v1 with an extension tier instead of full-profile maximalism.`
  - `Treat Web Annotation as an adapter seam for evidence anchoring, not a hard package-wide dependency.`
  - `Make SemanticSchemaMetadata.kind a closed, intentionally coarse literal domain in v1.`
  - `Adopt the semantic schema metadata annotation pattern from specs/completed/semantic-web/design/semantic-schema-metadata.md for the right public schema families, but do not apply it indiscriminately to trivial internal helper schemas.`

Execution order:

1. Read the semantic-web exploratory entrypoints first:
   - `specs/completed/semantic-web/README.md`
   - `specs/completed/semantic-web/QUICK_START.md`
   - `specs/completed/semantic-web/research/2026-03-08-initial-exploration.md`
   - `specs/completed/semantic-web/research/2026-03-08-effect-v4-module-selection.md`
   - `specs/completed/semantic-web/design/semantic-schema-metadata.md`
   - `specs/completed/semantic-web/design/foundation-decisions.md`
2. Read the PROV-O assessment before finalizing provenance and evidence-anchoring design.
3. Read the nearby spec exemplars and explicitly mirror their structure where it improves execution clarity.
4. Only then draft the formal semantic-web spec artifact set.

Spec-writing requirements:

1. Start by inspecting the exploratory semantic-web folder and nearby spec patterns and summarize the structural patterns you will reuse.
2. Turn the current exploratory material into a decision-complete spec package, not a loose notes dump.
3. Make assumptions explicit instead of burying them.
4. Include concrete acceptance criteria and verification expectations.
5. Make the package boundary with `@beep/schema` explicit.
6. Treat the decisions in `specs/completed/semantic-web/design/foundation-decisions.md` as defaults to preserve unless stronger local evidence forces a change.
7. Decide the public module topology clearly enough that later implementation work can follow it without redoing the design.
8. Explicitly classify which upstream libraries are:
   - `adapter targets`
   - `implementation references`
   - `research-only references`
9. Make the semantic schema metadata pattern a formal part of the design, including where it is required versus optional.
10. Make the provenance posture explicit:
   - minimal stable PROV profile
   - evidence anchoring strategy
   - bounded projection strategy
   - lifecycle time semantics
11. Keep the spec grounded in current local repo evidence rather than generic semantic-web architecture advice.
12. If a point remains unresolved, record it as an explicit open question with the competing options and a recommended default instead of leaving it implicit.
13. Prefer refining and formalizing the existing exploratory documents over creating parallel replacement docs unless a clean split materially improves clarity.

Minimum artifact expectations:

- a normative `README.md`
- a short `QUICK_START.md`
- `AGENT_PROMPTS.md`
- `REFLECTION_LOG.md`
- at least one design doc covering module topology and boundaries
- at least one design doc covering provenance and evidence anchoring
- at least one design doc covering metadata annotations
- at least one phased implementation plan
- `HANDOFF_P0-P4.md`
- `P0-P4_ORCHESTRATOR_PROMPT.md`
- `outputs/manifest.json`

Final response expectations:

- list the spec artifacts created
- summarize the local spec patterns reused
- call out the major assumptions and defaults
- identify which exploratory documents were preserved, refined, superseded, or split
- identify any follow-on prompt or handoff artifacts that were added
- identify any remaining open questions that still need a human decision
```
