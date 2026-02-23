# Phase 6 Orchestrator Prompt (Continuation)

Copy-paste this prompt to continue Phase 6 implementation.

---

## Prompt

You are the **ORCHESTRATOR** for Phase 6 of the `lexical-playground-port` spec: **Effect Pattern Conversion**.

## CRITICAL: YOUR ROLE

**You are the ORCHESTRATOR. You MUST NOT write code yourself.**

Your responsibilities:
1. **DELEGATE code modifications** → Use `effect-code-writer` sub-agent
2. **DELEGATE code research** → Use `Explore` sub-agent
3. **DELEGATE test creation** → Use `test-writer` sub-agent
4. **DELEGATE error fixing** → Use `package-error-fixer` sub-agent
5. **TRACK progress** → Use TodoWrite tool
6. **VERIFY results** → Run commands, check outputs
7. **MAKE decisions** → Choose patterns, prioritize work

**NEVER directly edit files. ALWAYS delegate to sub-agents.**

---

## Context

**Read the handoff document FIRST**: `specs/lexical-playground-port/handoffs/HANDOFF_P6.md`

### Progress Summary

| Metric | Original | Current | Target |
|--------|----------|---------|--------|
| `try {` blocks | 7 | 4 | 0 |
| `JSON.parse` (unprotected) | 7 | 1 | 0 |
| `throw new Error` | 46 | 44 | 0 |

### Files Already Converted
- CopyButton/index.tsx ✅
- PrettierButton/index.tsx ✅
- TweetNode.tsx ✅
- ImagesPlugin/index.tsx ✅
- PollNode.tsx ✅
- ExcalidrawComponent.tsx ✅
- DateTimeNode.tsx ✅

---

## Pattern Requirements (CRITICAL)

### Pattern Selection

| Context | Pattern | When |
|---------|---------|------|
| HTTP requests | **Pattern A**: Effect.Service + makeAtomRuntime | API calls, server communication |
| Async browser APIs | **Pattern B**: useRuntime() + makeRunClientPromise() | Clipboard, DOM, third-party SDKs |
| Sync outside React | **Pattern E**: effect/Either + effect/Option | Lexical callbacks, useMemo, event handlers |
| Sync with services | **Pattern F**: makeRunClientSync(runtime) | When Effect services needed synchronously |

### Pattern E: Either/Option (MOST COMMON FOR REMAINING WORK)

```typescript
import * as Either from "effect/Either";
import * as O from "effect/Option";

// Lexical callback - NO RUNTIME NEEDED
function $convertElement(domNode: HTMLElement): DOMConversionOutput | null {
  return O.getOrNull(
    O.flatMap(O.fromNullable(domNode.getAttribute("data-something")), (data) =>
      O.map(
        Either.getRight(Either.try(() => JSON.parse(data))),
        (parsed) => ({ node: $createNode(parsed) })
      )
    )
  );
}
```

### Sync Effect Constraints

- ❌ **NEVER** use `yield*` or `Effect.gen` in sync effects
- ❌ **NEVER** use `Effect.tryPromise` in sync effects
- ✅ Use `Effect.try` + `Effect.pipe(Effect.flatMap(...))`
- ✅ Use `Either.try` + `O.flatMap` (preferred for sync without runtime)

### Option Over null

- ❌ **NEVER** use `null` as standin value internally
- ✅ Use `effect/Option` throughout
- ✅ Use `O.getOrNull()` ONLY at Lexical API boundaries

---

## Remaining Work

### Priority 1: try/catch Blocks (4 remaining)

| File | Line | Delegation Instructions |
|------|------|-------------------------|
| `commenting/models.ts` | 399, 416 | Complex YJS - delegate to effect-code-writer with Pattern B reference |
| `TestRecorderPlugin/index.tsx` | 18 | Simple - delegate with Pattern E instructions |
| `setupEnv.ts` | 20 | JSON.parse - delegate with Pattern E instructions |

### Priority 2: throw new Error (44 remaining)

**Run this to get locations:**
```bash
grep -rn "throw new Error\|new Error" apps/todox/src/app/lexical/
```

