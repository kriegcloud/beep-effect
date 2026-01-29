# P7 Master Checklist: Promise-Based Code Migration

## Discovery Summary

| Batch | Scope | Files Found | Patterns |
|-------|-------|-------------|----------|
| 1 | nodes/, plugins/A*-F* | 11 | 28 |
| 2 | plugins/G*-M* | 0 | 0 |
| 3 | plugins/N*-Z* | 0 | 0 |
| 4 | commenting, context, hooks, ui, utils, top-level | 6 | ~15 |

**Total Files Requiring Migration**: 12 unique files
**Total Patterns to Address**: ~35 patterns

---

## Migration Status

### High Priority (Clear violations requiring migration)

| # | File | Pattern | Line | Status |
|---|------|---------|------|--------|
| 1 | `plugins/AutocompletePlugin/index.tsx` | `new Promise()` constructor | 248 | ✅ Complete |
| 2 | `plugins/AutocompletePlugin/index.tsx` | `.then().catch()` chain | 167 | ✅ Complete |
| 3 | `plugins/EmojiPickerPlugin/index.tsx` | Dynamic import `.then()` | 87 | ✅ Complete |
| 4 | `plugins/ActionsPlugin/index.tsx` | `.then()` after runClientPromise | 217 | ✅ Complete |
| 5 | `nodes/ImageComponent.tsx` | `.then()` for cache update | 139 | ✅ Complete |
| 6 | `plugins/AutoEmbedPlugin/index.tsx` | `Promise.resolve()` misuse | 57 | ✅ Complete |

### Medium Priority (Promise chains needing conversion)

| # | File | Pattern | Line | Status |
|---|------|---------|------|--------|
| 7 | `plugins/ContextMenuPlugin/index.tsx` | Clipboard `.then()` chain | 55 | ✅ Complete |
| 8 | `plugins/ContextMenuPlugin/index.tsx` | Clipboard `.then()` chain | 87 | ✅ Complete |
| 9 | `plugins/DragDropPastePlugin/index.ts` | async IIFE | 19 | ✅ Complete |

### Low Priority (Bridge patterns - acceptable but could improve)

| # | File | Pattern | Line | Status |
|---|------|---------|------|--------|
| 10 | `plugins/CodeActionMenuPlugin/CopyButton/index.tsx` | async wrapper | 38 | ✅ Removed (unnecessary) |
| 11 | `plugins/CodeActionMenuPlugin/PrettierButton/index.tsx` | async wrapper | 115 | ✅ Removed (unnecessary) |
| 12 | `nodes/embeds/TweetNode.tsx` | async wrapper | 83 | ✅ Removed (unnecessary) |
| 13 | `plugins/AiAssistantPlugin/hooks/useAiStreaming.ts` | async streaming | 26 | ⏸️ Deferred (external AI SDK)

---

## Already Correct (No Migration Needed)

These files are properly using Effect patterns:

- `utils/docSerialization.ts` - Uses `Effect.tryPromise()` correctly
- `nodes/ImageComponent.tsx` - Uses `Effect.async()` correctly for image loading
- `plugins/CodeActionMenuPlugin/PrettierButton/index.tsx` - Uses `Effect.tryPromise()` for dynamic imports
- All G*-M* plugins (ImagesPlugin, KeywordsPlugin, LayoutPlugin, etc.)
- All N*-Z* plugins (TestRecorderPlugin strings are code generation, not runtime)

---

## Migration Patterns Reference

### Pattern 1: `new Promise()` → `Effect.async()`

```typescript
// BEFORE
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve(value), delay);
});

// AFTER
const effect = Effect.async<Value, Error>((resume) => {
  const timeoutId = setTimeout(() => resume(Effect.succeed(value)), delay);
  return Effect.sync(() => clearTimeout(timeoutId));
});
```

### Pattern 2: `.then()` chain → Effect pipeline

```typescript
// BEFORE
runClientPromise(effect).then((result) => doSomething(result));

// AFTER
F.pipe(
  effect,
  Effect.tap((result) => Effect.sync(() => doSomething(result))),
  runtime.runPromise
);
```

### Pattern 3: `Promise.resolve()` → `Effect.succeed()`

```typescript
// BEFORE
Effect.promise(() => Promise.resolve(result))

// AFTER
Effect.succeed(result)
```

### Pattern 4: Dynamic import → `Effect.tryPromise()`

```typescript
// BEFORE
import("./module").then((file) => setState(file.default));

// AFTER
F.pipe(
  Effect.tryPromise(() => import("./module")),
  Effect.tap((file) => Effect.sync(() => setState(file.default))),
  runtime.runPromise
);
```

### Pattern 5: async IIFE → Effect execution

```typescript
// BEFORE
(async () => {
  const result = await asyncOperation();
  doSomething(result);
})();

// AFTER
F.pipe(
  Effect.tryPromise(() => asyncOperation()),
  Effect.tap((result) => Effect.sync(() => doSomething(result))),
  runtime.runPromise
);
```

---

## Execution Plan

### Batch 1 (5 files)
1. `plugins/AutocompletePlugin/index.tsx` - High priority, complex
2. `plugins/EmojiPickerPlugin/index.tsx` - Simple `.then()` fix
3. `plugins/ActionsPlugin/index.tsx` - `.then()` chain fix
4. `nodes/ImageComponent.tsx` - Cache `.then()` fix
5. `plugins/AutoEmbedPlugin/index.tsx` - `Promise.resolve()` fix

### Batch 2 (4 files)
6. `plugins/ContextMenuPlugin/index.tsx` - Two Promise chains
7. `plugins/DragDropPastePlugin/index.ts` - async IIFE
8. Review bridge patterns in CopyButton, PrettierButton, TweetNode
9. Review streaming pattern in useAiStreaming

---

## Verification Commands

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

---

## Phase 7 Completion Summary

**Status**: ✅ COMPLETE

**Files Migrated**: 9
- AutocompletePlugin/index.tsx
- EmojiPickerPlugin/index.tsx
- ActionsPlugin/index.tsx
- ImageComponent.tsx
- AutoEmbedPlugin/index.tsx
- ContextMenuPlugin/index.tsx
- DragDropPastePlugin/index.ts
- CopyButton/index.tsx
- PrettierButton/index.tsx
- TweetNode.tsx

**Deferred**: 1
- useAiStreaming.ts (external AI SDK integration - streaming pattern may need Effect streams in future phase)

**Verification Results**:
- `bun run check --filter @beep/todox`: ✅ PASS
- `bun run lint --filter @beep/todox`: ✅ PASS

**Key Learnings**:
1. Effect.async() with cleanup function handles setTimeout patterns cleanly
2. .then() after runPromise should move inside Effect.gen or use Effect.tap
3. Promise.resolve() wrapping is unnecessary; use Effect.succeed() or check for Promise
4. async wrappers around runPromise in React callbacks are unnecessary overhead
5. Browser APIs (clipboard) convert cleanly to Effect.tryPromise in Effect.gen

---

## Notes

- **Network API exclusion**: External API calls may retain Promise patterns if appropriate
- **External library callbacks**: Some callbacks require Promise bridges (e.g., `navigator.clipboard`)
- **Streaming**: AI streaming patterns may need special handling with Effect streams
