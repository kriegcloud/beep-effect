# Research Master: Vertical Slice Bootstrapper

> Synthesis document for Milestone 1 research findings. This document provides the consolidated findings for implementing the `create-slice` CLI command.

---

## 1. Executive Summary

The `create-slice` CLI command will scaffold new vertical slices in the `beep-effect` monorepo following the established 5-sub-package pattern. The research phase identified:

- **5 sub-packages per slice**: domain, tables, server, client, ui
- **9 integration points** requiring file creation or modification
- **4 phases** of implementation with dependency ordering
- **15+ path aliases** per complete slice (3 per layer)
- **20+ files** to generate per slice (4 tsconfig files per layer + package.json + source files)

The CLI will use `@effect/cli` for command parsing, `@effect/platform` for file operations, and ts-morph for AST-based modifications where needed.

---

## 2. Key Components Identified

### 2.1 Template Engine

**Purpose**: Generate file content with variable substitution

**Required Variables**:
| Variable | Description | Example |
|----------|-------------|---------|
| `{slice}` | Lowercase slice name | `customization` |
| `{Slice}` | PascalCase slice name | `Customization` |
| `{SlicePascal}` | PascalCase for identity | `Customization` |
| `{SLICE_NAME}` | UPPER_SNAKE for constants | `CUSTOMIZATION` |
| `{Entity}` | PascalCase entity name | `UserHotkey` |
| `{entity}` | camelCase entity name | `userHotkey` |
| `{table_name}` | snake_case table name | `user_hotkey` |
| `{description}` | Entity description | `user configured hotkeys` |

### 2.2 File Generator

**Purpose**: Create directory structure and files

**Files per layer**:
- `package.json`
- `tsconfig.json`
- `tsconfig.src.json`
- `tsconfig.build.json`
- `tsconfig.test.json`
- `src/index.ts`
- Layer-specific source files

### 2.3 AST Modifier (ts-morph)

**Purpose**: Modify existing TypeScript files safely

**Required operations**:
- Add exports to barrel files
- Add entries to union types
- Modify import statements

### 2.4 CLI Handler

**Purpose**: Parse arguments and orchestrate generation

**Options**:
- `--name` / `-n`: Slice name (required)
- `--minimal` / `-m`: Generate only domain, tables, server
- `--entity` / `-e`: Initial entity name
- `--dry-run`: Preview changes without writing

---

## 3. Integration Points Summary

| # | Integration Point | Files Created | Files Modified | Phase |
|---|-------------------|---------------|----------------|-------|
| 1 | Identity Composers | 0 | 1 | Foundation |
| 2 | Entity IDs | 4 | 3 | Foundation |
| 3 | Persistence Layer | 0 | 1 | Wiring |
| 4 | DataAccess Layer | 0 | 1 | Wiring |
| 5 | DB Admin Tables | 0 | 1 | Link |
| 6 | DB Admin Relations | 0 | 1 | Link |
| 7 | Path Aliases | 0 | 1 | Registration |
| 8 | TSConfig Slices | 1 | 1 | Registration |
| 9 | Root TSConfig | 0 | 1 | Registration |

### File Path Reference

| Integration Point | File Path |
|-------------------|-----------|
| Identity Composers | `packages/common/identity/src/packages.ts` |
| Entity IDs (create) | `packages/shared/domain/src/entity-ids/{slice}/ids.ts` |
| Entity IDs (any-id) | `packages/shared/domain/src/entity-ids/{slice}/any-id.ts` |
| Entity IDs (table-name) | `packages/shared/domain/src/entity-ids/{slice}/table-name.ts` |
| Entity IDs (index) | `packages/shared/domain/src/entity-ids/{slice}/index.ts` |
| Entity IDs (export) | `packages/shared/domain/src/entity-ids/entity-ids.ts` |
| Entity IDs (union) | `packages/shared/domain/src/entity-ids/any-entity-id.ts` |
| Persistence Layer | `packages/runtime/server/src/Persistence.layer.ts` |
| DataAccess Layer | `packages/runtime/server/src/DataAccess.layer.ts` |
| DB Admin Tables | `packages/_internal/db-admin/src/tables.ts` |
| DB Admin Relations | `packages/_internal/db-admin/src/slice-relations.ts` |
| Path Aliases | `tsconfig.base.jsonc` |
| TSConfig Slices | `tsconfig.slices/{slice}.json` |
| Root TSConfig | `tsconfig.json` |

---

## 4. Template Variables

### Core Variables

