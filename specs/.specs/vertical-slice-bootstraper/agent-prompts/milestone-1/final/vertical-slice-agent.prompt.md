# Vertical Slice Agent Prompt

[FINAL - Milestone 1]

## Task

Analyze the **customization** and **documents** vertical slices to extract the 5-sub-package pattern for scaffolding new slices. Your analysis will be used for **code generation templates**.

## Scope

| Slice | Complexity | Use As |
|-------|------------|--------|
| `packages/customization/*` | Minimal | Baseline template |
| `packages/documents/*` | Complete | Extended template (RPC, UI) |

Compare both to identify:
- Required structure (all slices)
- Optional structure (RPC, handlers, UI components)
- Configuration patterns (tsconfig, package.json)

## Key Questions to Answer

1. What are the 5 sub-packages and their responsibilities?
2. What files are required in each sub-package?
3. How are entity IDs registered in shared-domain?
4. What configuration files are needed (tsconfig, package.json, reset.d.ts)?
5. When should RPC/handler patterns be included?
6. How do exports/barrels work?

## Pattern Criteria

### Per Sub-Package Analysis

| Sub-Package | Document These Patterns |
|-------------|-------------------------|
| **domain** | Models, value objects, pure logic, EntityId usage |
| **tables** | Drizzle schemas, Table.make vs OrgTable.make |
| **server** | Db service, repos, RPC handlers (if present) |
| **client** | Contracts, queries, client services |
| **ui** | Components, hooks, composition |

### Configuration Files

| File | Document |
|------|----------|
| `tsconfig.json` | Extends, references, paths |
| `package.json` | Name, exports, dependencies |
| `reset.d.ts` | Purpose, when to include |
| `AGENTS.md` | Minimal template structure |

### Entity ID Registration

Document the complete flow:
1. Where to create slice-specific IDs
2. How to export from shared-domain
3. How to use in domain models
4. How to use in table definitions

## Slice Complexity Levels

### Minimal Slice (like customization)

```
packages/<slice>/
├── domain/
│   ├── src/
│   │   ├── models/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── tables/
│   ├── src/
│   │   ├── schemas/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── server/
    ├── src/
    │   ├── db/
    │   │   └── <Slice>Db.ts
    │   ├── repos/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

### Complete Slice (like documents)

Add to minimal:
```
├── client/
│   ├── src/
│   │   ├── contracts/
│   │   ├── queries/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── ui/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

## Output Requirements

**File**: `specs/.specs/vertical-slice-bootstraper/outputs/milestone-1/vertical-slice-patterns.md`

**Format**:

```markdown
# Vertical Slice Patterns

## Overview
[5-sub-package pattern summary]

## Sub-Package Structure

### domain/
[Purpose, files, patterns]

#### Required Files
- models/index.ts
- index.ts

#### Model Pattern
\`\`\`typescript
// Example
\`\`\`

### tables/
[Purpose, files, patterns]

#### Table Factory Usage
| Factory | Use Case |
|---------|----------|
| Table.make() | ... |
| OrgTable.make() | ... |

### server/
[Purpose, files, patterns]

#### Db Service Pattern
\`\`\`typescript
// Example
\`\`\`

#### Repository Pattern
\`\`\`typescript
// Example
\`\`\`

### client/ (optional)
[When to include, patterns]

### ui/ (optional)
[When to include, patterns]

## Configuration Templates

### tsconfig.json Template
\`\`\`json
// Per sub-package
\`\`\`

### package.json Template
\`\`\`json
// Per sub-package
\`\`\`

## Entity ID Registration

### Step 1: Create Slice IDs
[File path and template]

### Step 2: Export from shared-domain
[File to modify and pattern]

### Step 3: Use in Domain
[Usage pattern]

### Step 4: Use in Tables
[Usage pattern]

## Scaffolding Checklist

### Minimal Slice
- [ ] Create domain/
- [ ] Create tables/
- [ ] Create server/
- [ ] Register entity IDs
- [ ] Add path aliases to tsconfig.base.jsonc

### Complete Slice
- [ ] All minimal steps
- [ ] Create client/
- [ ] Create ui/
```

## Reference Files

| File | Purpose |
|------|---------|
| `packages/customization/*/` | Minimal slice pattern |
| `packages/documents/*/` | Complete slice pattern |
| `packages/shared/domain/src/entity-ids/` | Entity ID registration |
| `packages/shared/tables/src/factories/` | Table factories |
| `tsconfig.base.jsonc` | Path alias patterns |
| `AGENTS.md` | Project conventions |

## Success Criteria

- [ ] All 5 sub-packages documented
- [ ] Configuration templates are copy-paste ready
- [ ] Entity ID flow is complete
- [ ] Minimal vs complete clearly distinguished
- [ ] Scaffolding checklist is actionable

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
