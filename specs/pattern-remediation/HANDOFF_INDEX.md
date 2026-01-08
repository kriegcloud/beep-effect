# Pattern Remediation Handoff Index

## Overview

This specification contains handoff prompts for remediating ~250 pattern violations across the beep-effect monorepo. The work is divided into 3 phases by priority.

## Quick Reference

| Phase | Packages | Violations | Handoff Document |
|-------|----------|------------|------------------|
| 1 | @beep/utils, @beep/schema, @beep/errors | 79 | [HANDOFF_PHASE1.md](./HANDOFF_PHASE1.md) |
| 2 | @beep/ui-core, @beep/lexical-collab, @beep/iam-server, @beep/runtime-client | 79 | [HANDOFF_PHASE2.md](./HANDOFF_PHASE2.md) |
| 3 | @beep/mock | 61 | [HANDOFF_PHASE3.md](./HANDOFF_PHASE3.md) |

## How to Use These Handoffs

1. **Start a new Claude session**
2. **Paste the appropriate handoff document** as your initial prompt
3. **The agent will orchestrate sub-agents** to perform the actual file modifications
4. **After completion**, the agent should update `REMAINING_VIOLATIONS.md` to mark the phase complete

## Key Orchestration Principles

### Context Preservation
- Orchestration agents should NEVER write code directly
- Use `Task` tool to spawn sub-agents for file modifications
- Batch sub-agents in groups of 4 maximum
- Track progress with `TodoWrite` tool

### Verification
- Run `bun run check --filter=<package>` after each package completes
- Final verification: `bunx turbo run check` for entire monorepo

### Pattern Conversions Summary

| Native Pattern | Effect Equivalent |
|---------------|-------------------|
| `Array.from({ length: N }, fn)` | `A.makeBy(N, fn)` |
| `arr.map(fn)` | `F.pipe(arr, A.map(fn))` |
| `arr.filter(fn)` | `F.pipe(arr, A.filter(fn))` |
| `arr.reduce(init, fn)` | `F.pipe(arr, A.reduce(init, fn))` |
| `arr.forEach(fn)` | `A.forEach(arr, fn)` |
| `arr.includes(x)` | `F.pipe(arr, A.contains(x))` |
| `arr.slice(0, n)` | `F.pipe(arr, A.take(n))` |
| `arr.slice(s, e)` | `F.pipe(arr, A.drop(s), A.take(e-s))` |
| `str.split(sep)` | `F.pipe(str, Str.split(sep))` |
| `str.includes(sub)` | `Str.includes(sub)(str)` |
| `str.startsWith(pre)` | `Str.startsWith(pre)(str)` |
| `str.trim()` | `Str.trim(str)` |
| `typeof x === "string"` | `P.isString(x)` |
| `typeof x === "object"` | `P.isObject(x)` |
| `instanceof Date` | `P.isDate(x)` |
| `Date.now()` | `DateTime.toEpochMillis(DateTime.unsafeNow())` |
| `switch (x) {...}` | `Match.value(x).pipe(Match.when(...), Match.exhaustive)` |
| `Object.keys(obj)` | `Struct.keys(obj)` |
| `Object.entries(obj)` | `R.toEntries(obj)` |

## Lessons Learned

### Common Mistakes
1. **A.makeBy signature**: Takes ONE parameter `(index)`, not `(_, index)`
2. **A.slice doesn't exist**: Use `A.drop(n)` + `A.take(m)` instead
3. **A.forEach is not pipeable**: Use `A.forEach(arr, fn)`, not `F.pipe(arr, A.forEach(fn))`
4. **Match requires terminator**: Always end with `Match.exhaustive` or `Match.orElse`
5. **DateTime.unsafeNow() returns Utc**: Use `DateTime.toDate()` if you need a Date object

### Acceptable Patterns (Don't Change)
- `Array.isArray()` for type narrowing
- `instanceof Error` in catch blocks
- `typeof window === "undefined"` for SSR checks
- Type predicate functions using `typeof`/`instanceof`
- External library boundaries that require native types

## Status Tracking

Update this section as phases complete:

- [ ] Phase 1 - High Priority Business Logic
- [ ] Phase 2 - UI/Server Packages
- [ ] Phase 3 - Mock Data Package
- [ ] Final Monorepo Verification

## Files in This Specification

```
specs/pattern-remediation/
├── ORCHESTRATION_PROMPT.md    # Original orchestration instructions
├── PLAN.md                    # Original violation inventory
├── REMAINING_VIOLATIONS.md    # Current violation status
├── HANDOFF_INDEX.md           # This file
├── HANDOFF_PHASE1.md          # Phase 1 handoff prompt
├── HANDOFF_PHASE2.md          # Phase 2 handoff prompt
└── HANDOFF_PHASE3.md          # Phase 3 handoff prompt
```