```typescript
interface SliceVariables {
  // Naming
  slice: string;           // "customization"
  Slice: string;           // "Customization"
  SlicePascal: string;     // "Customization"
  SLICE_NAME: string;      // "CUSTOMIZATION"

  // Initial entity (optional)
  entity?: string;         // "userHotkey"
  Entity?: string;         // "UserHotkey"
  table_name?: string;     // "user_hotkey"
  entityPrefix?: string;   // "user_hotkey__"

  // Layers to generate
  layers: Array<'domain' | 'tables' | 'server' | 'client' | 'ui'>;

  // Metadata
  description?: string;
}
```

### Derivation Rules

```typescript
const deriveVariables = (input: { name: string; entity?: string }) => {
  const slice = toKebabCase(input.name);
  const Slice = toPascalCase(input.name);

  return {
    slice,
    Slice,
    SlicePascal: Slice,
    SLICE_NAME: toUpperSnakeCase(input.name),
    entity: input.entity ? toCamelCase(input.entity) : undefined,
    Entity: input.entity ? toPascalCase(input.entity) : undefined,
    table_name: input.entity ? toSnakeCase(input.entity) : undefined,
    entityPrefix: input.entity ? `${toSnakeCase(input.entity)}__` : undefined,
  };
};
```

---

## 5. Implementation Phases

### Phase 1: Foundation (Parallel)

Create base directory structure and configuration files.

**Tasks**:
1. Create `packages/{slice}/` directory
2. Create sub-package directories (domain, tables, server, [client, ui])
3. Generate `package.json` for each sub-package
4. Generate tsconfig files (4 per layer)
5. Generate base source files (`src/index.ts`)

### Phase 2: Registration (Sequential)

Register the new slice in TypeScript configuration.

**Tasks** (order matters):
1. Add path aliases to `tsconfig.base.jsonc`
2. Create `tsconfig.slices/{slice}.json`
3. Add reference to root `tsconfig.json`

### Phase 3: Link (Blocking)

Install dependencies.

**Tasks**:
1. Run `bun install`

### Phase 4: Integration (Partially Parallel)

Create slice-specific content and register with runtime.

**Tasks**:
1. Register identity composers in `packages/common/identity/src/packages.ts`
2. Create entity IDs in `packages/shared/domain/src/entity-ids/{slice}/`
3. Register entity IDs in `entity-ids.ts` and `any-entity-id.ts`
4. Create domain models (if entity specified)
5. Create table definitions
6. Create Db client service
7. Create repository

### Phase 5: Wiring (Sequential)

Wire slice into runtime layers.

**Tasks**:
1. Add to Persistence layer (`packages/runtime/server/src/Persistence.layer.ts`)
2. Add to DataAccess layer (`packages/runtime/server/src/DataAccess.layer.ts`)
3. Export tables in db-admin (`packages/_internal/db-admin/src/tables.ts`)
4. Export relations in db-admin (`packages/_internal/db-admin/src/slice-relations.ts`)

---

## 6. Critical Constraints

### Effect-First Patterns

All generated code must follow Effect conventions:

```typescript
// Use Effect.gen, never async/await
const handler = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  // ...
});

// Use Effect utilities, never native methods
F.pipe(items, A.map(fn));     // NOT items.map(fn)
F.pipe(str, Str.trim);        // NOT str.trim()

// Use Effect collections
HashMap.empty<string, number>(); // NOT new Map()
```

### Import Conventions

```typescript
// Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// Never relative imports across packages
import { UserId } from "@beep/shared-domain"; // NOT ../../../shared/domain
```

### Validation Rules

1. Slice name must be lowercase kebab-case
2. Entity name must be PascalCase
3. Slice name cannot conflict with existing slices
4. All 5 identity composers must be registered
5. Path aliases must follow exact pattern (3 per layer)

### TSConfig Requirements

```json
{
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "build/esm",
    "declarationDir": "build/dts"
  }
}
```

### Package.json Requirements

```json
{
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./package.json": "./package.json",
    "./*": "./src/*.ts"
  }
}
```

---

## 7. Milestone 2 Technical Research Findings

### 7.1 ts-morph API Patterns

**Research File**: `research/ts-morph-patterns.md` (32KB, Efficiency: 8.5/10)

**Key Findings**:
- Use high-level APIs: `addImportDeclaration()`, `addExportDeclaration()` for most operations
- For `Layer.mergeAll([...])` modification: find `CallExpression`, get `ArrayLiteralExpression`, use `replaceWithText()`
- **Critical**: Don't use ts-morph for JSON/JSONC files - use `jsonc-parser` instead
- Always call `organizeImports()` after modifications, `save()` once at the end

