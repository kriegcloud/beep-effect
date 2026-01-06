# Integration Points Agent Prompt

[FINAL - Milestone 1]

## Task

Analyze and document all files that must be **created** or **modified** when adding a new vertical slice. Your analysis will be used to ensure the bootstrapper modifies all required integration points.

## Scope

Identify and document **8 integration point categories**:

| # | Integration Point | Operation | Scope |
|---|-------------------|-----------|-------|
| 1 | Entity IDs | Create + Modify | shared-domain |
| 2 | Table Factories | Reference Only | shared-tables |
| 3 | Database Registration | Modify | _internal/db-admin |
| 4 | Path Aliases | Modify | tsconfig.base.jsonc |
| 5 | Workspaces | Modify | Root package.json |
| 6 | Package Exports | Create | Per-package package.json |
| 7 | Db Service | Create | slice-server |
| 8 | Barrel Exports | Create | All index.ts files |

## Key Questions to Answer

1. What files are created vs modified for each integration point?
2. What is the dependency order for modifications?
3. What values need templating/substitution?
4. What are the before/after states for modifications?

## Pattern Criteria

### For Each Integration Point

Document:
- **Files affected**: Exact paths
- **Operation type**: Create, Modify, or Reference
- **Dependency**: What must exist first
- **Template variables**: Values needing substitution
- **Before/After**: Example code changes

### Modification Phases

Classify all operations into phases:

| Phase | Description | Parallelizable |
|-------|-------------|----------------|
| 1. Foundation | Create directories, config files | Yes |
| 2. Registration | Add to tsconfig, workspaces | Sequential |
| 3. Link | Run bun install | Blocking |
| 4. Integration | Create entity IDs, tables, Db | Partially |
| 5. Wiring | Export from barrels | Yes |

## Integration Point Details

### 1. Entity IDs (shared-domain)

**Files**:
- `packages/shared/domain/src/entity-ids/<slice>-ids.ts` (Create)
- `packages/shared/domain/src/entity-ids/ids.ts` (Modify - add export)

**Template Variables**:
- `<slice>` - Slice name (e.g., "notifications")
- `<EntityName>Id` - ID type name (e.g., "NotificationId")
- `<prefix>` - ID prefix (e.g., "notif__")

### 2. Table Factories (shared-tables)

**Files**: Reference only - no modifications
- `packages/shared/tables/src/factories/Table.ts`
- `packages/shared/tables/src/factories/OrgTable.ts`

### 3. Database Registration (_internal/db-admin)

**Files**:
- `packages/_internal/db-admin/drizzle.config.ts` (Modify - if needed)
- Schema imports may need updating

### 4. Path Aliases (tsconfig.base.jsonc)

**Files**:
- `tsconfig.base.jsonc` (Modify)

**Entries per sub-package** (3 patterns each):
```
@beep/<slice>-<layer>
@beep/<slice>-<layer>/*
packages/<slice>/<layer>/src/...
```

### 5. Workspaces (package.json)

**Files**:
- `package.json` (Root - Modify)

**Entries**:
```json
"workspaces": [
  "packages/<slice>/domain",
  "packages/<slice>/tables",
  "packages/<slice>/server"
]
```

### 6. Package Exports (per-package)

**Files** (Create per sub-package):
- `packages/<slice>/<layer>/package.json`

**Required fields**:
- name
- version
- type
- exports
- dependencies

### 7. Db Service (slice-server)

**Files**:
- `packages/<slice>/server/src/db/<Slice>Db.ts` (Create)

### 8. Barrel Exports (index.ts)

**Files** (Create per sub-package):
- `packages/<slice>/<layer>/src/index.ts`

## Output Requirements

**File**: `specs/.specs/vertical-slice-bootstraper/outputs/milestone-1/integration-points-map.md`

**Format**:

```markdown
# Integration Points Map

## Summary

| Integration Point | Files Created | Files Modified | Phase |
|-------------------|---------------|----------------|-------|
| Entity IDs | 1 | 1 | 4 |
| ... | ... | ... | ... |

## Modification Order

### Phase 1: Foundation (parallel)
[Files and operations]

### Phase 2: Registration (sequential)
[Files and operations with order numbers]

### Phase 3: Link
[bun install]

### Phase 4: Integration (partially parallel)
[Files and operations]

### Phase 5: Wiring (parallel)
[Files and operations]

## Detailed Integration Points

### 1. Entity IDs

#### Create: <slice>-ids.ts
\`\`\`typescript
// Template
\`\`\`

#### Modify: ids.ts

**Before**:
\`\`\`typescript
export * from "./documents-ids.js";
\`\`\`

**After**:
\`\`\`typescript
export * from "./documents-ids.js";
export * from "./<slice>-ids.js";
\`\`\`

### 2. Path Aliases

#### Modify: tsconfig.base.jsonc

**Entries to add** (per sub-package):
\`\`\`json
"@beep/<slice>-domain": ["packages/<slice>/domain/src/index.ts"],
"@beep/<slice>-domain/*": ["packages/<slice>/domain/src/*"],
\`\`\`

[Continue for all 8 integration points...]

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `<slice>` | Slice name lowercase | notifications |
| `<Slice>` | Slice name PascalCase | Notifications |
| `<layer>` | Sub-package layer | domain, tables, server |
| `<prefix>` | Entity ID prefix | notif__ |

## Dependency Graph

\`\`\`
tsconfig.base.jsonc
       ↓
root package.json
       ↓
bun install
       ↓
shared-domain/entity-ids
       ↓
<slice>/tables
       ↓
<slice>/server
\`\`\`
```

## Reference Files

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/entity-ids/` | Entity ID patterns |
| `packages/documents/*/package.json` | Package.json patterns |
| `packages/documents/*/tsconfig.json` | TSConfig patterns |
| `tsconfig.base.jsonc` | Path alias format |
| `package.json` (root) | Workspace registration |

## Success Criteria

- [ ] All 8 integration points documented
- [ ] Create vs Modify clearly classified
- [ ] Before/After examples for all modifications
- [ ] Dependency order specified
- [ ] Template variables listed
- [ ] Phases are parallelizable where noted

---

## Prompt Feedback

After completing this task, append a section evaluating this prompt:

```markdown
## Prompt Feedback

**Efficiency Score**: X/10

**What Worked**:
- ...

**What Was Missing**:
- ...

**Suggested Improvements**:
- ...
```
