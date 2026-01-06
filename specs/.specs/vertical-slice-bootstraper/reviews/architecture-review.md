# Architecture Review - create-slice CLI

## Summary

The `create-slice` CLI command is a substantial code generation tool (approximately 2,500+ lines across 6 main files) that scaffolds vertical slices in the beep-effect monorepo. The architecture shows clear separation into services with Effect-first patterns, but suffers from significant duplication between inline generators and `.hbs` template files, a god-function problem in `file-generator.ts`, and an unused template service.

Overall assessment: **Functional but needs refactoring** - The command works but has accumulated technical debt that will make maintenance difficult.

---

## Critical Issues

### 1. Massive Duplication: Inline Generators vs .hbs Templates

**Severity: Critical**

The codebase maintains **two parallel implementations** for generating the same files:

| File | Inline Generator (file-generator.ts) | .hbs Template |
|------|-------------------------------------|---------------|
| domain/src/index.ts | Lines 383-398 | `templates/domain/src/index.ts.hbs` |
| server/src/db/Db/Db.ts | Lines 696-714 | `templates/server/src/db/Db/Db.ts.hbs` |
| server/src/db/repos/Placeholder.repo.ts | Lines 749-769 | `templates/server/src/db/repos/Placeholder.repo.ts.hbs` |
| tables/src/tables/placeholder.table.ts | Lines 606-636 | `templates/tables/src/tables/placeholder.table.ts.hbs` |
| tables/src/relations.ts | Lines 641-675 | `templates/tables/src/relations.ts.hbs` |
| All package.json files | Lines 85-244 | `templates/{layer}/package.json.hbs` |
| All tsconfig files | Lines 249-372 | `templates/common/tsconfig.*.json.hbs` |
| domain/src/entities/Placeholder/Placeholder.model.ts | Lines 516-572 | `templates/domain/src/entities/Placeholder/Placeholder.model.ts.hbs` |

The inline generators are **actively used** (the code generates from them), while the `.hbs` templates appear to be either:
- A previous implementation that was replaced but never deleted, OR
- A planned future implementation that was never completed

**Evidence:**
- `file-generator.ts` does NOT read any `.hbs` files
- `TemplateService` in `template.ts` is partially implemented but NOT used by `file-generator.ts`
- The `.hbs` files have slight differences from inline generators (e.g., `package.json.hbs` has `"private": true` but inline generator does not)

### 2. Dead Code: Unused TemplateService

**Severity: High**

`utils/template.ts` defines:
- `ITemplateService` interface (lines 154-179)
- `TemplateServiceLive` layer (line 390)
- `PACKAGE_JSON_TEMPLATES` (lines 195-235) - different from inline generators
- `INDEX_TS_TEMPLATES` (lines 288-339) - different from inline generators

**None of this is used.** The `file-generator.ts` generates content inline without using `TemplateService`. The service is:
- Not in the dependency list of `FileGeneratorService` (line 976)
- Not imported in `handler.ts`
- Not part of `CreateSliceServiceLayer` in `index.ts`

### 3. God Function: `file-generator.ts` createPlan Method

**Severity: High**

The `createPlan` method (lines 988-1203) is a 215-line function that:
- Builds directory lists
- Generates all files for all 5 layers
- Handles 30+ distinct file types
- Contains complex conditional logic

This violates single responsibility and makes the function extremely difficult to:
- Test in isolation
- Modify without risk
- Understand at a glance

---

## Recommendations

### High Priority

#### R1: Eliminate Template Duplication
Choose ONE approach and delete the other:

**Option A (Recommended): Keep inline generators, delete .hbs files**
- Inline generators are actively working
- They allow type-safe template composition
- Delete all `.hbs` files and unused `TemplateService`

**Option B: Migrate to .hbs templates**
- Requires significant work to wire up template loading
- Templates are more maintainable for non-developers
- Better separation of content from logic

#### R2: Split `file-generator.ts` Into Focused Modules

Current: 1,300 lines in one file

Proposed structure:
```
utils/
  file-generator/
    index.ts              # FileGeneratorService facade
    plan-builder.ts       # createPlan logic
    generators/
      index.ts            # Export all generators
      package-json.ts     # generatePackageJson
      tsconfig.ts         # All tsconfig generators
      domain.ts           # Domain layer files
      tables.ts           # Tables layer files
      server.ts           # Server layer files
      client-ui.ts        # Client/UI layer files
      entity-ids.ts       # Entity ID files
```

#### R3: Remove Dead TemplateService Code

