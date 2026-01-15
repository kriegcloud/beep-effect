# Handoff Document: Effect-Atom Skill Implementation

## Session Context

This handoff document provides all context needed to implement the effect-atom Claude Code skill in a fresh session.

---

## Objective

Create `.claude/skills/effect-atom.md` - a skill that prevents Claude from confusing `@effect-atom/atom-react` with `jotai`.

---

## Research Summary

### Key Finding: These Are DIFFERENT Libraries

| Aspect         | Jotai                        | effect-atom                   |
|----------------|------------------------------|-------------------------------|
| Package        | `jotai`                      | `@effect-atom/atom-react`     |
| Philosophy     | Minimal React state          | Effect-first state management |
| Runtime        | Implicit (optional Provider) | REQUIRED (`Atom.context()`)   |
| Atom creation  | `atom(0)`                    | `Atom.make(0)`                |
| Read hook      | `useAtom()[0]`               | `useAtomValue()`              |
| Write hook     | `useAtom()[1]`               | `useAtomSet()`                |
| Async          | Promises                     | Effect programs               |
| Error handling | Promise rejection            | `Result<A, E>` type           |

### Critical Import Rule

```typescript
// CORRECT - beep-effect uses this package
import { Atom, useAtomValue, useAtomSet, Registry, Result } from "@effect-atom/atom-react";

// WRONG - exists but NOT used in beep-effect
import { Atom } from "@effect-atom/atom";
```

### beep-effect Local Conventions

```typescript
// makeAtomRuntime is a LOCAL name in beep-effect, not a library export
export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});
makeAtomRuntime.addGlobalLayer(clientRuntimeLayer);

// Usage: create module-specific runtimes
const filesRuntime = makeAtomRuntime(
  Layer.mergeAll(FilesApi.layer, BrowserHttpClient.layer, ...)
);
```

---

## Files to Reference

### Research Outputs (read these first)
1. `specs/effect-atom/outputs/SYNTHESIS.md` - Comprehensive API reference
2. `specs/effect-atom/outputs/synthesis-review.md` - Corrections to apply
3. `specs/effect-atom/outputs/architecture-review.md` - Import path corrections

### Codebase Patterns (use as examples)
1. `packages/shared/client/src/atom/files/runtime.ts` - Runtime setup
2. `packages/shared/client/src/atom/files/atoms/files.atom.ts` - Writable cache pattern
3. `packages/shared/client/src/atom/files/atoms/toggleFileSelection.atom.ts` - Function atom
4. `packages/shared/client/src/atom/location.atom.ts` - Event listener atom

### Library Source (for validation)
- `tmp/effect-atom/packages/atom/src/` - Core library
- `tmp/effect-atom/packages/atom-react/src/` - React bindings

---

## Skill Structure

```markdown
---
paths:
  - "**/*.tsx"
  - "**/*.ts"
---

# Effect Atom React Patterns (@effect-atom/atom-react)

## When to Use This Skill

Activate when:
- Creating atoms or reactive state
- User mentions jotai, atoms, or useAtom
- Working in `**/atom/**` directories
- Creating derived or async state

## Critical Rules (MUST FOLLOW)

### Rule 1: Always Import from @effect-atom/atom-react
[Code example with WRONG vs CORRECT]

### Rule 2: makeAtomRuntime is beep-effect Local
[Explanation that it's not a library export]

### Rule 3: Atom.runtime is a RuntimeFactory Instance
[Clarify it's pre-created, not a function]

## Forbidden: Jotai Patterns

### DO NOT use these patterns:
[Table of wrong patterns with explanations]

## Required: effect-atom Patterns

### Use these patterns instead:
[Table of correct patterns with examples]

## API Quick Reference

### Atom Creation
[List of Atom.* functions]

### React Hooks
[List of hooks with signatures]

### Result Type
[Result type methods]

## Examples from Codebase

### Simple State Atom
[selectedFiles.atom.ts example]

### Writable Cache with Optimistic Updates
[files.atom.ts example]

### Function Atom for Side Effects
[toggleFileSelection.atom.ts example]

### Event Listener Atom
[location.atom.ts example]
```

---

## Key Corrections from Reviews

### From architecture-review.md

**Issue**: Synthesis uses `@effect-atom/atom` import
**Fix**: All imports must be from `@effect-atom/atom-react`

### From synthesis-review.md

**Issue 1**: Hallucinated `Atom.runtime` as function taking Layer
**Fix**: `Atom.runtime` is a pre-created `RuntimeFactory` instance

**Issue 2**: `makeAtomRuntime` described as library export
**Fix**: It's a LOCAL variable name in beep-effect, library function is `Atom.context()`

**Issue 3**: Missing modules
**Add**: Mention `AtomRef`, `Hydration` modules exist (for SSR)

---

## Success Criteria

- [ ] File created at `.claude/skills/effect-atom.md`
- [ ] Paths trigger on `.tsx`, `.ts`, and `**/atom/**` files
- [ ] All code examples import from `@effect-atom/atom-react`
- [ ] Jotai patterns clearly marked as FORBIDDEN
- [ ] effect-atom patterns clearly marked as REQUIRED
- [ ] Real beep-effect code examples included
- [ ] No hallucinated APIs (cross-reference with library source)
- [ ] Critical rules section is first content after triggers

---

## Test Prompts

After creating the skill, test with:

1. "Create a simple counter atom"
   - Should suggest `Atom.make(0)` pattern

2. "I want to use useAtom from jotai"
   - Should flag jotai and suggest effect-atom

3. "How do I create a derived atom?"
   - Should show `Atom.make((get) => ...)` pattern

4. "Set up an atom runtime"
   - Should show `Atom.context()` pattern, NOT `makeAtomRuntime`
