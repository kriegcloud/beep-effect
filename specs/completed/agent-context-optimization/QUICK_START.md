# Quick Start — Agent Context Optimization

> 5-minute guide to get started with this spec.

---

## TL;DR

Implement Michael Arnaldi's recommendations to boost AI agent performance:

1. **Add library subtrees** → `.repos/effect`, `.repos/effect-platform`
2. **Generate module context** → `context/effect/Effect.md`, `context/effect/Schema.md`
3. **Enhance AGENTS.md index** → Link everything together

---

## Prerequisites

- Git with subtree support (standard)
- Write access to repository
- Familiarity with spec workflow (`specs/_guide/README.md`)

---

## Quick Commands

```bash
# Phase 1: Add Effect subtree
git subtree add --prefix=.repos/effect https://github.com/Effect-TS/effect.git main --squash

# Verify subtree
ls .repos/effect/packages/effect/src/

# Run checks after each phase
bun run check
bun run test
```

---

## Phase Summary

| Phase | Focus | Output |
|-------|-------|--------|
| P0 | Scaffolding | Spec structure validated |
| P1 | Git Subtrees | `.repos/` with library sources |
| P2 | Module Context | `context/` with 20+ module files |
| P3 | Index Enhancement | Enhanced `AGENTS.md` |
| P4 | Validation | Tested, documented, complete |

---

## What Success Looks Like

After completion:
- Agents can reference Effect source directly
- Module-specific patterns are documented
- All agent resources linked from root `AGENTS.md`
- No regression in build or tests

---

## Next Steps

1. Read `README.md` for full context
2. Read `MASTER_ORCHESTRATION.md` for detailed workflow
3. Start with Phase 1 handoff: `handoffs/HANDOFF_P1.md`
