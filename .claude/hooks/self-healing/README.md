# Self-Healing Hooks

Conservative auto-fix and suggestion system for Effect pattern enforcement.

## Critical Principle

**NEVER auto-fix anything that could change runtime behavior.**

This system distinguishes between:
- **Safe fixes**: Pure syntactic transformations that cannot change runtime behavior
- **Suggestions**: Patterns that require human judgment because they may affect behavior

## Quick Reference

| Pattern | Type | ID | Description |
|---------|------|-----|-------------|
| Namespace imports | Safe | IMP_001 | `import { Effect }` → `import * as Effect` |
| PascalCase Schema | Safe | SCH_001 | `S.struct()` → `S.Struct()` |
| Import sorting | Safe | IMP_003 | Suggests alphabetical import ordering |
| EntityId reminder | Suggestion | EID_001 | Reminds to use branded EntityIds |
| Schema date type | Suggestion | SCH_002 | Verifies S.Date vs S.DateFromString |

## How It Works

The hook runs as a **PostToolUse** handler, triggered after Edit/Write operations on TypeScript files.

```
Edit/Write completes
       │
       ▼
┌──────────────────┐
│ Self-Healing Hook│
│  (PostToolUse)   │
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌──────────┐
│ Safe  │ │Suggestions│
│ Fixes │ │ (Review)  │
└───┬───┘ └────┬─────┘
    │          │
    └────┬─────┘
         ▼
┌─────────────────────┐
│ Additional Context  │
│ (markdown report)   │
└─────────────────────┘
```

## Safe Fixes (Auto-Applied)

### IMP_001: Namespace Imports

Converts named imports from Effect modules to namespace imports.

**Before:**
```typescript
import { Effect, Layer } from "effect"
import { Option } from "effect/Option"
```

**After:**
```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as O from "effect/Option"
```

**Why safe?** Pure syntactic transformation. The runtime module exports are identical.

### SCH_001: PascalCase Schema

Converts lowercase Schema constructors to PascalCase.

**Before:**
```typescript
const schema = S.struct({
  name: S.string,
  count: S.number,
})
```

**After:**
```typescript
const schema = S.Struct({
  name: S.String,
  count: S.Number,
})
```

**Why safe?** Effect Schema exports both lowercase and PascalCase as aliases - they're identical at runtime.

### IMP_003: Import Sorting

Detects unordered imports and suggests the correct order:
1. Node builtins (`node:fs`, `path`)
2. External packages (`effect`, `react`)
3. @beep packages (`@beep/schema`)
4. Relative imports (`./utils`)

**Note:** This only suggests, doesn't auto-fix, to avoid conflicts with formatters.

## Suggestions (Require Human Review)

### EID_001: EntityId Reminder

Detects plain `S.String` usage for fields that likely should use branded EntityIds.

**Detected:**
```typescript
export class User extends M.Class<User>("User")({
  id: S.String,        // ⚠️ Should use branded EntityId
  organizationId: S.String,  // ⚠️ Should use SharedEntityIds.OrganizationId
})
```

**Why suggestion?** Not all string fields should be EntityIds. Human judgment required.

### SCH_002: Schema Date Type

Helps choose between `S.Date` and `S.DateFromString` based on context.

| Context | Schema | Use Case |
|---------|--------|----------|
| API/JSON input | `S.DateFromString` | Parses ISO 8601 strings |
| In-memory objects | `S.Date` | JavaScript Date instances |

**Why suggestion?** Requires understanding the data source - cannot be determined statically.

## Configuration

See `.claude/hooks/config.yaml` for enabling/disabling individual patterns:

```yaml
self_healing:
  enabled: true
  safe_fixes:
    namespace_imports:
      enabled: true
    pascalcase_schema:
      enabled: true
  suggestions:
    entityid_reminder:
      enabled: true
```

## Output Format

The hook outputs markdown in the `additionalContext` field:

```xml
<self-healing-suggestions file="src/domain/User.ts">
## Auto-Fixed (2)
- Line 3: Converted named import to namespace import: Effect from effect/Effect
- Line 5: Converted S.struct to S.Struct

## Suggestions (1)
- Line 12: Consider using branded EntityId: SharedEntityIds.UserId
  Original: `id: S.String`
  Suggested: `id: SharedEntityIds.UserId`
</self-healing-suggestions>
```

## File Structure

```
.claude/hooks/self-healing/
├── index.ts           # Hook entry point (PostToolUse handler)
├── types.ts           # Shared types and schemas
├── utils.ts           # Pattern matching utilities
├── safe-fixes/        # Auto-fix modules
│   ├── index.ts
│   ├── namespace-imports.ts
│   ├── pascalcase-schema.ts
│   └── import-sorting.ts
└── suggestions/       # Suggestion modules
    ├── index.ts
    ├── entityid-reminder.ts
    └── schema-date-type.ts
```

## Adding New Patterns

### Safe Fix Pattern

1. Create module in `safe-fixes/`:
```typescript
export const pattern: HookPattern = {
  id: "XXX_001",
  name: "my-pattern",
  pattern: "regex here",
  fix_type: "safe",
  description: "...",
  category: "...",
  file_extensions: [".ts", ".tsx"],
}

export const fix = (content: string) => { ... }
export const detect = (content: string) => { ... }
```

2. Export from `safe-fixes/index.ts`
3. Add to `config.yaml`

### Suggestion Pattern

Same structure but with `fix_type: "unsafe"` and the `fix` function should only detect, not modify.

## Testing

```bash
# Test with a sample file
echo '{"hook_event_name":"PostToolUse","tool_name":"Edit","tool_input":{"file_path":"test.ts"},"tool_response":{"newString":"import { Effect } from \"effect/Effect\""}}' | bun .claude/hooks/self-healing/index.ts
```

## Related Specs

- **ai-friendliness-10-of-10** Phase 4: Self-Healing Hooks
- Error catalog: `specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml`
