# P9 Master Checklist: Switch to Match Migration

## Summary

| Metric | Count |
|--------|-------|
| Files scanned | 100+ |
| Files with switches | 6 |
| Total switch statements | 7 (+ 2 nested) |
| Total cases | ~30 |

---

## Checklist

### High Priority (Complex/Nested)

#### ToolbarPlugin/utils.ts
- [x] `apps/todox/src/app/lexical/plugins/ToolbarPlugin/utils.ts:46` - `switch (updateType)` - 2 cases + default
  - Cases: `UpdateFontSizeType.decrement`, `UpdateFontSizeType.increment`
  - Has default: yes
  - **NESTED SWITCHES**: Contains 2 `switch(true)` anti-patterns
  - Nested #1 (line 48): 5 cases (range predicates for decrement)
  - Nested #2 (line 71): 5 cases (range predicates for increment)
  - **Complexity**: HIGH - Requires Match with predicates
  - **STATUS**: MIGRATED - Used Match.value().pipe() with predicate functions

### Medium Priority

#### TestRecorderPlugin/index.tsx
- [x] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:42` - `switch (name)` - 7 cases + default
  - Cases: "click", "press", "keydown", "keyup", "type", "selectAll", "snapshot"
  - Has default: yes
  - Fall-through: no
  - **Notes**: String literal discriminant, complex snapshot case
  - **STATUS**: MIGRATED - Match.when() for each case type

- [x] `apps/todox/src/app/lexical/plugins/TestRecorderPlugin/index.tsx:76` - `switch (step.count)` - 2 cases + default
  - Cases: 1, 2
  - Has default: yes
  - Fall-through: no
  - **Notes**: Numeric discriminant
  - **STATUS**: MIGRATED - Match.when(1, ...), Match.when(2, ...)

### Low Priority (Simple)

#### AiAssistantPlugin/utils/insertAiText.ts
- [x] `apps/todox/src/app/lexical/plugins/AiAssistantPlugin/utils/insertAiText.ts:14` - `switch (mode)` - 3 cases
  - Cases: "replace", "inline", "below"
  - Has default: no (implicit)
  - Fall-through: no
  - **STATUS**: MIGRATED - Used Match.exhaustive for compile-time exhaustiveness

#### CodeActionMenuPlugin/index.tsx
- [x] `apps/todox/src/app/lexical/plugins/CodeActionMenuPlugin/index.tsx:101` - `switch (type)` - 2 cases + default
  - Cases: "created", "destroyed"
  - Has default: yes
  - Fall-through: no
  - **STATUS**: MIGRATED

#### TableHoverActionsPlugin/index.tsx
- [x] `apps/todox/src/app/lexical/plugins/TableHoverActionsPlugin/index.tsx:178` - `switch (type)` - 2 cases + default
  - Cases: "created", "destroyed"
  - Has default: yes
  - Fall-through: no
  - **STATUS**: MIGRATED

#### VersionsPlugin/index.tsx
- [x] `apps/todox/src/app/lexical/plugins/VersionsPlugin/index.tsx:140` - `switch (type)` - 2 cases + default
  - Cases: "removed", "added"
  - Has default: yes (empty)
  - Fall-through: no
  - **STATUS**: MIGRATED

---

## Migration Patterns

### Simple String Discriminant
```typescript
// BEFORE
switch (type) {
  case "created": handleCreated(); break;
  case "destroyed": handleDestroyed(); break;
  default: break;
}

// AFTER
import * as Match from "effect/Match";

Match.value(type).pipe(
  Match.when("created", () => handleCreated()),
  Match.when("destroyed", () => handleDestroyed()),
  Match.orElse(() => {})
)
```

### Numeric Discriminant
```typescript
// BEFORE
switch (count) {
  case 1: return single;
  case 2: return double;
  default: return many;
}

// AFTER
Match.value(count).pipe(
  Match.when(1, () => single),
  Match.when(2, () => double),
  Match.orElse(() => many)
)
```

### Switch(true) with Predicates (ToolbarPlugin)
```typescript
// BEFORE
switch (true) {
  case size > 100: return "xl";
  case size >= 48: return "lg";
  case size >= 24: return "md";
  default: return "sm";
}

// AFTER
Match.value(size).pipe(
  Match.when((s) => s > 100, () => "xl"),
  Match.when((s) => s >= 48, () => "lg"),
  Match.when((s) => s >= 24, () => "md"),
  Match.orElse(() => "sm")
)
```

---

## Execution Batches

| Batch | Files | Switches |
|-------|-------|----------|
| 1 | ToolbarPlugin/utils.ts | 1 (+ 2 nested) |
| 2 | TestRecorderPlugin/index.tsx | 2 |
| 3 | AiAssistantPlugin, CodeActionMenuPlugin, TableHoverActionsPlugin, VersionsPlugin | 4 |

---

## Verification Commands

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```
