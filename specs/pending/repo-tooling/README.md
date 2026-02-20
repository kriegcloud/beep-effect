# Repo Tooling: create-package Overhaul

## Status
ACTIVE

## Purpose
Overhaul the `beep create-package` CLI command to scaffold production-ready packages with Handlebars templates, full config bootstrapping (LICENSE, README, AGENTS.md, ai-context.md, CLAUDE.md symlink, docgen.json, vitest.config.ts), and alignment with established beep-effect conventions.

## Scope

### In Scope
- Handlebars (.hbs) template system for all generated files
- Template directory at `tooling/cli/src/commands/create-package/templates/`
- Generated file inventory: package.json, tsconfig.json, src/index.ts, test/.gitkeep, LICENSE, README.md, AGENTS.md, ai-context.md, CLAUDE.md (symlink), docgen.json, vitest.config.ts, dtslint/.gitkeep, docs/index.md
- Three package types: `library`, `tool`, `app` (existing behavior preserved)
- Interactive `--description` flag for package description
- Dry-run mode (existing behavior preserved)
- Comprehensive test coverage for all generated files
- Type tests (dtslint) for any new public API changes

### Out of Scope
- Package publishing workflow
- Codegen pipeline integration (separate `codegen` command)
- Monorepo-wide tsconfig.packages.json auto-registration (tracked in cli-next-steps)
- Turbo pipeline auto-registration

## Success Criteria
- [ ] All generated files use Handlebars templates (no string concatenation in handler)
- [ ] `handlebars` added to root dependency catalog and cli package
- [ ] Template directory contains one `.hbs` file per generated output
- [ ] `LICENSE` file generated with MIT license text (matches existing package pattern)
- [ ] `README.md` generated with package name, description placeholder, and standard sections
- [ ] `AGENTS.md` generated with canonical structure (Purpose & Fit, Surface Map, Guardrails, Verifications, Contributor Checklist)
- [ ] `ai-context.md` generated with YAML frontmatter (path, summary, tags) and skeleton sections
- [ ] `CLAUDE.md` created as symlink to `AGENTS.md`
- [ ] `docgen.json` generated with correct schema path, srcLink, and path aliases
- [ ] `vitest.config.ts` generated with shared config merge pattern
- [ ] `docs/index.md` generated with front matter
- [ ] `dtslint/.gitkeep` generated for type test directory
- [ ] Dry-run mode lists all files including new ones
- [ ] All 135+ existing tests continue to pass
- [ ] New tests cover every generated file's content and structure
- [ ] Type tests pass (`bun run test:types`)
- [ ] Full quality checks pass (build, check, test, lint)
- [ ] Core scaffolding modules are reusable by a new `create-slice` implementation
- [ ] Creating `@beep/types` and `@beep/utils` under `packages/common` requires zero manual post-fix work

## Expected Outputs
- `specs/pending/repo-tooling/outputs/create-package-template-inventory.md` - Complete file-by-file template specification
- `specs/pending/repo-tooling/outputs/create-package-design.md` - Architecture decisions, template variable schema, handler refactor plan
- `specs/pending/repo-tooling/outputs/create-slice-reuse-gap-analysis.md` - Gap matrix and concrete extraction targets for create-slice reuse
- Updated `tooling/cli/src/commands/create-package/` directory with templates and handler
- Updated test suite with coverage for all generated files

## Phase Overview

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Research & Design: inventory templates, define variables, design handler architecture | Complete |
| 1 | Template Creation: write all .hbs templates, add handlebars dependency | Complete |
| 2 | Implementation: refactor handler to use templates, add symlink creation, update tests | Complete |
| 3 | Verification: full quality checks, update AGENTS.md/ai-context.md for cli package | Partial (gates not fully green) |
| 4 | Reuse Extraction: make create-package core reusable for `.repos/beep-effect` `create-slice` and close zero-manual baseline gaps | ACTIVE |

## Prior Work
Existing outputs from repo-utils migration (completed):
- [repo-utils-implementation-plan.md](./outputs/repo-utils-implementation-plan.md)
- [repo-utils-legacy-inventory.md](./outputs/repo-utils-legacy-inventory.md)
- [repo-utils-effect-v4-corrections.md](./outputs/repo-utils-effect-v4-corrections.md)
- [repo-utils-handoff-prompt.md](./outputs/repo-utils-handoff-prompt.md)
- [repo-utils-README.md](./outputs/repo-utils-README.md)

