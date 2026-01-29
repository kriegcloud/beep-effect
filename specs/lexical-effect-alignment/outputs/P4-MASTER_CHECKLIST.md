# P4 Master Checklist: Native Map Migration

## Summary

| Metric | Count |
|--------|-------|
| Files requiring migration | 5 |
| Total Map instances | 7 |
| Mutable (MutableHashMap) | 6 |
| Immutable (HashMap) | 1 |

---

## Files to Migrate

### Batch 1: Mutable Maps (5 agents)

| # | File | Map Variable | Operations | Effect Type | Priority |
|---|------|--------------|------------|-------------|----------|
| 1 | `plugins/EmojisPlugin/index.ts` | `emojis` | new, get | HashMap (immutable) | Medium |
| 2 | `plugins/MentionsPlugin/index.tsx` | `mentionsCache` | new, get, set | MutableHashMap | High |
| 3 | `plugins/VersionsPlugin/index.tsx` | `userToColor` | new, has, get, set | MutableHashMap | High |
| 4 | `plugins/TableScrollShadowPlugin/index.tsx` | `scrollHandlers` | new, has, set, forEach, clear | MutableHashMap | High |
| 5 | `plugins/CommentPlugin/index.tsx` | `markNodeMap`, `markNodeKeysToIDs` | new, get, set, delete, has | MutableHashMap | High |

---

## Detailed Migration Specs

### 1. EmojisPlugin/index.ts

**Location**: `apps/todox/src/app/lexical/plugins/EmojisPlugin/index.ts`
**Lines**: 12, 23
**Current**:
```typescript
const emojis: Map<string, [string, string]> = new Map([
  [":)", ["emoji happysmile", "🙂"]],
  [":D", ["emoji veryhappysmile", "😀"]],
  ...
]);
```
**Target**: Use `HashMap` (immutable - read-only after init)
```typescript
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";

const emojis = HashMap.make<string, [string, string]>(
  [":)", ["emoji happysmile", "🙂"]],
  [":D", ["emoji veryhappysmile", "😀"]],
  ...
);

// Replace .get(key) with:
const result = HashMap.get(emojis, key);
O.match(result, {
  onNone: () => null,
  onSome: ([className, emoji]) => ...
});
```

---

### 2. MentionsPlugin/index.tsx

**Location**: `apps/todox/src/app/lexical/plugins/MentionsPlugin/index.tsx`
**Lines**: 62, 485, 500, 502
**Current**:
```typescript
const mentionsCache = new Map();
// Usage:
const cachedResults = mentionsCache.get(mentionString);
mentionsCache.set(mentionString, null);
mentionsCache.set(mentionString, newResults);
```
**Target**: Use `MutableHashMap`
```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const mentionsCache = MutableHashMap.empty<string, MentionResult[] | null>();

// Replace .get() with:
const cachedResults = O.getOrUndefined(MutableHashMap.get(mentionsCache, mentionString));

// Replace .set() with:
MutableHashMap.set(mentionsCache, mentionString, null);
MutableHashMap.set(mentionsCache, mentionString, newResults);
```

---

### 3. VersionsPlugin/index.tsx

**Location**: `apps/todox/src/app/lexical/plugins/VersionsPlugin/index.tsx`
**Lines**: 112-120
**Current**:
```typescript
const userToColor = new Map<User, string>();
const getUserColor = (user: User): string => {
  if (userToColor.has(user)) {
    return userToColor.get(user)!;
  }
  const color = COLORS[userToColor.size % COLORS.length]!;
  userToColor.set(user, color);
  return color;
};
```
**Target**: Use `MutableHashMap`
```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const userToColor = MutableHashMap.empty<User, string>();
const getUserColor = (user: User): string => {
  const existing = MutableHashMap.get(userToColor, user);
  if (O.isSome(existing)) {
    return existing.value;
  }
  const color = COLORS[MutableHashMap.size(userToColor) % COLORS.length]!;
  MutableHashMap.set(userToColor, user, color);
  return color;
};
```

---

### 4. TableScrollShadowPlugin/index.tsx

