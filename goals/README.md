# Goals

This directory holds the repo's active goal packets.

A goal packet can contain a normative spec plus supporting research,
agent-operable assets, generated evidence, and historical notes. The root name
aligns with Codex-style `/goal` workflows: each packet should give agents a
persistent objective, verification surface, constraints, and completion
condition.

Some manifests still use the compatibility schema name
`initiative-manifest/v1` and an `initiative` object key. That wire shape is
intentionally preserved until a dedicated manifest migration is planned.

## Vocabulary

- `README.md` — overview, status, reading order, and navigation
- `SPEC.md` — the normative source of truth for the goal
- `PLAN.md` — the current implementation or follow-up plan
- `research/` — exploratory or explanatory material
- `ops/` — machine-readable manifests, prompts, and handoff assets
- `history/` — archived outputs, reflection logs, verification notes, and raw
  source inputs

## Lifecycle Rules

- Directory names do not encode lifecycle state.
- Status lives inside each goal's `README.md` and `SPEC.md`.
- Completed goals are removed from the working tree instead of living in
  a dedicated completion bucket. Git history is the archive.

## Current Goals

- `ai-metrics-stack`
- `agent-effectiveness-loop` — Phase 1 complete Phoenix-backed coding-agent
  effectiveness loop; follow-up work now lives in separate goals.
- `agent-effectiveness-phoenix-enrichment` — Phoenix-native annotations,
  datasets, experiments, evals, and prompt/config comparison follow-up.
- `agent-effectiveness-workflow-integration` — repo workflow, operator, CI, and
  agent-handoff integration follow-up.
- `agentic-professional-runtime`
- `agent-governance-control-plane`
- `canvas`
- `codex-security-findings` — local Codex Security finding catalog, current-HEAD triage, and remediation queue.
- `file-processing-capability` — schema-first file processing contracts,
  Tika/libpff driver split, and `beep files process` proof packet.
- `ip-law-knowledge-graph`
- `oip-web-production-hardening`
- `oip-web-launch` — implementation complete; launch review pending.
- `repo-codegraph` — deterministic-first codegraph lookup and retrieval
  implementation packet.
- `repo-quality-acceleration` — research-first quality feedback speedup packet.
- `repo-quality-convergence` — 9/10 repo-health scorecard, release guardrail,
    and quality closure packet.
- `repo-context-topology` — generated topology and export catalog work for
    coding-agent symbol discovery.
- `stack-installer`
- `trustgraph-doc-ontology`
- `unified-ai-toolchain` — schema-first AI agent configuration contract packet
  for Claude Code, Codex, Grok Build, JetBrains AI Assistant, and Junie.

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
