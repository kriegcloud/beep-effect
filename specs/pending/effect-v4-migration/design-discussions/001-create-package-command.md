# Design Discussion: create-package Command

**Date:** 2026-02-18
**Participants:** User, Claude
**Status:** In Progress

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
bun run repo-cli create-package --name foo --type domain
```

### Questions to Resolve

1. **Package types**: What types of packages can be created?
   - domain, tables, server, client, ui (slice sub-packages)
   - tooling packages
   - standalone packages
   - Other?

2. **Template system**: How should templates be structured?
   - Handlebars (like legacy create-slice)?
   - Plain file templates?
   - Programmatic generation?

3. **Required vs optional parameters**:
   - Name (required)
   - Type (required?)
   - Description (optional)
   - Location/scope (inferred or explicit?)

4. **Workspace integration**:
   - Auto-update pnpm-workspace.yaml / package.json workspaces?
   - Auto-update tsconfig paths?
   - Auto-install dependencies?

## Next Steps

1. Define package types and their templates
2. Design template structure
3. Implement command handler
4. Create tests

## Open Questions

- Should we support custom template paths?
- How to handle existing packages (error, skip, merge)?
- Should this command also handle slice sub-package creation or is that `create-slice`'s job?
