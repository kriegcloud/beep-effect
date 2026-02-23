# Phase 0 Handoff: create-package Research & Design Complete

**Date**: 2026-02-19
**Status**: Ready for Phase 1 implementation

## Phase 0 Summary
Research and design phase completed. Outputs:
- `outputs/create-package-template-inventory.md` - File-by-file template specification (13 files)
- `outputs/create-package-design.md` - Architecture decisions and handler refactor plan

Key decisions made:
1. Handlebars for templates (lightweight, established pattern from legacy)
2. package.json stays TypeScript + Schema validation (not pure HBS)
3. CLAUDE.md is a symlink to AGENTS.md
4. Static files (vitest.config.ts, docs/index.md) don't need templates
5. Add `--description` flag to command
6. Restructure single file into directory: `create-package/handler.ts` + `templates/`

## Phase 1 Tasks: Template Creation & Handler Refactor

### Task 1: Add handlebars dependency
1. Add `"handlebars": "^4.7.8"` to root package.json catalog
2. Add `"handlebars": "catalog:"` to `tooling/cli/package.json` dependencies
3. Run `bun install`

### Task 2: Create directory structure
1. Create `tooling/cli/src/commands/create-package/` directory
2. Move `create-package.ts` to `create-package/handler.ts`
3. Create `create-package/index.ts` re-exporting command
4. Update import in `tooling/cli/src/index.ts`
5. Create `create-package/templates/` directory

### Task 3: Write HBS templates
Create all templates per `outputs/create-package-template-inventory.md`:
- `tsconfig.json.hbs`
- `src-index.ts.hbs`
- `LICENSE.hbs`
- `README.md.hbs`
- `AGENTS.md.hbs`
- `ai-context.md.hbs`
- `docgen.json.hbs`
- `docs-index.md.hbs`

### Task 4: Refactor handler
1. Add `--description` flag (optional, defaults to "")
2. Add template loading function (reads .hbs files, compiles with Handlebars)
3. Build template context from CLI args
4. Generate all files: templates + static + symlink
5. Update dry-run output to list all 13 files
6. Create CLAUDE.md as symlink via `fs.symlink("AGENTS.md", claudeMdPath)`

### Task 5: Update tests
1. Update existing tests for new directory structure import
2. Add tests for each new generated file
3. Add test for CLAUDE.md symlink
4. Add test for --description flag
5. Add test for dry-run listing all files

### Task 6: Quality verification
1. `bun run build` - all packages build
2. `bun run check` - no type errors
3. `bun run test` - all tests pass
4. `bun run test:types` - type tests pass
5. `bun run lint:fix && bun run lint` - clean

## Critical Patterns

### Effect v4 Imports
```ts
import { Effect, FileSystem, Path, Schema } from "effect";
import * as Console from "effect/Console";
import { Command, Flag, Argument } from "effect/unstable/cli";
```

### Effect.fn for all generators
```ts
const renderTemplate: (ctx: TemplateContext) => Effect.Effect<string, DomainError> =
  Effect.fn(function* (ctx) { ... });
```

### Symlink creation
```ts
yield* fs.symlink("AGENTS.md", path.join(outputDir, "CLAUDE.md")).pipe(
  Effect.mapError((e) => new DomainError({ message: `Failed to create CLAUDE.md symlink: ${e.message}` }))
);
```

### Template loading
```ts
import Handlebars from "handlebars";
// Templates are in ./templates/ relative to handler.ts
```

## Reference Files
- `tooling/cli/src/commands/create-package.ts` - Current implementation
- `tooling/cli/test/create-package.test.ts` - Current tests
- `tooling/cli/src/index.ts` - CLI entry (update imports)
- `tooling/cli/package.json` - Add handlebars dep
- `package.json` (root) - Add handlebars to catalog
- `specs/completed/repo-tooling/outputs/create-package-template-inventory.md` - Full template specs
- `specs/completed/repo-tooling/outputs/create-package-design.md` - Architecture decisions

## Success Criteria
- [ ] Handlebars installed and importable
- [ ] create-package directory structure created
- [ ] All 8 HBS templates written
- [ ] Handler generates all 13 files
- [ ] CLAUDE.md is a working symlink to AGENTS.md
- [ ] --description flag populates README, AGENTS, ai-context
- [ ] Dry-run lists all 13 files
- [ ] All existing tests continue to pass
- [ ] New tests cover every generated file
- [ ] Full quality checks pass (build, check, test, test:types, lint)

## Next Phase
After completing Phase 1:
1. Update `REFLECTION_LOG.md` with learnings
2. Run `bun run beep create-package test-pkg --dry-run` to verify output
3. Consider Phase 2: update AGENTS.md and ai-context.md for the cli package itself
