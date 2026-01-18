# Quick Start: Todox Design

> 5-minute triage for new Claude instances

---

## What Is This Spec?

Todox is an **AI-native multi-tenant SaaS application** for wealth management firms. This spec covers the complete design and implementation across 8 phases.

### Core Architecture

```
User → FlexLayout UI → PowerSync (sync) → Effect API → PostgreSQL (RLS)
                    ↘                    ↗
                      @effect/ai Agents
```

### Key Decisions Already Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sync Engine | PowerSync | Production-proven, JWT Sync Rules, Postgres-native |
| AI Tooling | @effect/ai + McpServer | Native Effect Schema integration |
| Multi-Tenancy | RLS + org_id | Single schema, strong isolation |
| UI Layout | FlexLayout | Workspace-as-tabs, persistence, popout |

---

## Current Status

**Phase**: P0 (Foundation)
**Blocking Issues**: None
**Next Action**: Execute P0_ORCHESTRATOR_PROMPT.md

---

## For New Instances

### If Resuming Work

1. Check `handoffs/HANDOFF_P[N].md` for latest context
2. Read REFLECTION_LOG.md for accumulated learnings
3. Continue from documented checkpoint

### If Starting Fresh

1. Read this file (done!)
2. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md`
3. Execute Phase 0 tasks

---

## Critical Files

| File | Purpose |
|------|---------|
| `README.md` | Full spec overview |
| `MASTER_ORCHESTRATION.md` | Phase workflows |
| `REFLECTION_LOG.md` | Accumulated learnings |
| `handoffs/P0_ORCHESTRATOR_PROMPT.md` | Current phase prompt |

---

## Do NOT

- Use Zero (alpha, no offline writes)
- Use Vercel AI SDK (use @effect/ai instead)
- Use database-per-tenant (use RLS)
- Skip REFLECTION_LOG updates
- Ignore Effect pattern rules

---

## Quick Verification

```bash
# Verify build works
bun run check --filter @beep/todox

# Verify tests pass
bun run test --filter @beep/todox
```

---

## Need Help?

- Effect patterns: `.claude/rules/effect-patterns.md`
- Schema patterns: `@beep/schema` package
- IAM patterns: `packages/iam/client/` (reference implementation)
- FlexLayout: `apps/todox/src/app/demo/` (working demo)
