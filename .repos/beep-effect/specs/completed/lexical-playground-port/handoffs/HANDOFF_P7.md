# Phase 7 Handoff: Type Assertions Conversion

> **Date**: 2026-01-27 | **From**: P6 (Effect Patterns) | **Status**: ✅ COMPLETE

---

## Working Context (≤2K tokens)

### Current Task

Convert type assertions (`as`) to proper type guards where beneficial.

### Metrics

| Metric | Original | Final |
|--------|----------|-------|
| Type assertions | 79 | 61 (-18 converted) |
| Non-null assertions | 0 | 0 |

### Assertion Categories

| Category | Count | Action |
|----------|-------|--------|
| DOM Element Casts | 21 | CONVERT high-risk |
| Generic/Type Casts | 18 | KEEP (as const, keyof) |
| Object/Generic Casts | 18 | KEEP (schema results) |
| Lexical Node Casts | 7 | CONVERT to $isXNode() |
| Event Casts | 3 | KEEP (React patterns) |
| YJS Casts | 12 | KEEP (interop necessity) |

### Success Criteria

- [x] Lexical node casts → $isXNode() guards (2 converted)
- [x] High-risk DOM casts → instanceof guards (16 converted)
- [x] Safe patterns documented (61 intentionally kept)
- [ ] Quality commands pass - Pre-existing issues in @beep/runtime-client (outside lexical scope)

### Blocking Issues

None

---

## Episodic Context (≤1K tokens)

### P1-P6 Summary

| Phase | Focus | Key Decision |
|-------|-------|--------------|
| P1 | Lint/Build | Corrupted JSDoc fix, 106→0 errors |
| P2 | CSS/shadcn | 32→5 CSS files, wrapper components |
| P3 | Next.js | Dynamic import for editor, API routes |
| P4 | Runtime | SSR guards, Floating UI elements config |
| P5 | Patterns | Documented Effect patterns A/B/E/F |
| P6 | Effect | 46 throws categorized: 18 KEEP, 28 converted |

### Key Lesson from P6

**Categorize before converting.** Not all patterns need change. React context invariants and Lexical plugin registration throws were intentionally preserved.

---

## Semantic Context (≤500 tokens)

- **Tech stack**: Effect 3, React 19, Lexical
- **Import**: `import * as P from "effect/Predicate"`
- **Path**: `apps/todox/src/app/lexical/`
- **Lexical guards**: `$isTextNode()`, `$isElementNode()`, etc.

---

## Procedural Context (Links)

- Effect patterns: `.claude/rules/effect-patterns.md`
- Lexical source: `@lexical/utils` for $isXNode guards
- Archive: `handoffs/archive/` for P1-P4 details

---

## Orchestrator Role

**You MUST NOT write code yourself.** Delegate to:

| Agent | Use For |
|-------|---------|
| `effect-code-writer` | All code modifications |
| `Explore` | File discovery, pattern research |
| `package-error-fixer` | Type/lint/build errors |

---

## CONVERT Patterns

### Lexical Node Guards

```typescript
// BEFORE
const textNode = selection.getNodes()[0] as TextNode;

// AFTER
import { $isTextNode } from "lexical";
const node = selection.getNodes()[0];
if (!$isTextNode(node)) return;
```

### DOM Element Guards

```typescript
// BEFORE
const element = container.querySelector(".editor") as HTMLElement;

// AFTER
const element = container.querySelector(".editor");
if (!(element instanceof HTMLElement)) return;
```

---

## KEEP Patterns

```typescript
// KEEP: as const (literal types)
...([1, 2, 3] as const).map(...)

// KEEP: keyof (TypeScript idiom)
blockType: "paragraph" as keyof typeof blockTypeToBlockName

// KEEP: YJS interop (necessary)
provider.doc.get("comments", YArray) as YArray<UnsafeAny>
```

---

## Priority Files

| File | Count | Action |
|------|-------|--------|
| commenting/models.ts | 11 | KEEP (YJS) |
| ToolbarPlugin/index.tsx | 9 | KEEP (keyof) |
| AutocompletePlugin | ~3 | CONVERT |
| TableHoverActionsPlugin | 3 | CONVERT |

---

## Verification

```bash
bunx turbo run check --filter=@beep/todox
bunx turbo run lint --filter=@beep/todox
bunx turbo run build --filter=@beep/todox
```

---

## Gotchas

1. **YJS types are loose** - 11 casts in models.ts are required
2. **Check for existing guards** - Some DOM casts already have null checks
3. **Use Lexical guards** - Prefer $isXNode() over instanceof
