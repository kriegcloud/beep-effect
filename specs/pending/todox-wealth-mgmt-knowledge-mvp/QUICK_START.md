# Quick Start: Todox Wealth Mgmt Knowledge MVP

> 5-minute triage for a new agent instance.

## What This Spec Is

This spec defines a **demo-first Knowledge Base MVP** for TodoX wealth management:

Gmail ingestion (Google OAuth) → Documents materialization → Knowledge extraction + evidence → `/knowledge` UI → meeting prep grounded in persisted spans.

## Read This First (In Order)

1. `outputs/R0_SYNTHESIZED_REPORT_V2.md` (single source for “what to do next”)
2. `README.md` (scope, success criteria, phase plan, decisions to lock)
3. `AGENT_PROMPTS.md` (orchestration rules + PR breakdown strategy)

If you need a deeper drill-down, jump to:

- OAuth + incremental consent: `outputs/R6_OAUTH_SCOPE_EXPANSION_FLOW.md`
- Gmail -> Documents mapping: `outputs/R7_GMAIL_DOCUMENT_MAPPING_DESIGN.md`
- Evidence/provenance persistence: `outputs/R8_PROVENANCE_PERSISTENCE_AND_API.md`
- UI plan (/knowledge layout): `outputs/R9_TODOX_KNOWLEDGE_BASE_UI_PLAN.md`

## Where Things Live

- Research + synthesis: `outputs/`
  - `outputs/R0_SYNTHESIZED_REPORT_V2.md` (orchestrator input)
  - `outputs/R1_...` through `outputs/R9_...` (explorer reports)
- Orchestration prompts + phase checkpoints: `handoffs/`
- Reusable writing templates: `templates/`

## Current Phase

- **Phase**: P0 (Decisions + contracts)
- **Primary work**: resolve open questions + lock contracts so P1 can be an executable PR plan.
- **Start here**: `handoffs/P0_ORCHESTRATOR_PROMPT.md`

## Quick Verification (Spec-Only)

```bash
# Ensure scaffold exists
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp/handoffs
ls -la specs/pending/todox-wealth-mgmt-knowledge-mvp/templates

# Ensure the explicit handoff gate exists in spec docs
rg -n \"handoff gate\" specs/pending/todox-wealth-mgmt-knowledge-mvp
```

