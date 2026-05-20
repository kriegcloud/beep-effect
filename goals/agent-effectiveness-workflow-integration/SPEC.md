# Agent Effectiveness Workflow Integration Specification

## Status

Pending planning

## Mission

Integrate agent-effectiveness evidence into normal repo workflows once the
local trust gate and any Phoenix enrichment surfaces are proven.

## Scope

Candidate workflow integration includes:

- operator commands and runbooks for recurring review loops;
- CI or scheduled report hooks that summarize already-sanitized evidence;
- agent handoff prompts that point at current goals and proof artifacts;
- dashboards or reports that distinguish complete, blocked, and deferred
  feedback loops.

## Inputs

- `goals/agent-effectiveness-loop`
- `goals/agent-effectiveness-phoenix-enrichment`
- `goals/ai-metrics-stack`
- repo quality and architecture standards.

## Constraints

- Do not make live Phoenix writes automatic.
- Do not weaken existing repo quality gates.
- Do not make Graphiti, Phoenix, or external services hard blockers unless the
  selected workflow explicitly requires them and has a no-op path.
- Preserve clear blocked-state reporting when evidence is unavailable.

## Completion Criteria

This goal closes only when a selected workflow has:

- an operator-visible command, runbook, or CI/report entry point;
- a deterministic evidence source;
- documented no-op or blocked behavior;
- quality evidence for touched packages;
- a history output recording proof and future follow-up boundaries.
