# Quick Start

> 5-minute guide to begin the Knowledge Slice Code Quality Audit.

---

## Prerequisites

1. Ensure `packages/knowledge/*` packages exist
2. Ensure `bun install` has been run
3. Ensure services are up: `bun run services:up`

---

## Start Phase 1: Inventory

Copy-paste this prompt to begin:

```
You are orchestrating Phase 1 of the knowledge-code-quality-audit spec.

Your mission: Deploy parallel sub-agents to inventory ALL violations in packages/knowledge/*.

Read the full context in: specs/knowledge-code-quality-audit/handoffs/HANDOFF_P1.md

Then execute P1_ORCHESTRATOR_PROMPT.md
```

---

## Key Commands

```bash
# Verify knowledge packages
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*

# Lint fix
bun run lint:fix
```

---

## Phase Progression

| Phase | Action | Duration |
|-------|--------|----------|
| P1 | Inventory (parallel agents) | 1 session |
| P2 | Synthesis | 1 session |
| P3 | Remediation planning | 1 session |
| P4-P9 | Remediation execution | 1-2 sessions each |

---

## Emergency Contacts

If stuck:
1. Check REFLECTION_LOG.md for similar issues
2. Consult .claude/rules/effect-patterns.md
3. Review knowledge-completion spec for context
