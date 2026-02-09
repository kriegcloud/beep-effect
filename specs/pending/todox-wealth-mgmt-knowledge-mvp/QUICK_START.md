# Quick Start: Todox Wealth Mgmt Knowledge MVP

> 5-minute triage for a new agent instance.

## What This Spec Is

This spec defines a demo-first Knowledge Base MVP for TodoX wealth management:

Gmail ingestion (Google OAuth) → Documents materialization → Knowledge extraction + evidence → `/knowledge` UI → meeting prep grounded in persisted spans.

## Read This First (In Order)

1. `outputs/R0_SYNTHESIZED_REPORT_V3.md` (single synthesis input)
2. `outputs/P0_DECISIONS.md` (LOCKED contracts; no drift without changelog)
3. `outputs/P1_PR_BREAKDOWN.md` (executable PR plan + acceptance gates)
4. Latest handoff + orchestrator prompt (phase-agnostic):
   - `ls -1 handoffs/HANDOFF_P*.md | sort | tail -n 1`
   - `ls -1 handoffs/P*_ORCHESTRATOR_PROMPT.md | sort | tail -n 1`

If you need the spec narrative and non-goals, read `README.md` next.

If you need orchestration rules, read `AGENT_PROMPTS.md`.

## Where Things Live

- Research + synthesis: `outputs/`
  - `outputs/R0_SYNTHESIZED_REPORT_V3.md` (synthesis input)
  - `outputs/R1_...` through `outputs/R9_...` (explorer reports)
- Orchestration prompts + phase checkpoints: `handoffs/`
- Reusable writing templates: `templates/`

## Quick Verification (Spec-Only)

```bash
# Ensure scaffold exists
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp/templates

# Ensure handoff gate text exists (prevents context blowups)
rg -n 'handoff gate' specs/pending/todox-wealth-mgmt-knowledge-mvp
```