## Current State

### What create-package generates today (13 files + root config updates)
| File | Method | Content |
|------|--------|---------|
| `package.json` | Effect.fn + `encodePackageJsonPrettyEffect` | Full npm metadata, Effect v4 deps, scripts |
| `tsconfig.json` | Handlebars template | Extends root config using package-depth-aware relative path |
| `src/index.ts` | Handlebars template | Module JSDoc + VERSION export |
| `test/.gitkeep` | Static write | Directory marker |
| `dtslint/.gitkeep` | Static write | Type test directory marker |
| `LICENSE` | Handlebars template | MIT license |
| `README.md` | Handlebars template | Package docs skeleton |
| `AGENTS.md` | Handlebars template | Contributor/agent guidance |
| `ai-context.md` | Handlebars template | YAML frontmatter + context skeleton |
| `CLAUDE.md` | Symlink | Symlink target: `AGENTS.md` |
| `docgen.json` | Handlebars template | Package-specific docgen config |
| `vitest.config.ts` | Handlebars template | Shared vitest merge config |
| `docs/index.md` | Handlebars template | Docs front matter |

### What well-structured packages contain (target state)
| File | Purpose | Template Vars |
|------|---------|---------------|
| `package.json` | npm metadata, deps, scripts, exports | name, type, description |
| `tsconfig.json` | TypeScript config extending base | (none - static per type) |
| `src/index.ts` | Module entry with VERSION | name |
| `test/.gitkeep` | Test directory marker | (none) |
| `LICENSE` | MIT license text | year |
| `README.md` | Package documentation | name, description |
| `AGENTS.md` | Agent/contributor guide | name, description |
| `ai-context.md` | AI context with YAML frontmatter | name, parentDir, description |
| `CLAUDE.md` | Symlink to AGENTS.md | (symlink, no template) |
| `docgen.json` | @effect/docgen configuration | name, parentDir |
| `vitest.config.ts` | Test runner config | (none - static) |
| `dtslint/.gitkeep` | Type test directory marker | (none) |
| `docs/index.md` | Generated docs front matter | (none - static) |

### Template Variables
| Variable | Source | Example |
|----------|--------|---------|
| `name` | CLI argument | `my-utils` |
| `scopedName` | Derived: `@beep/${name}` | `@beep/my-utils` |
| `type` | `--type` flag | `library`, `tool`, `app` |
| `description` | `--description` flag | `Utility functions for...` |
| `year` | `new Date().getFullYear()` | `2026` |
| `parentDir` | Derived from type or `--parent-dir` override | `tooling`, `apps`, `packages/common` |
| `packagePath` | Derived: `${parentDir}/${name}` | `packages/common/types` |
| `rootRelative` | Derived from package path depth | `../../`, `../../../` |

## New Phase Trigger (2026-02-20)

`create-package` now scaffolds `packages/common` packages, but reuse requirements for a new `.repos/beep-effect` `create-slice` are still incomplete:

- Core logic is still handler-centric, not service-oriented (`FileGeneratorService`, `ConfigUpdaterService`, `TsMorphService` style modules are missing).
- Verification gates are not reliably green for zero-manual work across the current branch.
- A dedicated extraction phase is required to turn create-package internals into reusable primitives for multi-package slice generation.

See:
- `outputs/create-slice-reuse-gap-analysis.md`
- `handoffs/HANDOFF_P4.md`

## Reference Patterns

### CLAUDE.md Symlink Pattern (from legacy beep-effect)
Every package root has `CLAUDE.md -> AGENTS.md` (symlink). Single source of truth for both Claude Code and other AI tools.

### AGENTS.md Canonical Structure
```
# @beep/{name} Agent Guide
## Purpose & Fit
## Surface Map
## Usage Snapshots
## Authoring Guardrails
## Quick Recipes
## Verifications
## Contributor Checklist
```

### ai-context.md Canonical Structure
```yaml
---
path: {parentDir}/{name}
summary: {description}
tags: [effect, ...]
---
# @beep/{name}
## Architecture
## Core Modules
## Usage Patterns
## Design Decisions
## Dependencies
## Related
```

## Navigation
- [Reflection Log](./REFLECTION_LOG.md) - Learnings & patterns
- [Handoffs](./handoffs/) - Phase transition documents
- [Outputs](./outputs/) - Phase artifacts