**Location**: `apps/todox/src/app/lexical/plugins/TableScrollShadowPlugin/index.tsx`
**Lines**: 70, 73, 80, 121, 124
**Current**:
```typescript
const scrollHandlers = new Map<HTMLElement, () => void>();
// Usage:
if (scrollHandlers.has(wrapper)) { return; }
scrollHandlers.set(wrapper, handler);
scrollHandlers.forEach((handler, wrapper) => {
  wrapper.removeEventListener("scroll", handler);
});
scrollHandlers.clear();
```
**Target**: Use `MutableHashMap`
```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const scrollHandlers = MutableHashMap.empty<HTMLElement, () => void>();

// Replace .has() with:
if (O.isSome(MutableHashMap.get(scrollHandlers, wrapper))) { return; }

// Replace .set() with:
MutableHashMap.set(scrollHandlers, wrapper, handler);

// Replace .forEach() with direct iteration:
for (const [wrapper, handler] of scrollHandlers) {
  wrapper.removeEventListener("scroll", handler);
}

// Replace .clear() with:
// Note: MutableHashMap doesn't have clear() - iterate and remove or reassign
// Option A: Reassign
scrollHandlers = MutableHashMap.empty<HTMLElement, () => void>();
// Option B: Keep ref same (if needed), iterate remove
```

**Note**: HTMLElement keys may require custom equality. Effect's default may use reference equality which should work for DOM elements.

---

### 5. CommentPlugin/index.tsx

**Location**: `apps/todox/src/app/lexical/plugins/CommentPlugin/index.tsx`
**Lines**: 642, 685, 759, 785, 792, 793, 799, 805, 807

**Map 1: markNodeMap**
**Current**:
```typescript
const markNodeMap = useMemo<Map<string, MutableHashSet.MutableHashSet<NodeKey>>>(() => new Map(), []);
// Usage:
markNodeMap.get(commentID);
markNodeMap.set(commentID, nodeKeySet);
markNodeMap.delete(commentID);
markNodeMap.has(commentID);
```
**Target**:
```typescript
import * as MutableHashMap from "effect/MutableHashMap";

const markNodeMapRef = useRef(
  MutableHashMap.empty<string, MutableHashSet.MutableHashSet<NodeKey>>()
);
const markNodeMap = markNodeMapRef.current;

// Replace .get() with:
O.getOrUndefined(MutableHashMap.get(markNodeMap, commentID));

// Replace .set() with:
MutableHashMap.set(markNodeMap, commentID, nodeKeySet);

// Replace .delete() with:
MutableHashMap.remove(markNodeMap, commentID);

// Replace .has() with:
O.isSome(MutableHashMap.get(markNodeMap, commentID));
```

**Map 2: markNodeKeysToIDs**
**Current**:
```typescript
const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map();
// Usage:
markNodeKeysToIDs.get(key);
markNodeKeysToIDs.set(key, ids);
```
**Target**:
```typescript
const markNodeKeysToIDs = MutableHashMap.empty<NodeKey, Array<string>>();

// Replace .get() with:
O.getOrUndefined(MutableHashMap.get(markNodeKeysToIDs, key));

// Replace .set() with:
MutableHashMap.set(markNodeKeysToIDs, key, ids);
```

---

## Exclusions (No Migration Needed)

| File | Reason |
|------|--------|
| `nodes/ImageComponent.tsx` | Already uses MutableHashMap |
| `collaboration.ts`, `Editor.tsx` | Yjs library integration (external Map) |
| `commenting/models.ts` | Yjs YMap (collaborative data structure) |
| `utils/swipe.ts` | WeakMap (no Effect equivalent, GC-friendly) |
| `context/SettingsContext.tsx` | URLSearchParams (Browser API) |
| `plugins/TableActionMenuPlugin/index.tsx` | Framework-provided Map from Lexical |
| `plugins/TypingPerfPlugin/index.ts` | Already uses Effect HashSet |
| `plugins/TestRecorderPlugin/index.tsx` | Already uses Effect HashSet |

---

## Progress Tracking

- [x] EmojisPlugin/index.ts ✅ HashMap.fromIterable with as const
- [x] MentionsPlugin/index.tsx ✅ MutableHashMap.empty
- [x] VersionsPlugin/index.tsx ✅ MutableHashMap.empty
- [x] TableScrollShadowPlugin/index.tsx ✅ MutableHashMap.empty with let binding
- [x] CommentPlugin/index.tsx ✅ MutableHashMap.empty with useRef

## Verification Results

- **Type check**: ✅ Passed (101 successful, 101 total)
- **Lint**: ✅ Passed (5 warnings - unrelated to migration)

---

## Critical Patterns (from P3)

```typescript
// CORRECT - empty() for empty maps
MutableHashMap.empty<string, number>()

// WRONG - make() without entries creates type errors
MutableHashMap.make<string, number>()

// CORRECT - make() with initial entries
HashMap.make(["key1", 1], ["key2", 2])

// Iteration - direct, no .entries()
for (const [k, v] of map) { ... }

// Get returns Option - ALWAYS handle
const value = MutableHashMap.get(map, key);
O.getOrElse(value, () => defaultValue);
```
