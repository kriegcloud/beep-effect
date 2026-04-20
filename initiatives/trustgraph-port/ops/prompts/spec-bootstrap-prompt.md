# TrustGraph Port V1 Spec Prompt

## Usage
Use the block below as a concrete task prompt for another agent run.

This prompt is intentionally scoped to a `kernel-first`, `repo-first` v1 initiative packet for `beep-effect`.
It is designed to prevent drift into full TrustGraph parity, architecture mimicry, or premature platform sprawl.

```text
USE $effect-first-development
USE $schema-first-development

Work from the repository root of the current workspace.

Your task is to create a decision-complete v1 initiative packet for a selective TrustGraph capability port into `beep-effect`.

This is spec authoring only.
Do not implement code.
Do not create research category plans.
Do not execute sub-agents.
Do not generate module boilerplate.
Do not plan for full TrustGraph parity.

TrustGraph source at `~/YeeBois/dev/trustgraph` is a capability reference only.
It must not be used as the target architecture or package topology template.
Topology must come from existing `beep-effect` patterns.

Required startup:
1. Prefer repo-local TrustGraph context first:
   - `bun run trustgraph:status`
   - `bun run trustgraph:context -- --prompt "Summarize the existing repo-first expert-memory direction most relevant to a scoped TrustGraph capability port."`
2. If TrustGraph context retrieval is unavailable, continue and say so.
3. Read these local references before drafting:
   - `initiatives/expert-memory-big-picture/expert-memory-kernel.md`
   - `initiatives/expert-memory-big-picture/expert-memory-control-plane.md`
   - `initiatives/expert-memory-big-picture/research-lanes-and-open-questions.md`
   - `initiatives/repo-codegraph-jsdoc/SPEC.md`
   - `initiatives/repo-codegraph-jsdoc/research/semantic-kg-integration-explained.md`
   - `tooling/cli/src/commands/TrustGraph/internal/TrustGraphRuntime.ts`
   - `packages/repo-memory/runtime/src/retrieval/GroundedRetrieval.ts`
   - inspect `packages/common/semantic-web`, `packages/common/nlp`, `packages/common/observability`, and `packages/repo-memory`
4. Inspect the local TrustGraph clone only enough to map required capabilities from currently relevant workflow surfaces.

Spec request:
- Spec title: `TrustGraph Port V1 Kernel Spec`
- Spec slug: `trustgraph-port`
- Target directory: `initiatives/trustgraph-port`
- Create these artifacts:
  - `initiatives/trustgraph-port/SPEC.md`
  - `initiatives/trustgraph-port/research/capability-map.md`
  - `initiatives/trustgraph-port/PLAN.md`

Hard scope defaults:
- Optimize for `kernel-first`, not broad TrustGraph replacement.
- Required first workflow: `repo-memory retrieval`.
- Required v1 inputs: `repository artifacts + curated markdown/docs`.
- Deployment posture: `single-node service first`.
- Persistence posture: `SQLite-first durable storage`.
- First durable abstraction: `artifact-to-packet`.
- Required external surface: `internal core + narrow MCP facade`.
- Semantic depth: `grounded retrieval first`, not rich ontology reasoning.
- Phase 1 must prove one end-to-end vertical slice:
  `ingest/index -> bounded retrieval packet -> MCP-consumable answer`.
- Phase 2 may expand toward `claim + evidence` modeling.
- Organize all capability mapping by `beep-effect` workflow and kernel/control-plane responsibility, not by TrustGraph source tree.

Explicit non-goals:
- full TrustGraph capability parity
- agent runtime or ReAct orchestration
- text completion or prompt-serving services
- generalized MCP tool execution
- broad document library or unstructured ingestion
- multi-backend portability in v1
- distributed multi-service deployment in v1
- rich ontology reasoning, contradiction management, or deep claim inference in v1

Main spec requirements:
1. Clearly distinguish source-grounded facts, assumptions, and proposed design.
2. Explain why this is a selective capability port and not an architecture port.
3. Define the v1 requirements and explicit non-goals.
4. Propose the slice topology:
   packages, modules, services, durable stores, and MCP-facing boundary.
5. Reuse `beep-effect` repository patterns and laws.
6. Define the minimum control-plane contract:
   execution identity, workflow state, progress events, partial-result semantics, budgets/timeouts, and audit surface.
7. Define the v1 ingest and retrieval data flow for repo artifacts and curated markdown.
8. Define storage boundaries explicitly:
   semantic state vs workflow state vs audit/artifact state.
9. Define observability and concurrency expectations appropriate for Effect v4 and highly asynchronous workloads.
10. Make Phase 1 decision-complete and implementation-ready.
11. Keep later phases subordinate to the v1 kernel proof rather than platform sprawl.

Capability map requirements:
- For each in-scope workflow capability, map:
  - workflow or responsibility
  - required v1 behavior
  - existing `beep-effect` assets to reuse
  - relevant TrustGraph capability evidence
  - disposition: `adopt`, `adapt`, `defer`, or `exclude`
  - rationale

Phase plan requirements:
- Break work into manageable sequential phases.
- Phase 1 must be the narrowest viable vertical slice.
- Later phases may add claim/evidence, broader ingestion, or deeper semantic validation only after Phase 1.
- Each phase must include:
  - objective
  - required modules or services
  - dependencies
  - acceptance criteria
  - what remains intentionally deferred

If a remaining ambiguity materially changes scope, ask one question at a time.
Otherwise, use the defaults above and state them explicitly.

Final response expectations:
- list the artifacts created
- summarize the local repo patterns reused
- summarize the major TrustGraph capabilities included, deferred, and excluded
- call out the assumptions and defaults used
- identify the biggest remaining risks or open questions
```