Delete or use:
- `utils/template.ts` lines 154-391 (service implementation)
- `PACKAGE_JSON_TEMPLATES` constant
- `INDEX_TS_TEMPLATES` constant
- `TSCONFIG_*` constants

Keep:
- `SliceContext` interface
- `createSliceContext` function
- Case transformation helpers
- Handlebars helper registration (if templates are kept)

### Medium Priority

#### R4: Extract TSConfig Update Logic from Handler

`handler.ts` contains tsconfig update functions (lines 49-162) that should be in `config-updater.ts`. The handler should only orchestrate, not implement file manipulation.

#### R5: Consolidate Layer Constants

Multiple files define layer arrays:
- `file-generator.ts` line 43: `LAYERS = ["domain", "tables", "server", "client", "ui"]`
- `ts-morph.ts` line 42: `LAYER_SUFFIXES = ["Domain", "Tables", "Server", "Client", "Ui"]`
- `ts-morph.ts` line 49: `PACKAGE_SUFFIXES = ["domain", "tables", "server", "client", "ui"]`
- `template.ts` line 184: `LayerType = "domain" | "tables" | "server" | "client" | "ui"`

Create a single source of truth in a `constants.ts` file.

#### R6: Use Effect Match for Layer Switching

Multiple switch statements and if-else chains should use `Match.exhaustive`:

`file-generator.ts` line 384-464 `generateSrcIndex`:
```typescript
// Current (switch statement)
switch (layer) {
  case "domain": ...
  case "tables": ...
  // etc
}

// Should be
Match.value(layer).pipe(
  Match.tag("domain", () => ...),
  Match.tag("tables", () => ...),
  Match.exhaustive
)
```

### Low Priority

#### R7: Inconsistent Package.json Generation

Compare inline vs .hbs:
- Inline (line 196): `"publishConfig": { "access": "public", ... }`
- .hbs (line 4): `"private": true`

These generate different outputs. Determine which is correct.

#### R8: Dynamic jsonc-parser Import

`handler.ts` lines 63-66 and 115-118 dynamically import `jsonc-parser` twice:
```typescript
const jsonc = yield* Effect.tryPromise({
  try: () => import("jsonc-parser"),
  catch: (cause) => new FileWriteError({ filePath, cause }),
});
```

This should be imported once at the module level or cached in a service.

---

## Detailed Analysis

### Code Organization

#### File Structure
```
create-slice/
  index.ts          - Command definition & layer composition
  handler.ts        - Orchestration & tsconfig updates (mixed concerns)
  schemas.ts        - Input validation
  errors.ts         - Tagged error types
  utils/
    index.ts        - Barrel export
    file-generator.ts  - File generation (1,300 lines - too large)
    config-updater.ts  - Package.json & tsconfig updates
    ts-morph.ts     - AST manipulation
    template.ts     - UNUSED template service
  templates/        - UNUSED .hbs templates
```

**Issues:**
1. `handler.ts` has tsconfig update logic that belongs in `config-updater.ts`
2. `file-generator.ts` is too large - 35+ functions, 1,300 lines
3. `templates/` directory is unused dead code
4. `template.ts` is partially implemented but unused

#### Module Dependencies

```
index.ts
  -> handler.ts
     -> file-generator.ts (FileGeneratorService)
     -> ts-morph.ts (TsMorphService)
     -> config-updater.ts (ConfigUpdaterService)
     -> template.ts (only for createSliceContext)
```

No circular dependencies detected - this is good.

### DRY Violations

#### 1. Package.json Generation (Critical)
Location: `file-generator.ts` lines 85-244 vs `templates/*/package.json.hbs`

The inline generator has 160 lines building package.json structures. The .hbs templates exist but are unused.

#### 2. TSConfig Generation
Location: `file-generator.ts` lines 249-372 vs `templates/common/tsconfig.*.json.hbs`

Four tsconfig generator functions (80 lines) duplicate functionality that exists in .hbs templates.

#### 3. Index.ts Generation
Location: `file-generator.ts` lines 383-464 vs `templates/*/src/index.ts.hbs`

Each layer's index.ts has both inline generation and .hbs template.

#### 4. Placeholder File Generation
Multiple inline generators for placeholder files that have .hbs counterparts:
- `generatePlaceholderModel` (lines 516-572) vs `Placeholder.model.ts.hbs`
- `generatePlaceholderTable` (lines 606-636) vs `placeholder.table.ts.hbs`
- `generatePlaceholderRepo` (lines 749-769) vs `Placeholder.repo.ts.hbs`

