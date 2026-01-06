# Vertical Slice Agent Feedback - Iteration 1

## Efficiency Score: 6/10

## What Worked Well

1. **Clear Structural Constraints**: 5-sub-package pattern explicitly stated
2. **Pattern Reference**: "Most recent, cleanest patterns" (customization) was accurate guidance
3. **Effect-First Expectations**: Aligned with codebase conventions
4. **Identity/Name Templating**: Hint about variable substitution was helpful

## What Was Missing

### Configuration Gaps
- **No tsconfig dependency graph template**: Expected format for tsconfig.json references unclear
- **No package.json pattern template**: Required fields, exports structure not specified
- **No barrel export conventions**: Index.ts patterns not documented

### Pattern Gaps
- **No RPC/Handler patterns shown**: documents has these, customization doesn't - which to use?
- **No test file conventions**: Where tests live, naming patterns
- **No server-internal structure comparison**: Sub-package organization varies

### Documentation Gaps
- **Entity-id registration process**: How IDs connect to shared-domain
- **AGENTS.md minimal template**: What should be in package AGENTS.md
- **reset.d.ts significance**: Purpose and when to include

## Ambiguities Encountered

1. **Client package**: Minimal structure vs extended (with contracts, queries) unclear
2. **UI package**: Minimal structure vs extended (with components, hooks) unclear
3. **Identity composers**: Located in domain vs shared-domain unclear
4. **Entity IDs**: Shared vs slice-specific patterns unclear
5. **Schema exports**: Index pattern organization unclear
6. **Shared-tables imports**: When to use Table.make vs OrgTable.make

## Suggested Improvements

### 1. Add Identity Composer Examples

```markdown
## Entity ID Pattern

### Before (no slice)
shared-domain/entity-ids/ids.ts - no entry

### After (with slice)
shared-domain/entity-ids/ids.ts:
\`\`\`typescript
export * from "./customization-ids.js";
\`\`\`

shared-domain/entity-ids/customization-ids.ts:
\`\`\`typescript
import { EntityId } from "@beep/schema";

export const ThemeId = EntityId.make("theme__");
export const SettingId = EntityId.make("setting__");
\`\`\`
```

### 2. Clarify Minimal vs Complete Slice

```markdown
## Slice Complexity

| Type | Example | Includes |
|------|---------|----------|
| Minimal | customization | domain, tables, server |
| Standard | documents | + client, ui |
| Complete | iam | + advanced auth, handlers |
```

### 3. Document Entity-ID Registration

```markdown
## Entity ID Registration

Files to modify:
1. `packages/shared/domain/src/entity-ids/<slice>-ids.ts` - Create
2. `packages/shared/domain/src/entity-ids/ids.ts` - Add export
3. `packages/<slice>/domain/src/models/*.ts` - Use IDs
```

### 4. Create Minimal AGENTS.md Template

```markdown
# <Slice> <Layer> AGENTS.md Template

## Purpose
[One sentence description]

## Key Patterns
- [Pattern 1]
- [Pattern 2]

## Dependencies
- `@beep/<slice>-domain`
- `@beep/shared-<layer>`

## Common Tasks
- [Task 1]: [File to modify]
```

### 5. Clarify TSConfig Reference Syntax

```markdown
## TSConfig Pattern

\`\`\`json
{
  "extends": "../../tsconfig.base.jsonc",
  "references": [
    { "path": "../domain" },
    { "path": "../../shared/tables" }
  ]
}
\`\`\`
```

### 6. Document Shared-Tables Import Pattern

```markdown
## Table Factory Usage

| Factory | Use Case |
|---------|----------|
| `Table.make()` | System tables, no tenant |
| `OrgTable.make()` | Multi-tenant tables |
```

### 7. Specify Handler/Route Expansion Rules

```markdown
## When to Add RPC Patterns

Add `packages/<slice>/server/src/rpc/` when:
- Slice has client-facing operations
- Need typed request/response contracts
- Require authentication/authorization

Skip when:
- Internal infrastructure only
- No external API surface
```

### 8. Provide RPC Contract Examples

```markdown
## RPC Pattern (if applicable)

\`\`\`typescript
// packages/<slice>/server/src/rpc/v1/<operation>.ts
import * as Rpc from "@effect/rpc";
import * as S from "effect/Schema";

export const <Operation>Request = S.Struct({...});
export const <Operation>Response = S.Struct({...});
export const <Operation> = Rpc.make("<operation>", {...});
\`\`\`
```

## Impact on Deliverable Quality

The missing criteria led to:
- Uncertainty about package completeness levels
- Potential missed configuration files
- Ambiguous entity ID ownership
- No clear minimal vs extended patterns

## Recommendations for Iteration 2

1. Add explicit file checklist per complexity level
2. Document all config files needed (tsconfig, package.json, reset.d.ts)
3. Clarify entity ID location and registration
4. Provide minimal AGENTS.md template
5. Document when RPC patterns are needed
6. Add before/after examples for shared-domain modifications
