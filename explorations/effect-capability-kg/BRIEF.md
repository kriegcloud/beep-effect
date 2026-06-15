# Brief

## Problem

This repo is Effect-first, agent-heavy, and increasingly governed by local
architecture law. Meanwhile, Effect v4 contains excellent, heavily documented
capabilities that should be natural building blocks for this codebase. The
sharp example is the seed wedge: `effect/Combiner`, `effect/Reducer`, and
`effect/Filter`.

Those modules are not obscure in the source. They have top-level module docs,
export docs, `@category`, `@since`, `@see`, examples, and structured prose such
as `**When to use**` and `**Details**`. They also point to adjacent helpers in
`Option`, `Struct`, `Array`, `Record`, `Number`, `String`, and `Boolean`.

The failure is at the agent/human usage boundary:

- people and agents do not reliably know the capabilities exist;
- they do not know when a capability should be preferred over local code;
- they do not have a fast "how do I use this here?" surface;
- repo policy cannot enforce usage because it cannot yet distinguish a real
  missed capability from a harmless alternative.

Existing repo bricks already know how to inspect symbols, JSDoc, exports, and
package boundaries. But the missing layer is capability intelligence: a
queryable, evidence-backed representation of "this Effect module exists, this
is the situation it solves, these are nearby alternatives, and this proposed
edit should probably use it."

## Appetite

Prove a narrow, tooling-owned capability guidance layer before building any
goals or enforcement gates.

The first pass should stay deliberately small:

- seed only `Combiner`, `Reducer`, `Filter`, and their adjacent helper modules;
- treat deterministic AST/type/JSDoc/source-span facts as authority;
- use ontology, embeddings, and LLM summaries as derived guidance, not truth;
- produce advisory findings before any blocking rule;
- define one high-quality specialist profile before creating a taxonomy of
  sub-agents;
- keep runtime-specific Codex/Claude hook details behind a repo-owned contract.

This is not yet a full implementation plan. It is the shape that should be
reviewed before decomposition into `MAP.md`, and no `./goals` packets should be
created until the brief and map are explicitly accepted.

## Solution Sketch

Build a repo-local Effect capability intelligence layer that composes the
existing tooling bricks instead of replacing them.

1. Deterministic source ingestion

   Use the existing `@beep/repo-utils`, `@beep/repo-codegraph`, repo export
   catalog, and docgen/JSDoc inventory surfaces as the base. Ingest the Effect
   v4 seed files and extract:

   - modules, exported symbols, signatures, and source spans;
   - import/export and observed call-site edges;
   - JSDoc tags such as `@category`, `@since`, and `@see`;
   - structured prose sections such as `When to use`, `Details`, and examples;
   - repo-local visibility through `standards/repo-exports.catalog.md`.

2. Capability ontology kernel

   Start with a tiny upper-ontology-aligned vocabulary instead of a grand
   ontology. The first nodes are:

   - `EffectModule`
   - `CapabilitySymbol`
   - `DocSection`
   - `UsageScenario`
   - `ExampleCase`
   - `CategoryRole`
   - `SeeAlsoRelation`
   - `SpecialistProfile`
   - `JudgeRoutingDecision`
   - `HookFinding`

   The first edges are:

   - `defines`
   - `hasCategory`
   - `introducedIn`
   - `hasWhenToUse`
   - `hasDetails`
   - `demonstratedBy`
   - `seeAlso`
   - `imports`
   - `composesWith`
   - `routesToSpecialist`
   - `citesCapabilityEvidence`

   The ontology classifies deterministic facts and makes the graph queryable.
   It does not become the authority layer.

3. Hybrid retrieval

   Use graph queries for exact capability evidence and embeddings for recall
   over prose sections and examples. LLM-generated summaries are allowed only
   as candidate/context records that cite deterministic graph evidence.

4. Seed specialist profile

   Define one specialist profile for `Combiner` / `Reducer` / `Filter`. The
   profile owns:

   - corpus scope;
   - evidence contract;
   - when-to-suggest recipes;
   - decline conditions;
   - response shape;
   - examples of good advisory findings.

   The first deliverable is the profile contract, not a concrete runtime-native
   Codex or Claude sub-agent.

5. Judge/router

   Route proposed work to the seed specialist with deterministic evidence
   first. The router should be able to say:

   - selected specialist;
   - confidence;
   - matched evidence;
   - why it selected or declined the specialist;
   - whether an LLM tie-breaker was needed.

6. Advisory hook contract

   Define a pre-write verification contract that can later map onto Codex,
   Claude, or other tool hooks. The first behavior is advisory:

   - inspect proposed task/diff/context;
   - query the capability graph;
   - route to the specialist when warranted;
   - return evidence-cited findings;
   - avoid hard blocking until false positives are measured.

7. Ratchet path

   Once advisory findings prove useful, promote stable rules into repo quality
   surfaces such as Fallow, docgen quality, or reuse gates. This promotion is
   earned by evidence, not assumed up front.

## Fat-Marker Flow

A coding agent starts a task or proposes a diff.

The repo-owned pre-write verifier extracts coarse intent and code facts from
the proposed change. It queries the deterministic capability graph and asks the
judge/router whether any specialist should be consulted.

If the seed specialist matches, it returns a structured finding:

- the missed or relevant Effect capability;
- why this call site resembles the capability's `When to use` evidence;
- exact source/JSDoc/catalog citations;
- a small suggested direction, not a full rewrite;
- confidence and decline/uncertainty notes.

The agent can then revise the code or explicitly record why the suggestion does
not apply. Only after enough findings are reviewed should any hard enforcement
be considered.

## Rabbit Holes

- Designing a comprehensive UFO-derived ontology before proving the seed wedge.
- Ingesting the entire Effect v4 repository before the first specialist works.
- Choosing graph storage, vector storage, or MCP APIs too early.
- Generating runtime-specific Codex/Claude hook config before the repo-owned
  contract exists.
- Creating a broad specialist taxonomy before one specialist demonstrates value.
- Treating LLM summaries, embeddings, or ontology classifications as source of
  truth.
- Turning advisory findings into blocking gates before false positives are
  measured.

## No-Gos

- Do not create `./goals` packets until the owner accepts the brief/map.
- Do not create an `agents` architecture family for this work.
- Do not replace `goals/repo-codegraph-jsdoc`; this packet is a focused child
  around Effect capability guidance.
- Do not make ontology, embeddings, or LLM summaries authoritative over
  AST/type/JSDoc/source-span facts.
- Do not hard-code a final CLI/API name in the exploration stage.
- Do not start with hard enforcement.
- Do not let `ATLAS.md` become doctrine; keep load-bearing contracts in the
  packet and later goal/spec/docs artifacts.

## Review Checkpoint

This brief is ready for owner review. If accepted, the next packet action is
`decompose`: draft `MAP.md` with candidate goal packets, sequencing, the first
vertical slice, and a capability check. Per owner instruction, pause before any
`./goals` packets are created.
