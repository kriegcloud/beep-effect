# Quick Start: Shared Memory Layer

> 5-minute triage for this spec

## What Is This?

A shared Graphiti knowledge graph (FalkorDB backend) that both Claude Code and Codex CLI can read/write to via MCP. Auto-recording hooks ensure memories accumulate passively.

## Current Status

- **P0 Scaffolding:** Complete
- **P1 Discovery:** Complete (research outputs in `outputs/`)
- **P2 Infrastructure:** Pending
- **P3 Integration:** Pending
- **P4 Verification:** Pending

## How to Continue

Pick up the next pending phase:

| Phase | Handoff | Orchestrator Prompt |
|-------|---------|---------------------|
| P2 Infrastructure | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) |
| P3 Integration | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) |
| P4 Verification | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) |

```bash
# Read the current phase handoff (start with the first pending phase)
cat specs/pending/shared-memories/handoffs/HANDOFF_P2.md

# Or use the copy-paste orchestrator prompt
cat specs/pending/shared-memories/handoffs/P2_ORCHESTRATOR_PROMPT.md
```

## Key Decisions Already Made

1. **Graphiti + FalkorDB** (not Basic Memory or mem0) — temporal knowledge graph with deduplication
2. **Local Docker** (not remote server) — simpler, works offline, upgradeable later
3. **Named volumes** — survive `docker system prune -af`
4. **Systemd user service** — auto-starts on login
5. **Dual recording** — hooks for baseline + AGENTS.md/CLAUDE.md for proactive saves

## Research Outputs (P1 Complete)

| Document | Tokens | Summary |
|----------|--------|---------|
| [shared-memory-research.md](./outputs/shared-memory-research.md) | ~8K | Comparison of 11 MCP memory servers |
| [graphiti-implementation-plan.md](./outputs/graphiti-implementation-plan.md) | ~6K | Docker, systemd, hooks, scripts, checklist |
