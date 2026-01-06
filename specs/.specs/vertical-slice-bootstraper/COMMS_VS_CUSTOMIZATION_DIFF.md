# Discrepancy Report: Customization vs Comms Slice

> Generated during create-slice testing iteration

## Critical Issues

| # | Issue | Files Affected | Fix Location |
|---|-------|----------------|--------------|
| 1 | `.js` extensions in TypeScript source imports | All templates | Remove `.js` from all template imports |
| 2 | Missing `entities.ts` re-export file | domain/src/ | Add template file |
| 3 | Missing `value-objects/` directory | domain/src/ | Add template directory |
| 4 | Missing namespace export in db/index.ts | server/src/db/index.ts | Fix template |
| 5 | Unused `relations` import causes TS6133 | tables/src/relations.ts | Fix template |

## Detailed Findings

### 1. Import Extension Issues (`.js` suffix)

The templates incorrectly add `.js` extensions to imports. TypeScript source files should NOT have these extensions.

**Affected Templates:**
- `domain/src/index.ts.hbs` - uses `./entities/index.js`
- `domain/src/entities/index.ts.hbs` - uses `./Placeholder/index.js`
- `tables/src/index.ts.hbs` - uses `./schema.js`
- `tables/src/relations.ts.hbs` - uses `./tables/index.js`
- `server/src/index.ts.hbs` - uses `./db/index.js`
- `server/src/db/index.ts.hbs` - uses `./Db/index.js`
- `server/src/db/Db/index.ts.hbs` - uses `./Db.js`
- `server/src/db/repos/index.ts.hbs` - uses `./Placeholder.repo.js`

**Fix:** Remove all `.js` extensions from template imports

### 2. Missing domain/src/entities.ts

Customization has `packages/customization/domain/src/entities.ts` that re-exports from `./entities/index`.

**Fix:** Create template at `templates/domain/src/entities.ts.hbs`:
```typescript
export * from "./entities/index";
```

### 3. Missing value-objects Directory

Customization has `packages/customization/domain/src/value-objects/` directory.

**Fix:** Create template directory with empty index.ts

### 4. Missing Namespace Export in server/src/db/index.ts

**Current (comms):**
```typescript
export * from "./Db/index.js";
```

**Expected (like customization):**
```typescript
export * as CommsDb from "./Db";
```

**Fix:** Update template to use namespace export pattern

### 5. Unused `relations` Import (Bug #24)

The `tables/src/relations.ts` template imports `relations` from drizzle-orm but doesn't use it when there's only a placeholder table with no relations.

**Error:** `TS6133: 'relations' is declared but its value is never read.`

**Fix:** Either remove unused import or add a placeholder relation

## Templates to Fix

1. `tooling/cli/src/commands/create-slice/templates/domain/src/index.ts.hbs`
2. `tooling/cli/src/commands/create-slice/templates/domain/src/entities/index.ts.hbs`
3. `tooling/cli/src/commands/create-slice/templates/tables/src/index.ts.hbs`
4. `tooling/cli/src/commands/create-slice/templates/tables/src/relations.ts.hbs`
5. `tooling/cli/src/commands/create-slice/templates/server/src/index.ts.hbs`
6. `tooling/cli/src/commands/create-slice/templates/server/src/db/index.ts.hbs`
7. `tooling/cli/src/commands/create-slice/templates/server/src/db/Db/index.ts.hbs`
8. `tooling/cli/src/commands/create-slice/templates/server/src/db/repos/index.ts.hbs`

## New Templates Needed

1. `tooling/cli/src/commands/create-slice/templates/domain/src/entities.ts.hbs`
2. `tooling/cli/src/commands/create-slice/templates/domain/src/value-objects/index.ts.hbs`
