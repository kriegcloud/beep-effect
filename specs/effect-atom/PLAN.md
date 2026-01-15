# Effect-Atom Skill Implementation Plan

## Objective

Create a Claude Code skill at `.claude/skills/effect-atom.md` that:
1. Prevents Claude from confusing `@effect-atom/atom-react` with `jotai`
2. Guides developers to correct effect-atom patterns used in beep-effect
3. Catches common jotai patterns and suggests correct alternatives

---

## Skill File Structure

```markdown
---
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "**/atom/**"
  - "**/atoms/**"
---

# Effect Atom React Patterns

## When to Use
[Activation triggers]

## Critical Rules
[Non-negotiable patterns]

## Forbidden: Jotai Patterns
[Anti-patterns with code examples]

## Required: effect-atom Patterns
[Correct patterns with code examples]

## Core API Reference
[Essential exports and usage]

## Examples
[Real codebase patterns]
```

---

## Content Sections

### 1. When to Use (Triggers)

Activate when user:
- Creates atoms or state management code
- Imports from `jotai` or `@effect-atom`
- Uses hooks like `useAtom`, `useAtomValue`, `useAtomSet`
- Asks about reactive state in React
- Creates derived or async atoms
- Works in `packages/**/atom/**` directories

### 2. Critical Rules

**RULE 1**: Import from `@effect-atom/atom-react`
```typescript
// CORRECT - All imports from atom-react
import { Atom, useAtomValue, useAtomSet, Registry, Result } from "@effect-atom/atom-react";

// WRONG - Do not import from @effect-atom/atom
import { Atom } from "@effect-atom/atom";
```

**RULE 2**: `makeAtomRuntime` is a local beep-effect name
```typescript
// This is defined in beep-effect, NOT a library export
export const makeAtomRuntime = Atom.context({
  memoMap: Atom.defaultMemoMap,
});
```

**RULE 3**: `Atom.runtime` is a pre-created RuntimeFactory, NOT a function
```typescript
// Atom.runtime is already a RuntimeFactory instance
// Use it directly: Atom.runtime(layer) to create AtomRuntime
```

### 3. Forbidden: Jotai Patterns

| Wrong Pattern                           | Explanation                  |
|-----------------------------------------|------------------------------|
| `import { atom, useAtom } from 'jotai'` | Wrong library                |
| `const countAtom = atom(0)`             | Jotai creation syntax        |
| `const [val, set] = useAtom(a)`         | Jotai hook return pattern    |
| `atom((get) => get(other) * 2)`         | Jotai derived atom syntax    |
| `atom(async (get) => ...)`              | Jotai async atom             |
| No Provider required                    | Jotai works without provider |

### 4. Required: effect-atom Patterns

| Correct Pattern               | Example                                                          |
|-------------------------------|------------------------------------------------------------------|
| Import all from atom-react    | `import { Atom, useAtomValue } from "@effect-atom/atom-react"`   |
| Create atoms with `Atom.make` | `const countAtom = Atom.make(0)`                                 |
| Read with `useAtomValue`      | `const count = useAtomValue(countAtom)`                          |
| Write with `useAtomSet`       | `const setCount = useAtomSet(countAtom)`                         |
| Runtime from `Atom.context()` | `const runtime = Atom.context({ memoMap: Atom.defaultMemoMap })` |
| Effect-backed atoms           | `runtime.atom(Effect.gen(...))`                                  |
| Function atoms                | `runtime.fn(Effect.fnUntraced(...))`                             |

### 5. Core API Reference

**Atom Creation**:
- `Atom.make(initial)` - Create read-only atom
- `Atom.writable(read, write)` - Create read-write atom
- `Atom.family(fn)` - Parameterized atom factory
- `Atom.context(options)` - Create RuntimeFactory
- `Atom.runtime` - Default RuntimeFactory instance

**React Hooks**:
- `useAtomValue(atom)` - Read atom value
- `useAtomSet(atom)` - Get setter function
- `useAtom(atom)` - Combined [value, setter]
- `useAtomMount(atom)` - Mount atom (keep alive)
- `useAtomSuspense(atom)` - Suspense integration

**Result Type**:
- `Result.isInitial(r)` - Check if initial
- `Result.isSuccess(r)` - Check if success
- `Result.isFailure(r)` - Check if failure

### 6. Examples

Include examples from:
- `packages/shared/client/src/atom/files/runtime.ts` - Runtime setup
- `packages/shared/client/src/atom/files/atoms/files.atom.ts` - Writable cache
- `packages/shared/client/src/atom/files/atoms/toggleFileSelection.atom.ts` - Function atom
- `packages/shared/client/src/atom/location.atom.ts` - Event listener atom

---

## Implementation Steps

### Step 1: Create Skill File

Create `.claude/skills/effect-atom.md` with the structure above.

### Step 2: Add Trigger Paths

Configure paths to activate in atom-related files:
```yaml
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "**/atom/**"
  - "**/atoms/**"
```

### Step 3: Write Critical Rules Section

Document the 3 critical rules with clear WRONG/CORRECT examples.

### Step 4: Write Jotai Comparison Table

Create comprehensive comparison table with:
- Import differences
- Atom creation differences
- Hook usage differences
- Provider/runtime differences
- Async handling differences

### Step 5: Add Code Examples

Include real code snippets from beep-effect codebase for:
- Simple state atom
- Writable atom with optimistic updates
- Function atom for side effects
- Runtime-backed atom with services
- Event listener atom with cleanup

### Step 6: Validate Skill

Test the skill by:
1. Ask Claude to create an atom - should suggest effect-atom patterns
2. Provide jotai code - should flag and correct
3. Ask about `useAtom` - should clarify effect-atom vs jotai difference

---

## Validation Criteria

- [ ] Skill file exists at `.claude/skills/effect-atom.md`
- [ ] All imports use `@effect-atom/atom-react`
- [ ] Jotai patterns clearly marked as WRONG
- [ ] effect-atom patterns clearly marked as CORRECT
- [ ] Examples match actual beep-effect codebase usage
- [ ] No hallucinated APIs (verified against source)
- [ ] Critical rules section is prominent

---

## References

### Research Outputs
- `specs/effect-atom/outputs/SYNTHESIS.md` - Main reference
- `specs/effect-atom/outputs/synthesis-review.md` - Corrections needed
- `specs/effect-atom/outputs/architecture-review.md` - Import path fix

### Codebase Examples
- `packages/shared/client/src/atom/` - All atom patterns
- `packages/runtime/client/src/runtime.ts` - Runtime setup
- `tmp/effect-atom/` - Library source for validation

### External Documentation
- https://github.com/tim-smart/effect-atom
- https://tim-smart.github.io/effect-atom/docs/atom-react
