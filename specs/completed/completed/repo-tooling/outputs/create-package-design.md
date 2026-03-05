# create-package Design Document

## Architecture Decisions

### 1. Handlebars for Templates

**Decision**: Use Handlebars (.hbs) templates for file generation instead of string concatenation.

**Rationale**:
- Templates are readable and maintainable by non-developers
- Separation of content from logic
- Handlebars is lightweight, zero-dependency (aside from `handlebars` npm package)
- Established pattern from legacy beep-effect (create-slice uses HBS templates)
- Templates can be inspected/modified without touching TypeScript

**Trade-off**: Adds `handlebars` as a dependency to `@beep/repo-cli`. This is acceptable since cli is a dev-only tool, not shipped to production.

### 2. package.json: Schema Validation Preserved

**Decision**: Keep package.json generation in TypeScript with Schema validation. Do NOT use a pure HBS template for package.json.

**Rationale**:
- The PackageJson Schema validates structure at generation time
- Conditional logic (tool deps, app dirs) is cleaner in TypeScript
- `encodePackageJsonPrettyEffect` already handles serialization
- Template would need complex conditionals that defeat the purpose of HBS

**Implementation**: Build package.json object in TypeScript, validate through Schema, serialize with `jsonStringifyPretty`. The HBS template in the templates directory serves as documentation only.

### 3. CLAUDE.md as Symlink

**Decision**: Create `CLAUDE.md` as a symbolic link to `AGENTS.md`.

**Rationale**:
- Single source of truth for agent/contributor documentation
- Pattern established across all packages in legacy beep-effect
- Both Claude Code and other AI tools read from the same content
- No content drift between the two files

**Implementation**: Use `FileSystem.symlink("AGENTS.md", claudeMdPath)` (relative symlink).

### 4. Static vs Templated Files

**Decision**: Only use HBS templates for files that need variable interpolation. Static files are generated directly.

| File | Method | Reason |
|------|--------|--------|
| package.json | TypeScript + Schema | Conditional logic, Schema validation |
| tsconfig.json | HBS template | Simple, but may vary by type in future |
| src/index.ts | HBS template | Needs scopedName variable |
| LICENSE | HBS template | Needs year variable |
| README.md | HBS template | Needs name, description |
| AGENTS.md | HBS template | Needs name, description |
| ai-context.md | HBS template | Needs path, name, description |
| docgen.json | HBS template | Needs parentDir, name |
| vitest.config.ts | Static string | Identical across all packages |
| docs/index.md | Static string | Identical across all packages |
| test/.gitkeep | Empty | Directory marker |
| dtslint/.gitkeep | Empty | Directory marker |
| CLAUDE.md | Symlink | Points to AGENTS.md |

### 5. Template Loading Strategy

**Decision**: Load templates at module scope using `import.meta.dirname` + `FileSystem.readFileString`.

**Rationale**:
- Templates are co-located with the command handler
- Read templates once per invocation (not per file)
- Effect FileSystem service provides consistent error handling

**Implementation**:
```ts
const loadTemplate = (
  fs: FileSystem.FileSystem,
  templateDir: string,
  name: string
): Effect.Effect<HandlebarsTemplateDelegate, DomainError> =>
  Effect.fn(function* () {
    const raw = yield* fs.readFileString(path.join(templateDir, name)).pipe(
      Effect.mapError((e) => new DomainError({ message: `Failed to read template ${name}: ${e.message}` }))
    );
    return Handlebars.compile(raw);
  });
```

### 6. Description Flag

**Decision**: Add an optional `--description` flag to the create-package command.

**Rationale**:
- AGENTS.md, ai-context.md, and README.md all need a description
- Better to capture at creation time than leave blank placeholders
- Optional - defaults to empty string if not provided

**Implementation**:
```ts
description: Flag.string("description").pipe(
  Flag.withDescription("Package description"),
  Flag.withDefault("")
)
```

## Handler Refactor Plan

### Current Structure (single file)
```
tooling/cli/src/commands/create-package.ts
```

### Target Structure (directory)
```
tooling/cli/src/commands/create-package/
├── index.ts            # Re-exports command
├── handler.ts          # Command definition + handler logic
└── templates/
    ├── tsconfig.json.hbs
    ├── src-index.ts.hbs
    ├── LICENSE.hbs
    ├── README.md.hbs
    ├── AGENTS.md.hbs
    ├── ai-context.md.hbs
    ├── docgen.json.hbs
    └── docs-index.md.hbs
```

### Migration Steps

1. Create `tooling/cli/src/commands/create-package/` directory
2. Move `create-package.ts` to `create-package/handler.ts`
3. Create `create-package/index.ts` with re-export
4. Update `tooling/cli/src/index.ts` import path
5. Create templates directory with all `.hbs` files
6. Refactor handler to:
   - Add `--description` flag
   - Load and compile HBS templates
   - Generate all new files (LICENSE, README, AGENTS, ai-context, docgen, vitest, etc.)
   - Create CLAUDE.md symlink
   - Expand dry-run output to include all new files
7. Update tests to verify all generated files
8. Update `tooling/cli/src/bin.ts` import if needed

### Dependency Changes

Add to root `package.json` catalog:
```json
"handlebars": "^4.7.8"
```

Add to `tooling/cli/package.json`:
```json
"dependencies": {
  "handlebars": "catalog:"
}
```

## Test Plan

### Existing Tests to Preserve
- Dry-run for library/tool/app types
- Real file creation with cleanup
- Directory existence validation
- package.json content verification
- index.ts content verification
- Failure when directory already exists

### New Tests to Add
- LICENSE contains MIT text with current year
- README.md contains package name and description
- AGENTS.md contains canonical sections (Purpose & Fit, Surface Map, etc.)
- ai-context.md has correct YAML frontmatter (path, summary, tags)
- CLAUDE.md is a symlink pointing to AGENTS.md
- docgen.json has correct schema path and package path alias
- vitest.config.ts imports shared config
- docs/index.md has front matter
- dtslint/.gitkeep exists
- Dry-run output lists all 13 files
- Description flag populates README, AGENTS, and ai-context
- Template rendering with special characters in description

### Test Helpers Needed
- `readSymlink(path)` - verify symlink target
- Template output assertion helpers (check key sections exist)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Handlebars dependency bloat | Low | Low | handlebars is ~115KB, dev-only |
| Template path resolution | Medium | Medium | Use `import.meta.dirname` for reliable resolution |
| Symlink creation on Windows | Low | Low | We're on Linux/Mac; Effect FileSystem handles cross-platform |
| Breaking existing tests | Medium | High | Run all quality checks after each change |
| HBS escaping issues | Low | Medium | Use `{{{triple-braces}}}` for unescaped output in code templates |
