# Design Discussion: create-package Command

**Date:** 2026-02-18
**Participants:** User, Claude
**Status:** ✅ Completed (implemented)

## Context

Creating the first command for the new Effect v4 `@beep/repo-cli` package. This command will bootstrap the creation of new packages in the monorepo with proper conventions.

## Problem Statement

Need a CLI command that can:
1. Create new packages with correct structure
2. Enforce naming conventions
3. Generate boilerplate files
4. Update monorepo configuration (workspace, tsconfig paths, etc.)

## Naming Decision

### Options Considered

1. **create-package** ✅ (Selected)
   - Consistent with existing `create-slice` command
   - Clear and self-documenting
   - Natural counterpart: slice = multiple packages, package = single package

2. **new-pkg**
   - Concise, follows package manager patterns
   - Less explicit than create-package

3. **scaffold-package**
   - Emphasizes code generation
   - Slightly verbose

4. **init-package**
   - Familiar init pattern
   - Could be confused with package initialization vs creation

5. **add-package**
   - Emphasizes adding to monorepo
   - Less common pattern

### Rationale

Chose `create-package` for consistency with `create-slice` and clarity.

## Command Design

### Basic Usage

```bash
bun run beep create-package --name foo --type library
```

### Questions to Resolve (Resolved)

1. **Package types**
   - Resolved: `library`, `tool`, `app`.

2. **Template system**
   - Resolved: Handlebars templates under `src/commands/create-package/templates/`.

3. **Required vs optional parameters**
   - Resolved: name required, `--type` optional (default `library`), `--description` optional.

4. **Workspace integration**
   - Resolved: auto-updates `tsconfig.packages.json` references and root `tsconfig.json` aliases.
   - Explicitly not part of this command: dependency installation.

## Final Disposition

1. ✅ Defined package types and template strategy.
2. ✅ Implemented command handler and template rendering flow.
3. ✅ Added tests for file generation, dry-run, config updates, validation, and error paths.
4. ⏭️ Remaining robustness issues are tracked in `specs/completed/repo-cli-quality-hardening/README.md`.