**Service Pattern**:
```typescript
class TsMorphService extends Effect.Service<TsMorphService>()("TsMorphService", {
  effect: Effect.gen(function* () {
    const project = new Project({ skipAddingFilesFromTsConfig: true });
    return {
      modifyFile: (filePath, modifications) => /* ... */,
      addImport: (filePath, moduleSpecifier, namedImports) => /* ... */,
      addExport: (filePath, moduleSpecifier) => /* ... */,
    };
  }),
}) {}
```

**Error Types**:
- `FileNotFoundError` - File doesn't exist
- `NodeNotFoundError` - Target AST node not found
- `InvalidNodeTypeError` - Node is wrong type

### 7.2 Handlebars Template Patterns

**Research File**: `research/handlebars-patterns.md` (25KB, Efficiency: 9/10)

**Key Findings**:
- Handlebars 4.7.8 already in `node_modules/` (transitive dependency)
- Use `noEscape: true` for code generation (no HTML escaping)
- Leverage Effect String module for case transformations in helpers

**Custom Helpers Using Effect**:
```typescript
import * as Str from "effect/String";

Handlebars.registerHelper("pascalCase", Str.capitalize);
Handlebars.registerHelper("snakeCase", (str) => F.pipe(str, Str.camelToSnake));
```

**Template Organization**:
```
tooling/cli/src/templates/
├── domain/
│   ├── package.json.hbs
│   └── src/index.ts.hbs
├── tables/
├── server/
└── partials/
    └── header.hbs
```

**SliceContext Type** (pre-compute all case variants):
```typescript
interface SliceContext {
  sliceName: string;        // "notifications"
  SliceName: string;        // "Notifications"
  SLICE_NAME: string;       // "NOTIFICATIONS"
  slice_name: string;       // "notifications"
  sliceDescription: string;
}
```

### 7.3 Effect CLI Deep Dive

**Research File**: `research/effect-cli-patterns.md` (34KB, Efficiency: 9/10)

**Key Findings**:
- Use `Command.make()` with `Options` and `Args` from `@effect/cli`
- Interactive prompts via `@effect/cli/Prompt` (text, confirm, select)
- Commands return `Effect<void, E, R>` - wire dependencies via `Command.provide()`

**Command Pattern**:
```typescript
import { Command, Options } from "@effect/cli";

const nameOption = Options.text("name").pipe(
  Options.withAlias("n"),
  Options.withDescription("Name of the new slice")
);

const createSliceCommand = Command.make("create-slice", { name: nameOption }, ({ name }) =>
  Effect.gen(function* () {
    // Implementation using services
  })
).pipe(
  Command.withDescription("Scaffold a new vertical slice"),
  Command.provide(/* layers */)
);
```

**Prompt Pattern** (for interactive mode):
```typescript
import * as Prompt from "@effect/cli/Prompt";

const getName = Prompt.text({
  message: "Enter slice name:",
  validate: (input) => input.length > 0 ? Effect.succeed(input) : Effect.fail("Required")
});
```

### 7.4 Tooling Utils

**Research File**: `research/tooling-utils.md` (12KB, Efficiency: 9/10)

**Key Findings**:
- `FsUtils` provides 16 file operations (readJson, writeJson, mkdirCached, etc.)
- `RepoUtils` provides monorepo navigation (findRepoRoot, getWorkspaceDir)
- `FsUtils.mkdirCached` uses Effect caching - efficient for bulk directory creation
- `RepoUtilsLive` includes `FsUtilsLive` - single Layer.provide is sufficient

**Usage in create-slice**:
```typescript
const createSlice = Effect.gen(function* () {
  const fs = yield* FsUtils;
  const repo = yield* RepoUtils;

  const repoRoot = yield* repo.REPOSITORY_ROOT;
  const sliceDir = `${repoRoot}/packages/${sliceName}`;

  yield* fs.mkdirCached(sliceDir);
  yield* fs.writeJson(`${sliceDir}/package.json`, packageJson);
});
```

---

## 8. Resolved Questions (from M1)

### Architecture Questions

1. **Template Storage**: ✅ **RESOLVED** - Use Handlebars `.hbs` files loaded from `tooling/cli/src/templates/`
   - Provides editability without recompilation
   - Template cache via HashMap for performance

2. **Validation Strategy**: ✅ **RESOLVED** - Effect-based validation with Schema
   - Use `S.decodeUnknown` for input validation
   - Tagged errors for each validation failure type

