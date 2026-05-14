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

- `ai-metrics-stack`
- `agentic-professional-runtime`
- `agent-governance-control-plane`
- `ip-law-knowledge-graph`
- `opip-web-launch` — implementation complete; launch review pending.
- `repo-context-topology` — generated topology and export catalog work for
  coding-agent symbol discovery.
- `trustgraph-doc-ontology`

## Reference Packets

- `canonical-slice-factory` — V1-closed architecture automation proof for
  `architecture-lab` and `beep architecture`; future factory extensions branch
  from this packet.
- `repo-codegraph-jsdoc` — learn-only codegraph/JSDoc research reference.
- `jsdoc-worker-eval` — read-only worker eval reference for hosted Codex and
  local providers; `qwen3-coder:30b` was rejected for this 8 GiB VRAM workstation.

## Needs Refresh After Lean Slate

- `knowledge-workspace`
- `trustgraph-port`

These packets still describe pre-automation app and repo-memory surfaces. Treat
them as paused design context until they are rewritten against the generated
topology from `canonical-slice-factory`.
