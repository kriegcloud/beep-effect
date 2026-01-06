# TSConfig Agent Prompt

[REFINED - Iteration 1]

## Task

Analyze the TypeScript configuration structure to document all tsconfig patterns needed when bootstrapping a new vertical slice. Your analysis will be used for **code generation templates**.

## Scope

### Files to Create (per slice)

| File | Purpose |
|------|---------|
| `packages/<slice>/domain/tsconfig.json` | Domain layer config |
| `packages/<slice>/tables/tsconfig.json` | Tables layer config |
| `packages/<slice>/server/tsconfig.json` | Server layer config |
| `packages/<slice>/client/tsconfig.json` | Client layer config (if applicable) |
| `packages/<slice>/ui/tsconfig.json` | UI layer config (if applicable) |

### Files to Modify

| File | Modification |
|------|--------------|
| `tsconfig.base.jsonc` | Add path aliases (6-10 entries per slice) |

### Files to Reference (no modification)

- `tsconfig.json` (root)
- Existing package tsconfigs (pattern examples only)

## Key Questions to Answer

1. What are the required tsconfig flags for each layer?
2. How are project references structured within a slice?
3. How are cross-slice references handled?
4. What path aliases are needed and in what format?
5. How many entries total for a new slice?
6. Are there composite project requirements?

## Pattern Criteria

### Per-Package TSConfig Structure

Document these required fields:

| Field | Purpose |
|-------|---------|
| `extends` | Base config reference |
| `compilerOptions.composite` | Project reference support |
| `compilerOptions.rootDir` | Source root |
| `compilerOptions.outDir` | Build output |
| `include` | Files to compile |
| `references` | Dependent projects |

### Reference Patterns

Document reference formats for:

| Reference Type | Format |
|----------------|--------|
| Same-slice sibling | `{ "path": "../domain" }` |
| Cross-slice shared | `{ "path": "../../shared/domain" }` |
| Common packages | `{ "path": "../../common/schema" }` |

### Path Alias Patterns

Document alias format:

| Pattern | Maps To |
|---------|---------|
| `@beep/<slice>-<layer>` | `packages/<slice>/<layer>/src/index.ts` |
| `@beep/<slice>-<layer>/*` | `packages/<slice>/<layer>/src/*` |

### Layer Dependencies

Document typical reference graph:

```
server
  ├── domain
  ├── tables
  └── shared/domain

client
  └── domain

ui
  ├── domain
  └── client

tables
  └── shared/tables

domain
  └── shared/domain
```

## Output Requirements

**File**: `specs/.specs/vertical-slice-bootstraper/outputs/milestone-1/tsconfig-patterns.md`

**Format**:

```markdown
# TSConfig Patterns

## Overview
[Summary of tsconfig structure in monorepo]

## Base Configuration

### tsconfig.base.jsonc
[Key settings that sub-packages inherit]

## Per-Layer Patterns

### domain/tsconfig.json
\`\`\`json
{
  "extends": "../../tsconfig.base.jsonc",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../../shared/domain" }
  ]
}
\`\`\`

### tables/tsconfig.json
\`\`\`json
// Template
\`\`\`

### server/tsconfig.json
\`\`\`json
// Template with more references
\`\`\`

### client/tsconfig.json (if applicable)
\`\`\`json
// Template
\`\`\`

### ui/tsconfig.json (if applicable)
\`\`\`json
// Template
\`\`\`

## Path Alias Registration

### tsconfig.base.jsonc Modifications

#### Existing Pattern
\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "@beep/documents-domain": ["packages/documents/domain/src/index.ts"],
      "@beep/documents-domain/*": ["packages/documents/domain/src/*"],
      ...
    }
  }
}
\`\`\`

#### New Slice Entries
For slice "notifications" (minimal - 3 layers):
\`\`\`json
"@beep/notifications-domain": ["packages/notifications/domain/src/index.ts"],
"@beep/notifications-domain/*": ["packages/notifications/domain/src/*"],
"@beep/notifications-tables": ["packages/notifications/tables/src/index.ts"],
"@beep/notifications-tables/*": ["packages/notifications/tables/src/*"],
"@beep/notifications-server": ["packages/notifications/server/src/index.ts"],
"@beep/notifications-server/*": ["packages/notifications/server/src/*"],
\`\`\`

For complete slice (5 layers): add client and ui aliases.

## Reference Resolution

### Within Slice
[How sibling packages reference each other]

### To Shared Layer
[How slices reference shared packages]

### To Common Layer
[How slices reference common packages]

## Composite Project Settings

### Required Flags
| Flag | Value | Purpose |
|------|-------|---------|
| composite | true | Enable project references |
| rootDir | "src" | Required with composite |
| outDir | "dist" | Build output location |

### Include/Exclude Patterns
\`\`\`json
"include": ["src/**/*"],
"exclude": ["**/*.test.ts", "dist"]
\`\`\`

## Special Cases

### Common Packages
[Different alias count, single-layer packages]

### Shared Packages
[Standard slice pattern applied]

### _internal Packages
[Tooling pattern, not slice architecture]

## Generation Template

### Path Alias Generator
\`\`\`typescript
function generateAliases(slice: string, layers: string[]) {
  return layers.flatMap(layer => [
    [`@beep/${slice}-${layer}`, [`packages/${slice}/${layer}/src/index.ts`]],
    [`@beep/${slice}-${layer}/*`, [`packages/${slice}/${layer}/src/*`]],
  ]);
}
\`\`\`

## Checklist

### Minimal Slice (3 layers)
- [ ] domain/tsconfig.json created
- [ ] tables/tsconfig.json created
- [ ] server/tsconfig.json created
- [ ] 6 path aliases added to tsconfig.base.jsonc

### Complete Slice (5 layers)
- [ ] All minimal items
- [ ] client/tsconfig.json created
- [ ] ui/tsconfig.json created
- [ ] 10 path aliases added to tsconfig.base.jsonc
```

## Reference Files

| File | Purpose |
|------|---------|
| `tsconfig.base.jsonc` | Base configuration, path aliases |
| `tsconfig.json` | Root composite config |
| `packages/documents/*/tsconfig.json` | Complete slice pattern |
| `packages/customization/*/tsconfig.json` | Minimal slice pattern |
| `packages/shared/*/tsconfig.json` | Shared layer pattern |
| `packages/common/*/tsconfig.json` | Common layer pattern |

## Success Criteria

- [ ] All layer tsconfig templates provided
- [ ] Reference patterns documented for all cases
- [ ] Path alias format explicit
- [ ] Composite settings documented
- [ ] Generation template included
- [ ] Special cases addressed

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