#### 5. Layer Iteration Patterns
`createPlan` method iterates over layers 3 times with similar patterns:
- Lines 998-1015: Directory creation
- Lines 1022-1074: Common file generation per layer
- Lines 1076-1170: Layer-specific file generation

These could be unified into a single iteration with a per-layer configuration object.

### Naming Conventions

**Consistent:**
- Service classes: `*Service` suffix
- Live layers: `*ServiceLive` or `Service.Default`
- Error classes: `*Error` suffix
- PascalCase for types, camelCase for functions

**Inconsistent:**
- Generator functions mix naming: `generatePackageJson`, `generateTsconfigJson`, `generateEntityIdsTs`, `generateServerDbDbTs`
- Some use full names (`generateTsconfigBuild`), others abbreviate (`generateServerDbDbTs`)
- Template context uses both `sliceName` and `SliceName` but also `slice_name` and `SLICE_NAME`

**Recommendation:** Standardize generator naming to `generate{Layer}{FileType}Content`

### Module Structure & Encapsulation

**Good:**
- Services properly use Effect.Service pattern
- Layers are well-defined with dependencies
- Error types are properly exported

**Issues:**
- `file-generator.ts` exports everything at module level (35+ exports)
- Internal helpers like `parseBatches`, `findSmallestBatch` are not marked `@internal`
- Generator functions are not grouped - flat export structure

**Recommendation:** Use nested exports:
```typescript
export const FileGeneratorService = {
  // Service implementation
  generators: {
    packageJson: generatePackageJson,
    tsconfig: {
      main: generateTsconfigJson,
      src: generateTsconfigSrc,
      // ...
    },
    // ...
  }
};
```

### Dependencies

**External dependencies used:**
- `ts-morph` - TypeScript AST manipulation
- `handlebars` - Template engine (registered helpers, but not used for generation)
- `jsonc-parser` - JSON with comments parsing

**Potential unnecessary dependencies:**
- `handlebars` - Only used for helper registration and unused TemplateService

**Missing dependencies:**
- None identified

### Error Handling

**Good:**
- All errors are `S.TaggedError` subclasses
- Each has a `displayMessage` getter
- Errors include cause chain support
- Typed error union `CreateSliceError`

**Issues:**
- `TemplateError` is defined but never thrown (dead code)
- Error wrapping is verbose - could use Effect error mapping patterns more consistently

### Performance Considerations

**Good:**
- `ts-morph` project created with `skipAddingFilesFromTsConfig: true`
- File writes use `concurrency: 10`
- Directory creation is sequential (correct - must ensure parents exist)

**Potential Issues:**
- `jsonc-parser` is dynamically imported twice per run
- No caching of parsed tsconfig content when multiple updates occur

---

## Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Total Lines of Code | ~2,600 | High |
| Files in Command | 12 (6 main + 6 utils) | Acceptable |
| Largest File | file-generator.ts (1,300 lines) | Too Large |
| Functions in file-generator.ts | 35+ | Too Many |
| Unused Template Files | 30+ | Technical Debt |
| Unused Code (template.ts) | ~240 lines | Technical Debt |
| Test Coverage | Unknown (no tests visible) | Risk |

---

## Action Items

1. **Immediate (before next feature):**
   - Delete unused `.hbs` template files
   - Delete unused `TemplateService` code
   - Move tsconfig update functions from `handler.ts` to `config-updater.ts`

2. **Short-term (next sprint):**
   - Split `file-generator.ts` into focused modules
   - Consolidate layer constants
   - Add unit tests for generator functions

3. **Medium-term:**
   - Standardize naming conventions
   - Implement proper encapsulation with nested exports
   - Cache jsonc-parser import

---

## Files Reviewed

| File | Lines | Assessment |
|------|-------|------------|
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/index.ts` | 185 | Good - clean command definition |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/handler.ts` | 300 | Mixed concerns - tsconfig logic should move |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/schemas.ts` | 219 | Good - clean validation |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/errors.ts` | 252 | Good - proper tagged errors |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/utils/file-generator.ts` | 1,301 | Needs refactoring - too large |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/utils/config-updater.ts` | 600 | Good - focused service |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/utils/ts-morph.ts` | 731 | Good - focused service |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/utils/template.ts` | 391 | Mostly unused - delete or use |
| `/home/elpresidank/YeeBois/projects/beep-effect/tooling/cli/src/commands/create-slice/utils/index.ts` | 14 | Good - barrel export |
| `templates/**/*.hbs` | ~30 files | Unused - delete or use |
