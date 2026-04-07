# P6 — Reuse-Discovery Design And Contract

## Objective

Extend the cleanup spec with a repeatable, agent-friendly methodology for finding duplicate code, logic, and reuse opportunities without turning the phase into an uncontrolled autonomous refactor campaign.

## Scope

- keep the work inside `repo-cleanup-bloat-staleness` instead of spawning a new spec
- define the `beep reuse` command surface and JSON contracts
- define the future subagent partition model
- choose a first-pass candidate catalog strategy
- define how Codex SDK and future retrieval or RAG hooks fit into the design

## Decisions

### The spec stays here

The reuse-discovery extension is appended as P6 and P7 inside this spec package. The cleanup work and the new reuse tooling share the same repo-surfaces, evidence log, and operator flow, so keeping them together avoids fragmenting the history.

### P6 is design and contract only

P6 owns the methodology, contract, and orchestration design. It does not own a repo-wide autonomous implementation loop.

### P7 owns implementation plus a tooling pilot

P7 owns the reusable command implementation and a real pilot on `tooling/cli` plus `tooling/repo-utils`. The pilot proves the commands and output contracts, not a broad automatic cleanup campaign.

### The tool is contract-first

The approved v1 command surface is:

- `beep reuse partitions [--scope <selector>] [--json]`
- `beep reuse find --file <path> [--symbol-id <id> | --query <text>] [--json]`
- `beep reuse inventory [--scope <selector>] [--json]`
- `beep reuse packet --candidate-id <id> [--scope <selector>] [--json]`
- `beep reuse codex-smoke [--json]`

These commands must emit machine-readable schemas that future agent sessions can consume without inventing new parsing rules.

### Partitioning is hybrid, not naive fan-out

The future multi-agent shape is:

- scout work units per package or slice
- specialist work units only for detected hotspots
- a synthesizer step that merges, dedupes, and ranks candidates

This keeps cheap package-local scanning separate from more opinionated specialist reasoning.

### The first shared catalog is structural, not embeddings-first

The first pass should be anchored on live repo structure from `TSMorphService`, plus curated Effect v4 entries and existing reusable code in `packages/common/*`. The tool should be RAG-ready, but embeddings are not required to ship P7.

### Codex SDK integration is smoke-only in v1

The initial Codex SDK seam proves import and thread startup only. It does not run an agent loop and it does not auto-edit repo code. That keeps the first implementation small and leaves lifecycle-heavy orchestration for a later phase or follow-on spec.

### Destination packages are constrained

The tool may recommend new modules inside existing `packages/common/*` packages. It should not create new workspace packages as part of the first version.

## Methodology Contract

The first version is intentionally high-precision. It should prioritize:

- repeated inline schema JSON codec helpers
- repeated rendering helpers
- small helper types or extractable functions
- other reuse opportunities with strong local evidence

It should avoid:

- speculative architectural decomposition
- service-boundary rewrites
- UI reorganization
- autonomous bulk edits

## Output Contract

Each candidate packet must include:

- stable candidate id
- candidate kind
- source symbols and source scopes
- recommended action
- proposed destination package and module
- confidence
- evidence
- blocking concerns
- implementation steps
- verification commands

## Residual Risks

- RAG and embeddings may still improve recall later, especially for non-obvious semantic reuse.
- Some reuse candidates will only become visible once the catalog expands beyond the tooling pilot.
- Full autonomous loop execution will need stricter lifecycle and approval controls than this phase defines.

## Handoff To P7

Implement the command surface, wire the shared schemas and services, add the Codex smoke seam, prove the tooling pilot, and keep the autonomous reuse loop explicitly out of scope.