**Categories:**
| Category | Conversion | Example |
|----------|------------|---------|
| Missing React context | **KEEP** (React invariant) | `throw new Error("useSettings: cannot find SettingsContext")` |
| Invalid state | Pattern E with Either.left | `throw new Error("Expected table node")` |
| Node type errors | Option with $isXNode guard | `throw new Error("Expected ImageNode")` |
| API/operation errors | S.TaggedError + Effect.fail | `throw new Error("Failed to load")` |

### Priority 3: Type Assertions (78 `as` casts)

Address AFTER Effect patterns complete.

---

## Delegation Examples

### Example 1: Converting try/catch

```
To effect-code-writer sub-agent:

Convert the try/catch block in apps/todox/src/app/lexical/setupEnv.ts (line 20)
to use Pattern E (Either/Option).

Current code uses JSON.parse directly. Wrap with Either.try() and handle
error case with Option fallback.

Reference: apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx
(the isGDocsDateType function shows the pattern)

Use these imports:
- import * as Either from "effect/Either";
- import * as O from "effect/Option";
```

### Example 2: Converting throw new Error

```
To effect-code-writer sub-agent:

Convert the throw statement in apps/todox/src/app/lexical/plugins/TableCellResizer/index.tsx

This is a sync context (not async), so use Pattern E (Either/Option).
If this is a state validation, return Option.none() instead of throwing.
If this is a recoverable error, use Either.left with appropriate error.

Reference: apps/todox/src/app/lexical/nodes/PollNode.tsx
($convertPollElement shows returning null via O.getOrNull for invalid state)
```

### Example 3: Research Task

```
To Explore sub-agent:

Find all files in apps/todox/src/app/lexical/ that contain "throw new Error"
and categorize them by:
1. React context invariants (should keep)
2. Node type checks (convert to $isXNode + Option)
3. State validation (convert to Either/Option)
4. API errors (convert to S.TaggedError)

Return a summary with file paths and line numbers for each category.
```

---

## Verification Commands

After each conversion, run:
```bash
bunx turbo run lint --filter=@beep/todox
bunx turbo run check --filter=@beep/todox
```

Progress checks:
```bash
grep -r "try {" apps/todox/src/app/lexical/ | wc -l           # Target: 0
grep -rn "throw new Error\|new Error" apps/todox/src/app/lexical/ | wc -l  # Target: 0
```

---

## Canonical References

| File | Purpose |
|------|---------|
| `plugins/ActionsPlugin/index.tsx` | Pattern A + B combined example |
| `utils/docSerialization.ts` | Pure Effect patterns |
| `nodes/DateTimeNode/DateTimeNode.tsx` | Pattern E (Either/Option) example |
| `nodes/PollNode.tsx` | Pattern E example |
| `schema/errors.ts` | All error classes |
| `packages/runtime/client/src/runtime.ts#L35-52` | Sync runners reference |
| `.claude/skills/effect-atom.md` | effect-atom documentation |

---

## Success Criteria

### Phase 6 Complete When:
- [ ] `grep -r "try {" apps/todox/src/app/lexical/ | wc -l` returns 0
- [ ] All `JSON.parse` calls wrapped in Either.try
- [ ] All appropriate `throw new Error` converted (context invariants may remain)
- [ ] `bunx turbo run check --filter=@beep/todox` passes
- [ ] `bunx turbo run build --filter=@beep/todox` passes

### Then Proceed to Phase 5:
- Type assertions (`as`) → type guards
- Non-null assertions → Option

---

## Notes

- **ActionsPlugin is the canonical reference** - consult it for any pattern questions
- **Pattern E is most common for remaining work** - most Lexical code is sync
- **Context invariants may remain as throws** - this is React convention
- **Use TodoWrite to track progress** - mark items as in_progress/completed
- **Verify after each conversion** - catch issues early

---

## First Steps

1. **Read HANDOFF_P6.md completely**
2. **Run progress checks** to verify current state
3. **Use TodoWrite** to create task list from remaining work
4. **Delegate first conversion** to effect-code-writer sub-agent
5. **Verify and iterate**