3. **Dry-Run Implementation**: ✅ **RESOLVED** - Full preview with file diff output
   - Collect all operations, display without executing
   - Show "would create", "would modify" for each file

### Implementation Questions

4. **ts-morph vs String Manipulation**: ✅ **RESOLVED**
   - **Handlebars**: Generate new files from templates
   - **ts-morph**: Modify existing TypeScript files (add exports, imports, array elements)
   - **jsonc-parser**: Modify tsconfig.json files (preserve comments)

5. **Error Recovery**: ✅ **RESOLVED** - Track and rollback on failure
   - Collect created files in array during execution
   - On error, delete created files in reverse order

6. **Interactive Mode**: ✅ **RESOLVED** - Yes, using `@effect/cli/Prompt`
   - Prompt for missing required options
   - Confirm before proceeding in non-dry-run mode

### Integration Questions

7. **Database Migrations**: ✅ **RESOLVED** - Defer to `beep db:generate`
   - Create-slice only scaffolds schema files
   - User runs `bun run db:generate` separately

8. **Testing Scaffolds**: ✅ **RESOLVED** - Minimal test file per layer
   - Generate `test/index.test.ts` with Effect test harness import
   - Single "placeholder" test to validate setup

---

## 9. References

### Milestone 1 Research Documents

| Document | Path | Content |
|----------|------|---------|
| CLI Architecture Patterns | `outputs/milestone-1/cli-architecture-patterns.md` | Command registration, options, layers |
| Vertical Slice Patterns | `outputs/milestone-1/vertical-slice-patterns.md` | 5-sub-package structure, models, repos |
| Integration Points Map | `outputs/milestone-1/integration-points-map.md` | 9 integration points with before/after |
| TSConfig Patterns | `outputs/milestone-1/tsconfig-patterns.md` | Path aliases, references, generation |

### Milestone 2 Technical Research Documents

| Document | Path | Efficiency | Content |
|----------|------|------------|---------|
| ts-morph Patterns | `research/ts-morph-patterns.md` | 8.5/10 | AST manipulation, imports, exports, array modification |
| Handlebars Patterns | `research/handlebars-patterns.md` | 9/10 | Template compilation, helpers, Effect integration |
| Effect CLI Patterns | `research/effect-cli-patterns.md` | 9/10 | Command, Options, Args, Prompt APIs |
| Tooling Utils | `research/tooling-utils.md` | 9/10 | FsUtils, RepoUtils service patterns |

### Example Implementations

| Slice | Complexity | Use As |
|-------|------------|--------|
| `packages/customization/*` | Minimal (3 layers) | Baseline template |
| `packages/documents/*` | Complete (5 layers) | Extended template |

### Key Source Files

| File | Purpose |
|------|---------|
| `tooling/cli/src/index.ts` | CLI entry point pattern |
| `tooling/cli/src/commands/docgen/analyze.ts` | Complex command example |
| `packages/shared/domain/src/entity-ids/` | Entity ID registration |
| `packages/runtime/server/src/Persistence.layer.ts` | Runtime wiring |

---

## Appendix A: File Generation Counts

### Minimal Slice (3 layers)

| Category | Count |
|----------|-------|
| Directories | 3 |
| package.json | 3 |
| tsconfig files | 12 (4 per layer) |
| Source files | ~15 |
| Integration modifications | 9 |
| **Total new files** | ~33 |

### Complete Slice (5 layers)

| Category | Count |
|----------|-------|
| Directories | 5 |
| package.json | 5 |
| tsconfig files | 20 (4 per layer) |
| Source files | ~25 |
| Integration modifications | 9 |
| **Total new files** | ~54 |

---

## Appendix B: Dependency Graph

```
tsconfig.base.jsonc (path aliases)
         |
         v
packages/common/identity/src/packages.ts (composers)
         |
         v
packages/shared/domain/src/entity-ids/{slice}/ (entity IDs)
         |
         v
packages/{slice}/domain/ (models using entity IDs)
         |
         v
packages/{slice}/tables/ (tables using entity IDs)
         |
         v
packages/{slice}/server/ (db client + repos)
         |
         +--> packages/_internal/db-admin/src/tables.ts
         |
         +--> packages/_internal/db-admin/src/slice-relations.ts
         |
         v
packages/runtime/server/src/Persistence.layer.ts (wire db client)
         |
         v
packages/runtime/server/src/DataAccess.layer.ts (wire repos)
         |
         v
tsconfig.slices/{slice}.json (build references)
         |
         v
tsconfig.json (root reference)
```
