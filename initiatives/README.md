# Initiatives

This directory holds the repo's active initiative packets.

An initiative packet can contain a normative spec plus supporting research,
agent-operable assets, generated evidence, and historical notes. The root name
is intentionally broader than the previous folder name so it matches what
actually lives here.

## Vocabulary

- `README.md` — overview, status, reading order, and navigation
- `SPEC.md` — the normative source of truth for the initiative
- `PLAN.md` — the current implementation or follow-up plan
- `research/` — exploratory or explanatory material
- `ops/` — machine-readable manifests, prompts, and handoff assets
- `history/` — archived outputs, reflection logs, verification notes, and raw
  source inputs

## Lifecycle Rules

- Directory names do not encode lifecycle state.
- Status lives inside each initiative's `README.md` and `SPEC.md`.
- Completed initiatives are removed from the working tree instead of living in
  a dedicated completion bucket. Git history is the archive.

## Current Initiatives

- `agent-governance-control-plane`
- `ip-law-knowledge-graph`
- `law-kg-prd`
- `repo-codegraph-jsdoc`
- `repo-architecture-automation`
- `trustgraph-doc-ontology`
- `turborepo-audit`

## Needs Refresh After Lean Slate

- `knowledge-workspace`
- `trustgraph-port`

These packets still describe pre-automation app and repo-memory surfaces. Treat
them as paused design context until they are rewritten against the generated
topology from `repo-architecture-automation`.
