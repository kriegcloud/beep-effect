# Codebase Researcher Agent Design

## Exploration Methodology

The agent follows a four-step systematic exploration process:

### Step 1: Discover

**Objective**: Find all potentially relevant files for the research question.

**Process**:
1. Parse the research question to identify key concepts
2. Determine which slices (iam, documents, comms, customization) are likely involved
3. Execute glob patterns to find matching files
4. Prioritize results by modification time and relevance

**Tools**: Glob

**Decision Tree**:
```
Question Type -> Primary Glob Patterns
├── "How does X work?" -> **/*X*.ts, packages/**/AGENTS.md
├── "Where is X defined?" -> **/*X*.ts, **/entities/**/X*.ts
├── "What uses X?" -> Grep first, then Glob for found paths
└── "What patterns for X?" -> **/X*.service.ts, **/X*.repo.ts
```

### Step 2: Analyze

**Objective**: Map dependencies and understand relationships.

**Process**:
1. For each discovered file, extract import statements
2. Build a dependency graph (which files import which)
3. Identify the layers involved (domain, tables, server, client, ui)
4. Detect any boundary violations

**Tools**: Grep, Read

**Key Grep Patterns**:
- `from "@beep/` - Find all internal imports
- `import \* as .* from "effect/` - Find Effect imports
- `Effect.Service` - Find service definitions
- `Effect.gen` - Find effectful implementations

### Step 3: Identify

**Objective**: Extract reusable patterns and implementation details.

**Process**:
1. Read relevant source files (prioritize entry points)
2. Extract code patterns that answer the research question
3. Note any guardrails from AGENTS.md files
4. Capture file:line references for specific implementations

**Tools**: Read

**Priority Order**:
1. AGENTS.md for the relevant package(s)
2. Index/barrel files (`index.ts`)
3. Service/repo definitions
4. Specific implementation files

### Step 4: Map

**Objective**: Document architectural boundaries and integration points.

**Process**:
1. Identify which packages are involved
2. Map the layer relationships
3. Document any cross-slice dependencies
4. Note integration patterns (Layers, Services, Effects)

**Tools**: All (synthesis)

---

## Output Format

### Research Report Structure

```markdown
# Codebase Research: [Feature/Task Name]

## Summary
[1-2 sentence overview of findings]

## Relevant Files

| File | Purpose | Layer |
|------|---------|-------|
| `path/to/file.ts:line` | Description | domain/tables/server/etc |

## Existing Patterns

### Pattern: [Name]
**Location**: `file:line`
**Purpose**: What this pattern accomplishes
**Usage**:
```typescript
// Code example from codebase
```

## Architectural Boundaries

### Packages Involved
- `@beep/package-a` - Role in this feature
- `@beep/package-b` - Role in this feature

### Layer Dependencies
```
domain -> tables -> server
         ↓
       client
```

### Integration Points
- How packages connect
- Which services are consumed
- Layer boundaries respected/violated

## Import Graph

### Primary Package: `@beep/X`
```
Imports:
  ← @beep/shared-domain (entity IDs)
  ← @beep/schema (validation)
  ← effect/* (runtime)

Imported by:
  → @beep/runtime-server (composition)
  → apps/web (consumption)
```

## Recommendations

### Patterns to Follow
- Pattern A from `file:line` because...
- Pattern B from `file:line` because...

### Patterns to Avoid
- Anti-pattern A because...

### Suggested Approach
[Specific recommendations for the task at hand]
```

---

## Tool Usage Reference

### Glob Patterns Library

#### By File Type

| Pattern | Files Found |
|---------|-------------|
| `**/*.service.ts` | Effect service definitions |
| `**/*.repo.ts` | Repository implementations |
| `**/*.model.ts` | Domain model files |
| `**/*.table.ts` | Drizzle table definitions |
| `**/AGENTS.md` | Package documentation |
| `**/README.md` | Package overviews |
| `**/index.ts` | Barrel exports |

#### By Layer

| Pattern | Layer |
|---------|-------|
| `packages/*/domain/src/**/*.ts` | Domain layer |
| `packages/*/tables/src/**/*.ts` | Tables layer |
| `packages/*/server/src/**/*.ts` | Server layer |
| `packages/*/client/src/**/*.ts` | Client layer |
| `packages/*/ui/src/**/*.ts` | UI layer |

#### By Slice

| Pattern | Slice |
|---------|-------|
| `packages/iam/**/*.ts` | IAM slice |
| `packages/documents/**/*.ts` | Documents slice |
| `packages/comms/**/*.ts` | Communications slice |
| `packages/customization/**/*.ts` | Customization slice |
| `packages/shared/**/*.ts` | Shared infrastructure |
| `packages/common/**/*.ts` | Common utilities |

### Grep Patterns Library

#### Import Analysis

| Pattern | Purpose |
|---------|---------|
| `from "@beep/` | All internal package imports |
| `from "effect/` | Effect module imports |
| `from "@effect/` | Effect platform imports |
| `import \* as` | Namespace imports |

#### Pattern Detection

| Pattern | Finds |
|---------|-------|
| `Effect\.Service` | Service class definitions |
| `Effect\.gen` | Effectful generator functions |
| `Effect\.succeed` | Pure value lifting |
| `Effect\.fail` | Error creation |
| `Layer\.` | Layer construction |
| `S\.Struct` | Schema struct definitions |
| `M\.Class` | SQL model definitions |

#### Cross-Slice Violations

| Pattern | Violation Type |
|---------|---------------|
| `@beep/iam` in `packages/documents/` | Documents → IAM |
| `@beep/documents` in `packages/iam/` | IAM → Documents |
| `@beep/comms` in `packages/iam/` | IAM → Comms |

---

## Example Exploration

### Question: "How does authentication work?"

**Step 1: Discover**
```
Glob: packages/iam/**/*.ts
Glob: packages/iam/**/AGENTS.md
Glob: **/*auth*.ts
Glob: **/*session*.ts
```

**Step 2: Analyze**
```
Grep: "Effect.Service" in packages/iam/server/
Grep: "@beep/iam" in packages/runtime/
Grep: "better-auth" in packages/iam/
```

**Step 3: Identify**
```
Read: packages/iam/server/AGENTS.md
Read: packages/iam/server/src/adapters/better-auth/Service.ts
Read: packages/iam/server/src/db/repos/Session.repo.ts
```

**Step 4: Map**
```
Packages: @beep/iam-server, @beep/iam-domain, @beep/shared-domain
Layers: domain <- tables <- server
Integration: Better Auth → IamRepos.layer → Runtime
```

### Output Sample

```markdown
# Codebase Research: Authentication Flow

## Summary
Authentication is handled by Better Auth via @beep/iam-server, with
session persistence through IamRepos and domain models from @beep/iam-domain.

## Relevant Files

| File | Purpose | Layer |
|------|---------|-------|
| `packages/iam/server/src/adapters/better-auth/Service.ts:15` | Better Auth integration | server |
| `packages/iam/server/src/db/repos/Session.repo.ts:7` | Session persistence | server |
| `packages/iam/domain/src/entities/Session/Session.model.ts:14` | Session model | domain |

...
```

---

## Quality Criteria

The agent output should:

1. **Be specific** - Include file:line references, not vague descriptions
2. **Be accurate** - All file paths must exist in the codebase
3. **Follow Effect patterns** - Examples use `Effect.gen`, namespace imports
4. **Respect boundaries** - Identify and flag any architectural violations
5. **Be actionable** - Provide clear recommendations for the task at hand
