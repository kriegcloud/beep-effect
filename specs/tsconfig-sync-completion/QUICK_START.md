# tsconfig-sync-completion Quick Start

> 5-minute triage guide for the tsconfig-sync-completion spec.

---

## Current Status

| Phase | Status | Handoff |
|-------|--------|---------|
| P0: Next.js Transitive Fix | **PENDING** | `handoffs/HANDOFF_P0.md` |
| P1: Package.json Sync | Pending | `handoffs/HANDOFF_P1.md` |
| P2: Handler Refactoring | Pending | `handoffs/HANDOFF_P2.md` |
| P3: Comprehensive Testing | Pending | `handoffs/HANDOFF_P3.md` |
| P4: Documentation | Pending | `handoffs/HANDOFF_P4.md` |

---

## Quick Diagnosis

### Is P0 Complete?

```bash
# Test Next.js builds - MUST pass before proceeding
bun run build --filter @beep/web
bun run build --filter @beep/todox

# Check mode should pass
bun run repo-cli tsconfig-sync --check
```

If builds fail with "implicit any" or "export map" errors, P0 is not complete.

### Is P1 Complete?

```bash
# Dry-run should show package.json changes (not just tsconfig)
bun run repo-cli tsconfig-sync --dry-run --verbose --filter @beep/schema
```

If output only shows tsconfig changes (no package.json), P1 is not complete.

### Is P2 Complete?

```bash
# Handler should be < 300 LOC
wc -l tooling/cli/src/commands/tsconfig-sync/handler.ts

# Extracted modules should exist
ls tooling/cli/src/commands/tsconfig-sync/{discover,references,package-sync,app-sync}.ts
```

If handler > 300 LOC or modules don't exist, P2 is not complete.

### Is P3 Complete?

```bash
# Tests should exist and pass
bun run test --filter @beep/repo-cli
ls tooling/cli/test/commands/tsconfig-sync/*.test.ts
```

### Is P4 Complete?

```bash
# Check documentation
grep -q "tsconfig-sync" tooling/cli/AGENTS.md && echo "AGENTS.md: OK" || echo "AGENTS.md: MISSING"
grep -q "tsconfig-sync" CLAUDE.md && echo "CLAUDE.md: OK" || echo "CLAUDE.md: MISSING"
```

---

## Starting a Phase

1. **Identify current phase** using diagnosis above
2. **Read the handoff document**: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P[N].md`
3. **Copy the orchestrator prompt**: `specs/tsconfig-sync-completion/handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
4. **Paste into new session** and execute

---

## Critical Verification

After ANY change, run:

```bash
# Must all pass before moving to next phase
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run repo-cli tsconfig-sync --check
bun run test --filter @beep/repo-cli
```

---

## Key Files

| File | Purpose |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Main handler (P0, P1, P2 modify) |
| `tooling/cli/src/commands/tsconfig-sync/utils/package-json-writer.ts` | P1 integrates this |
| `apps/web/tsconfig.json` | P0 verifies transitive paths added |
| `apps/todox/tsconfig.json` | P0 verifies transitive paths added |

---

## Common Issues

### Next.js build fails after P0

Verify transitive path aliases exist:
```bash
grep "@beep/documents-domain" apps/web/tsconfig.json
```

If missing, P0 transitive closure fix isn't working.

### Check mode fails after P1

Ensure package.json write logic matches dry-run preview:
```bash
bun run repo-cli tsconfig-sync --filter @beep/schema
bun run repo-cli tsconfig-sync --check --filter @beep/schema
```

### Tests fail after P2

Handler refactoring may have broken module imports:
```bash
bun run check --filter @beep/repo-cli
```

---

## Full Documentation

- [README.md](README.md) - Complete spec details
- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Learnings and decisions
- [Parent Spec](../tsconfig-sync-command/README.md) - Original specification
