# Phase 11 Handoff: Nullable Returns to Option

## Phase Summary

Identify and refactor functions returning `T | null | undefined` to return `Option<T>` where appropriate in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All internal nullable return functions identified
- [ ] Functions NOT required by external APIs refactored to Option
- [ ] All callers of refactored functions updated
- [ ] API-required nullable functions documented (not changed)
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Decision Criteria

**DO refactor** when:
- Function is internal to the lexical module
- Return type is `T | null` or `T | undefined`
- No external API requires nullable return
- Callers can be updated

**DO NOT refactor** when:
- Function is a React component prop
- Function is required by Lexical API to return nullable
- Function is an event handler with specific signature
- Function is exported and used outside lexical module

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch
- **This phase requires careful caller analysis**

---

## Episodic Memory (Previous Phase)

### P10 Summary

Phase 10 replaced native Date with effect/DateTime.

**Files Modified:**
- `DateTimeNode.tsx` - Core node migration with DateTime.Utc, state serialization
- `DateTimeComponent.tsx` - UI component with boundary conversion helpers
- `datetime-utils.ts` - Interface updated for DateTime.Utc
- `ComponentPickerPlugin/index.tsx` - Date/Today/Tomorrow/Yesterday insertion
- `ToolbarPlugin/index.tsx` - Date menu item
- `DateTimePlugin/index.tsx` - Command payload type
- `VersionsPlugin/index.tsx` - Snapshot timestamps

**Critical Learnings:**
1. **DateTime.startOf("day")** uses curried API, NOT `startOfDay`
2. **UI library boundaries** require conversion helpers: `toJsDate()`, `fromJsDate()`
3. **Lexical createState parse()** receives `unknown` - validate with `P.isString` before parsing
4. **O.getOrElse over O.getOrThrow** - CRITICAL for parse functions to avoid runtime crashes
5. **Quality checks** should use `--filter=@beep/todox` to isolate from other package errors

**DateTime API Patterns:**
- `DateTime.unsafeNow()` - sync current time for React handlers
- `DateTime.toUtc(dt)` - convert to DateTime.Utc
- `DateTime.make(str)` - returns `Option<DateTime.Utc>`
- `DateTime.formatIso(dt)` - ISO string serialization
- `DateTime.getPartUtc(dt, "hours")` - extract time parts
- `DateTime.startOf("day")(dt)` - curried start of day

---

## Semantic Memory (Constants)

### Import Pattern

```typescript
import * as O from "effect/Option";
```

### Migration Pattern

```typescript
// BEFORE
function findUser(id: string): User | null {
  const user = users.get(id);
  return user || null;
}

// AFTER
function findUser(id: string): O.Option<User> {
  return O.fromNullable(users.get(id));
}

// Callers MUST update:
// BEFORE: const user = findUser(id); if (user) { ... }
// AFTER: O.match(findUser(id), {
//   onNone: () => ...,
//   onSome: (user) => ...
// })
```

### Common Exclusions (DO NOT REFACTOR)

```typescript
// Lexical node conversions - KEEP nullable
importDOM(): DOMConversionMap | null

// React refs - KEEP nullable
useRef<T>(null)

// Event handlers - KEEP nullable
onClick?: () => void

// Component props - KEEP nullable
children?: ReactNode

// Lexical commands - KEEP nullable
COMMAND.createCommand<T | null>()
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-11` | Phase 11 details |
| `agent-prompts/P11-option-discovery.md` | Discovery agent prompt |
| `agent-prompts/P11-code-writer.md` | Code writer agent prompt |

### Reference Example

`apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:64-83`

```typescript
// This returns DOMConversionOutput | null - required by Lexical API
// DO NOT REFACTOR
function $convertDateTimeElement(domNode: HTMLElement): DOMConversionOutput | null
```

### P10 Pattern Already Using Option

`apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx:86-93`

```typescript
// createState parse already uses Option internally with O.getOrElse fallback
// This pattern should be used as reference for P11 nullable migrations
const dateTimeState = createState("dateTime", {
  parse: (v) =>
    O.getOrElse(
      O.flatMap(O.filter(O.some(v), P.isString), (s) => O.map(DateTime.make(s), (dt) => DateTime.toUtc(dt))),
      () => DateTime.toUtc(DateTime.unsafeNow())
    ),
  unparse: (v) => DateTime.formatIso(v),
});
```

### Quality Check Instructions

**ALWAYS use filtered checks to avoid failures from unrelated packages:**
```bash
bun run build --filter=@beep/todox
bun run check --filter=@beep/todox
# For lint, target the specific directory
cd apps/todox && bun biome check --write src/app/lexical
```

---

## Execution Steps

### Step 1: Discovery (More Careful)

Discovery agents must:
1. Find all nullable return functions
2. Identify ALL callers for each function
3. Classify as "candidate" or "excluded" based on criteria
4. Document reasoning for exclusions

### Steps 2-6

Same pattern as previous phases with additional caller update tracking.

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~1,200 |

Within budget.
