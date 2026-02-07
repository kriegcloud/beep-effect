# Lexical Playground Port - Quick Start

> 5-minute context restoration for orchestrators.

---

## Current Status

| Field | Value |
|-------|-------|
| **Current Phase** | P1: Fix Lint/Build/Check Errors |
| **Status** | Not Started |
| **Blocking Issues** | Corrupted `InsertLayoutDialog.tsx` file |
| **Last Updated** | 2026-01-27 |

---

## Critical Context

### What This Spec Does

Ports Facebook's Lexical Playground editor (143 TS/TSX files, 32 CSS files, ~40K LOC) from `tmp/lexical/packages/lexical-playground` to `apps/todox/src/app/lexical` as a Next.js module.

### Why It's Complex

- Different linting/TypeScript configs = 106 lint errors
- CSS files need Tailwind conversion
- Custom UI needs shadcn replacement (uses `@base-ui/react`, NOT `@radix-ui`)
- Server code needs Next.js API route migration
- Non-Effect patterns throughout

### The 6-Phase Plan

| Phase | Focus | Sessions | Handoff Ready |
|-------|-------|----------|---------------|
| P1 | Fix lint/build/check errors | 1-2 | Yes |
| P2 | Tailwind + shadcn conversion | 2-3 | No |
| P3 | Next.js page + API routes | 1 | No |
| P4 | Runtime error fixes | 1-2 | No |
| P5 | Repository best practices | 1-2 | No |
| P6 | Effect pattern migration | 2-3 | No |

---

## Quick Actions by Phase

### If Starting Phase 1

1. **Read**: `handoffs/HANDOFF_P1.md` (full context)
2. **Copy-paste**: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
3. **First action**: Fix corrupted license header in `plugins/LayoutPlugin/InsertLayoutDialog.tsx`

### If Resuming Mid-Phase

1. Check `REFLECTION_LOG.md` for last progress
2. Run quality commands to assess current state:
   ```bash
   bun run lint --filter=@beep/todox
   bun run check --filter=@beep/todox
   ```
3. Continue from last incomplete task

---

## Quality Commands (Run Every Phase)

```bash
# At phase START and END
bun run build --filter=@beep/todox
bun run check --filter=@beep/todox
bun run lint:fix --filter=@beep/todox
bun run lint --filter=@beep/todox
```

---

## Key File Locations

| Purpose | Path |
|---------|------|
| Lexical source | `apps/todox/src/app/lexical/` |
| shadcn components | `apps/todox/src/components/ui/` |
| Effect patterns | `.claude/rules/effect-patterns.md` |
| Handoffs | `specs/lexical-playground-port/handoffs/` |
| Phase outputs | `specs/lexical-playground-port/outputs/` |

---

## Critical Constraints

### shadcn Uses base-ui (NOT radix)

```typescript
// CORRECT - This repo
import { Dialog } from "@base-ui/react";

// WRONG - Standard shadcn (not used here)
import { Dialog } from "@radix-ui/react-dialog";
```

### Test Credentials

- **Login route**: `/auth/sign-in`
- **Email**: `beep@hole.com`
- **Password**: `F55kb3iy!`

### Phase Boundaries

- Max 7 work items per phase
- Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` at phase end
- Update `REFLECTION_LOG.md` after each phase

---

## Agent Assignments Quick Reference

| Phase | Primary Agent | When to Use |
|-------|---------------|-------------|
| P1 | `package-error-fixer` | Lint/type/build errors |
| P2 | `effect-code-writer` | Component refactoring |
| P3 | `effect-code-writer` | API route creation |
| P4 | Manual + Browser | Runtime debugging |
| P5 | `code-reviewer` | Pattern violations |
| P6 | `mcp-researcher` | Effect documentation |

---

## Decision Points

### P2: Which CSS to Convert First?

- **Recommended**: Start with `themes/` (3 files) - affects all components
- **Then**: `ui/` components (12 files) - reusable
- **Last**: `plugins/` (17 files) - can be done incrementally

### P3: API Route Structure

- `/api/lexical/validate` - POST, validates editor state
- `/api/lexical/set-state` - POST, sets editor state
- Both require authentication (use existing auth middleware)

---

## Known Gotchas

1. **Turborepo cascade**: `check` validates ALL dependencies, not just `@beep/todox`
2. **React imports**: Prefer destructured imports over `import * as React`
3. **dangerouslySetInnerHTML**: Keep these - needed for editor output
4. **Excalidraw**: Heavy dependency, may need lazy loading

---

## Related Specs

- `specs/lexical-utils-effect-refactor/` - Completed Effect migration patterns
